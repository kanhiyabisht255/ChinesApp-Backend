import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Progress, ReadingStory, User, UserReadingProgress } from '../models';
import type { AuthRequest } from '../types';
import { getRequestLanguage, localizeReadingStory } from '../services/localization.service';
import { hasActivePremium } from '../services/entitlement.service';
import { localWeekdayIndex, localWeekKey, normalizeTimezoneOffset, recordLearningActivity } from '../services/streak.service';

const idOrSlugQuery = (value: string): Record<string, unknown> =>
  mongoose.isValidObjectId(value)
    ? { $or: [{ _id: value }, { slug: value }] }
    : { slug: value };

const hasPremiumAccess = async (req: Request): Promise<boolean> => {
  const userId = (req as AuthRequest).userId;
  if (!userId) return false;
  const user = await User.findById(userId).select('isPremium premiumExpiry').lean();
  return Boolean(user && hasActivePremium(user));
};

const redactPremiumStory = (story: Record<string, any>): Record<string, any> => ({
  ...story,
  paragraphs: [],
  vocabulary: [],
  questions: [],
  isLocked: true,
});

export const getReadingStories = async (req: Request, res: Response): Promise<void> => {
  const language = await getRequestLanguage(req);
  const premiumAccess = await hasPremiumAccess(req);
  const filter: Record<string, unknown> = { isPublished: true };
  if (typeof req.query.level === 'string' && ['beginner', 'elementary', 'intermediate', 'advanced'].includes(req.query.level)) {
    filter.level = req.query.level;
  }
  if (typeof req.query.category === 'string' && req.query.category.trim()) {
    filter.category = req.query.category.trim().slice(0, 40);
  }

  const stories = await ReadingStory.find(filter).sort({ order: 1 });
  const userId = (req as AuthRequest).userId;
  const readingProgress = userId
    ? await UserReadingProgress.find({
        userId,
        storyId: { $in: stories.map(story => story._id.toString()) },
      }).lean()
    : [];
  const progressByStory = new Map(readingProgress.map(item => [item.storyId, item]));
  res.json({
    success: true,
    data: stories.map(story => {
      const localized = localizeReadingStory(story, language);
      const userProgress = progressByStory.get(story._id.toString());
      const withProgress = {
        ...localized,
        isLocked: false,
        isCompleted: userProgress?.isCompleted === true,
        bestScore: Number(userProgress?.bestScore || 0),
      };
      return story.isPremium && !premiumAccess ? redactPremiumStory(withProgress) : withProgress;
    }),
  });
};

export const getReadingStory = async (req: Request, res: Response): Promise<void> => {
  const language = await getRequestLanguage(req);
  const story = await ReadingStory.findOne({ ...idOrSlugQuery(req.params.id), isPublished: true });
  if (!story) {
    res.status(404).json({ success: false, message: 'Reading story not found' });
    return;
  }
  if (story.isPremium && !(await hasPremiumAccess(req))) {
    res.status(403).json({ success: false, message: 'Premium subscription required for this reading story' });
    return;
  }
  const userId = (req as AuthRequest).userId;
  const progress = userId
    ? await UserReadingProgress.findOne({ userId, storyId: story._id.toString() }).lean()
    : null;
  res.json({
    success: true,
    data: {
      ...localizeReadingStory(story, language),
      isLocked: false,
      isCompleted: progress?.isCompleted === true,
      bestScore: Number(progress?.bestScore || 0),
    },
  });
};

export const completeReadingStory = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const story = await ReadingStory.findOne({ ...idOrSlugQuery(req.params.id), isPublished: true });
  if (!story) {
    res.status(404).json({ success: false, message: 'Reading story not found' });
    return;
  }
  if (story.isPremium && !(await hasPremiumAccess(req))) {
    res.status(403).json({ success: false, message: 'Premium subscription required for this reading story' });
    return;
  }
  const answers = Array.isArray(req.body.answers) ? req.body.answers.map(String) : [];
  if (story.questions.length > 0 && answers.length === 0) {
    res.status(400).json({ success: false, message: 'Complete the story questions before finishing' });
    return;
  }
  const totalQuestions = story.questions.length;
  const correctAnswers = story.questions.reduce(
    (count, question, index) => count + (answers[index]?.trim() === question.answer.trim() ? 1 : 0),
    0,
  );
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 100;
  const existing = await UserReadingProgress.findOne({
    userId: authReq.userId,
    storyId: story._id.toString(),
  });
  const alreadyCompleted = existing?.isCompleted === true;
  const xpEarned = alreadyCompleted ? 0 : 25;
  const now = new Date();
  const timezoneOffset = normalizeTimezoneOffset(req.header('x-timezone-offset'));
  const streak = await recordLearningActivity(
    authReq.userId,
    timezoneOffset,
    now,
    undefined,
    alreadyCompleted ? 0 : story.estimatedMinutes,
  );
  if (streak === null) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const readingProgress = await UserReadingProgress.findOneAndUpdate(
    { userId: authReq.userId, storyId: story._id.toString() },
    {
      $set: {
        isCompleted: true,
        bestScore: Math.max(Number(existing?.bestScore || 0), score),
        lastReadAt: now,
        completedAt: existing?.completedAt || now,
      },
      $inc: { attempts: 1 },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
  );

  if (xpEarned > 0) {
    await User.findByIdAndUpdate(authReq.userId, { $inc: { xp: xpEarned } });
  }
  const currentProgress = await Progress.findOne({ userId: authReq.userId }).lean();
  const previousReading = Number(currentProgress?.reading || 0);
  const reading = previousReading === 0 ? score : Math.round(previousReading * 0.75 + score * 0.25);
  const skillNames = ['speaking', 'tones', 'vocabulary', 'grammar', 'listening'] as const;
  const overall = Math.round((reading + skillNames.reduce(
    (sum, skill) => sum + Number(currentProgress?.[skill] || 0),
    0,
  )) / 6);
  const progressSet: Record<string, unknown> = { reading, overall, lastUpdated: now };
  if (xpEarned > 0) {
    const weekKey = localWeekKey(now, timezoneOffset);
    const weeklyXp = Array.from(
      { length: 7 },
      (_, index) => currentProgress?.weeklyXpWeek === weekKey ? Number(currentProgress?.weeklyXp?.[index] || 0) : 0,
    );
    weeklyXp[localWeekdayIndex(now, timezoneOffset)] += xpEarned;
    progressSet.weeklyXp = weeklyXp;
    progressSet.weeklyXpWeek = weekKey;
  }
  await Progress.findOneAndUpdate(
    { userId: authReq.userId },
    {
      $set: progressSet,
      ...(alreadyCompleted ? {} : { $inc: { totalSessions: 1, totalMinutes: story.estimatedMinutes } }),
    },
    { upsert: true, setDefaultsOnInsert: true },
  );

  res.json({
    success: true,
    message: alreadyCompleted ? 'Reading score updated' : 'Reading story completed',
    data: {
      correctAnswers,
      totalQuestions,
      score,
      bestScore: Number(readingProgress?.bestScore || score),
      xpEarned,
      alreadyCompleted,
      streak,
    },
  });
};
