import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ListeningLesson, Progress, User, UserListeningProgress } from '../models';
import type { AuthRequest } from '../types';
import { getRequestLanguage, localizeListeningLesson } from '../services/localization.service';
import { hasActivePremium } from '../services/entitlement.service';
import {
  localWeekdayIndex,
  localWeekKey,
  normalizeTimezoneOffset,
  recordLearningActivity,
} from '../services/streak.service';

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

const lockedLesson = (lesson: Record<string, any>): Record<string, any> => ({
  ...lesson,
  preListenTip: '',
  segments: [],
  focusWords: [],
  questions: [],
  isLocked: true,
});

const normalizeAnswer = (value: unknown): string => String(value ?? '')
  .normalize('NFKC')
  .trim()
  .toLocaleLowerCase()
  .replace(/[\s，。！？!?.,；;：“”"'’—–()-]/g, '');

export const getListeningLessons = async (req: Request, res: Response): Promise<void> => {
  const language = await getRequestLanguage(req);
  const premiumAccess = await hasPremiumAccess(req);
  const filter: Record<string, unknown> = { isPublished: true };
  const hskLevel = Number(req.query.hskLevel);
  if (Number.isInteger(hskLevel) && hskLevel >= 1 && hskLevel <= 6) filter.hskLevel = hskLevel;
  if (typeof req.query.level === 'string' && ['beginner', 'elementary', 'intermediate', 'advanced'].includes(req.query.level)) {
    filter.level = req.query.level;
  }
  if (typeof req.query.category === 'string' && req.query.category.trim()) {
    filter.category = req.query.category.trim().slice(0, 40);
  }

  const lessons = await ListeningLesson.find(filter).sort({ order: 1 });
  const userId = (req as AuthRequest).userId;
  const progress = userId
    ? await UserListeningProgress.find({
        userId,
        lessonId: { $in: lessons.map(item => item._id.toString()) },
      }).lean()
    : [];
  const progressByLesson = new Map(progress.map(item => [item.lessonId, item]));

  res.json({
    success: true,
    data: lessons.map(item => {
      const localized = localizeListeningLesson(item, language);
      const userProgress = progressByLesson.get(item._id.toString());
      const payload = {
        ...localized,
        isLocked: false,
        isCompleted: userProgress?.isCompleted === true,
        bestScore: Number(userProgress?.bestScore || 0),
        attempts: Number(userProgress?.attempts || 0),
      };
      return item.isPremium && !premiumAccess ? lockedLesson(payload) : payload;
    }),
  });
};

export const getListeningLesson = async (req: Request, res: Response): Promise<void> => {
  const lesson = await ListeningLesson.findOne({ ...idOrSlugQuery(req.params.id), isPublished: true });
  if (!lesson) {
    res.status(404).json({ success: false, message: 'Listening lesson not found' });
    return;
  }
  if (lesson.isPremium && !(await hasPremiumAccess(req))) {
    res.status(403).json({ success: false, message: 'Premium subscription required for this listening lesson' });
    return;
  }
  const language = await getRequestLanguage(req);
  const userId = (req as AuthRequest).userId;
  const progress = userId
    ? await UserListeningProgress.findOne({ userId, lessonId: lesson._id.toString() }).lean()
    : null;
  res.json({
    success: true,
    data: {
      ...localizeListeningLesson(lesson, language),
      isLocked: false,
      isCompleted: progress?.isCompleted === true,
      bestScore: Number(progress?.bestScore || 0),
      attempts: Number(progress?.attempts || 0),
    },
  });
};

export const completeListeningLesson = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const lesson = await ListeningLesson.findOne({ ...idOrSlugQuery(req.params.id), isPublished: true });
  if (!lesson) {
    res.status(404).json({ success: false, message: 'Listening lesson not found' });
    return;
  }
  if (lesson.isPremium && !(await hasPremiumAccess(req))) {
    res.status(403).json({ success: false, message: 'Premium subscription required for this listening lesson' });
    return;
  }
  const answers = Array.isArray(req.body.answers) ? req.body.answers.map(String) : [];
  if (lesson.questions.length > 0 && answers.length === 0) {
    res.status(400).json({ success: false, message: 'Complete the listening questions before finishing' });
    return;
  }
  const totalQuestions = lesson.questions.length;
  const correctAnswers = lesson.questions.reduce(
    (count, question, index) => count + (
      normalizeAnswer(answers[index]) === normalizeAnswer(question.answer) ? 1 : 0
    ),
    0,
  );
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 100;
  const requestedListenCount = Math.floor(Number(req.body.listenCount));
  const listenCount = Number.isFinite(requestedListenCount)
    ? Math.max(1, Math.min(requestedListenCount, 100))
    : 1;
  const existing = await UserListeningProgress.findOne({
    userId: authReq.userId,
    lessonId: lesson._id.toString(),
  });
  const alreadyCompleted = existing?.isCompleted === true;
  const xpEarned = alreadyCompleted ? 0 : lesson.xpReward;
  const now = new Date();
  const timezoneOffset = normalizeTimezoneOffset(req.header('x-timezone-offset'));
  const streak = await recordLearningActivity(
    authReq.userId,
    timezoneOffset,
    now,
    undefined,
    alreadyCompleted ? 0 : lesson.estimatedMinutes,
  );
  if (streak === null) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const listeningProgress = await UserListeningProgress.findOneAndUpdate(
    { userId: authReq.userId, lessonId: lesson._id.toString() },
    {
      $set: {
        isCompleted: true,
        bestScore: Math.max(Number(existing?.bestScore || 0), score),
        lastListenedAt: now,
        completedAt: existing?.completedAt || now,
      },
      $inc: { attempts: 1, totalListens: listenCount },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
  );

  if (xpEarned > 0) await User.findByIdAndUpdate(authReq.userId, { $inc: { xp: xpEarned } });

  const currentProgress = await Progress.findOne({ userId: authReq.userId }).lean();
  const previousListening = Number(currentProgress?.listening || 0);
  const listening = previousListening === 0 ? score : Math.round(previousListening * 0.75 + score * 0.25);
  const otherSkills = ['speaking', 'tones', 'vocabulary', 'grammar', 'reading'] as const;
  const overall = Math.round((listening + otherSkills.reduce(
    (sum, skill) => sum + Number(currentProgress?.[skill] || 0),
    0,
  )) / 6);
  const progressSet: Record<string, unknown> = { listening, overall, lastUpdated: now };
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
      ...(alreadyCompleted ? {} : { $inc: { totalSessions: 1, totalMinutes: lesson.estimatedMinutes } }),
    },
    { upsert: true, setDefaultsOnInsert: true },
  );

  res.json({
    success: true,
    message: alreadyCompleted ? 'Listening score updated' : 'Listening lesson completed',
    data: {
      correctAnswers,
      totalQuestions,
      score,
      bestScore: Number(listeningProgress?.bestScore || score),
      xpEarned,
      alreadyCompleted,
      streak,
    },
  });
};
