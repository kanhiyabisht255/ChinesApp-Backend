import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { randomUUID } from 'crypto';
import {
  Progress,
  User,
  UserVocabularyProgress,
  VocabularyReviewSession,
  VocabularyTopic,
  VocabularyWord,
} from '../models';
import type { AuthRequest } from '../types';
import { hasActivePremium } from '../services/entitlement.service';
import { contentAccess, hasContentAccess } from '../services/reward.service';
import {
  getRequestLanguage,
  localizeVocabularyTopic,
  localizeVocabularyWord,
} from '../services/localization.service';
import { nextVocabularyReview, stableDailyIndex, type ReviewRating } from '../services/learning.service';
import { localDayStart, localWeekdayIndex, localWeekKey, normalizeTimezoneOffset, recordLearningActivity } from '../services/streak.service';

const idOrSlugQuery = (value: string): Record<string, unknown> =>
  mongoose.isValidObjectId(value)
    ? { $or: [{ _id: value }, { slug: value }] }
    : { slug: value };

const premiumAccessFor = async (req: Request): Promise<boolean> => {
  const userId = (req as AuthRequest).userId;
  if (!userId) return false;
  const user = await User.findById(userId).select('isPremium premiumExpiry').lean();
  return user ? hasActivePremium(user) : false;
};

const vocabularyWordAccessFor = async (
  req: Request,
  word: { isPremium?: boolean; topicId?: string },
): Promise<boolean> => {
  if (!word.isPremium) return true;
  return hasContentAccess(
    (req as AuthRequest).userId,
    'vocabulary',
    String(word.topicId || ''),
  );
};

const progressFor = async (userId: string | undefined, wordIds: string[]) => {
  if (!userId || wordIds.length === 0) return new Map<string, Record<string, unknown>>();
  const progress = await UserVocabularyProgress.find({ userId, wordId: { $in: wordIds } }).lean();
  return new Map(progress.map(item => [item.wordId, item as unknown as Record<string, unknown>]));
};

export const getDailyVocabularyWord = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const language = await getRequestLanguage(req);
  const user = await User.findById(authReq.userId).lean();
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const premiumAccess = hasActivePremium(user);
  const topicQuery = {
    isPublished: true,
    hskLevel: { $lte: Math.max(1, user.hskLevel) },
    ...(premiumAccess ? {} : { isPremium: false }),
  };
  const topics = await VocabularyTopic.find(topicQuery).sort({ hskLevel: -1, order: 1 }).lean();
  if (topics.length === 0) {
    res.status(404).json({ success: false, message: 'Daily vocabulary is unavailable' });
    return;
  }

  const topicIds = topics.map(topic => topic._id.toString());
  const progress = await UserVocabularyProgress.find({ userId: authReq.userId }).lean();
  const progressByWord = new Map(progress.map(item => [item.wordId, item]));
  const now = new Date();
  const dueIds = new Set(progress
    .filter(item => item.isLearned && (!item.nextReviewAt || item.nextReviewAt <= now))
    .map(item => item.wordId));
  const favoriteIds = new Set(progress.filter(item => item.isFavorite).map(item => item.wordId));
  const words = await VocabularyWord.find({
    topicId: { $in: topicIds },
    isPublished: true,
    ...(premiumAccess ? {} : { isPremium: false }),
  }).sort({ order: 1 }).lean();
  if (words.length === 0) {
    res.status(404).json({ success: false, message: 'Daily vocabulary is unavailable' });
    return;
  }

  const learningGoal = user.learningGoal || 'general';
  const goalKeywords: Record<string, RegExp> = {
    travel: /travel|transport|direction|hotel|restaurant|shopping|food|place/i,
    business: /business|work|office|meeting|professional|time/i,
    hsk: /hsk|basic|number|time|family|daily|greeting/i,
    culture: /culture|festival|food|family|people|place/i,
  };
  const topicById = new Map(topics.map(topic => [topic._id.toString(), topic]));
  const matchesGoal = (word: (typeof words)[number]) => {
    const topic = topicById.get(word.topicId);
    const matcher = goalKeywords[learningGoal];
    return matcher ? matcher.test(`${topic?.slug || ''} ${topic?.title || ''} ${topic?.description || ''}`) : false;
  };
  const pools = [
    { reason: 'due_review', words: words.filter(word => dueIds.has(word._id.toString())) },
    { reason: 'saved_word', words: words.filter(word => favoriteIds.has(word._id.toString()) && !dueIds.has(word._id.toString())) },
    { reason: 'goal_match', words: words.filter(word => !progressByWord.get(word._id.toString())?.isLearned && matchesGoal(word)) },
    { reason: 'level_match', words: words.filter(word => !progressByWord.get(word._id.toString())?.isLearned) },
    { reason: 'practice_again', words },
  ];
  const selectedPool = pools.find(pool => pool.words.length > 0)!;
  const timezoneOffset = normalizeTimezoneOffset(req.header('x-timezone-offset'));
  const dayKey = localDayStart(now, timezoneOffset).toISOString().slice(0, 10);
  const selected = selectedPool.words[stableDailyIndex(authReq.userId || 'learner', dayKey, selectedPool.words.length)];
  const topic = topicById.get(selected.topicId);
  const itemProgress = progressByWord.get(selected._id.toString());

  res.json({
    success: true,
    data: {
      ...localizeVocabularyWord(selected, language),
      topicTitle: topic ? localizeVocabularyTopic(topic, language).title : '',
      hskLevel: topic?.hskLevel || user.hskLevel,
      reason: selectedPool.reason,
      isLearned: itemProgress?.isLearned === true,
      isFavorite: itemProgress?.isFavorite === true,
      mastery: Number(itemProgress?.mastery || 0),
    },
  });
};

export const getVocabularyTopics = async (req: Request, res: Response): Promise<void> => {
  const language = await getRequestLanguage(req);
  const userId = (req as AuthRequest).userId;
  const [topics, words] = await Promise.all([
    VocabularyTopic.find({ isPublished: true }).sort({ hskLevel: 1, order: 1 }),
    VocabularyWord.find({ isPublished: true }).sort({ topicId: 1, order: 1 }),
  ]);
  const access = await contentAccess(userId, 'vocabulary', topics.map(topic => topic._id.toString()));
  const wordIds = words.map(word => word._id.toString());
  const progress = await progressFor(userId, wordIds);
  const wordsByTopic = new Map<string, typeof words>();
  words.forEach(word => {
    const group = wordsByTopic.get(word.topicId) || [];
    group.push(word);
    wordsByTopic.set(word.topicId, group);
  });

  const data = topics.map(topic => {
    const topicWords = wordsByTopic.get(topic._id.toString()) || [];
    const localized = localizeVocabularyTopic(topic, language);
    return {
      ...localized,
      itemCount: topicWords.length,
      learnedCount: topicWords.filter(word => progress.get(word._id.toString())?.isLearned === true).length,
      isLocked: topic.isPremium && !access.premium && !access.unlockedIds.has(topic._id.toString()),
      previewWords: topicWords.slice(0, 3).map(word => {
        const localizedWord = localizeVocabularyWord(word, language);
        return {
          _id: localizedWord._id,
          chinese: localizedWord.chinese,
          pinyin: localizedWord.pinyin,
          english: localizedWord.english,
        };
      }),
    };
  });
  res.json({ success: true, data });
};

export const getVocabularyTopic = async (req: Request, res: Response): Promise<void> => {
  const language = await getRequestLanguage(req);
  const topic = await VocabularyTopic.findOne({ ...idOrSlugQuery(req.params.id), isPublished: true });
  if (!topic) {
    res.status(404).json({ success: false, message: 'Vocabulary topic not found' });
    return;
  }

  if (topic.isPremium && !(await hasContentAccess((req as AuthRequest).userId, 'vocabulary', topic._id.toString()))) {
    res.status(403).json({ success: false, message: 'Premium subscription required for this vocabulary topic' });
    return;
  }

  const words = await VocabularyWord.find({
    topicId: topic._id.toString(),
    isPublished: true,
  }).sort({ order: 1 });
  const userId = (req as AuthRequest).userId;
  const progress = await progressFor(userId, words.map(word => word._id.toString()));
  res.json({
    success: true,
    data: {
      ...localizeVocabularyTopic(topic, language),
      itemCount: words.length,
      learnedCount: words.filter(word => progress.get(word._id.toString())?.isLearned === true).length,
      isLocked: false,
      words: words.map(word => ({
        ...localizeVocabularyWord(word, language),
        isLocked: false,
        isLearned: progress.get(word._id.toString())?.isLearned === true,
        isFavorite: progress.get(word._id.toString())?.isFavorite === true,
        mastery: Number(progress.get(word._id.toString())?.mastery || 0),
      })),
    },
  });
};

export const getVocabularyWord = async (req: Request, res: Response): Promise<void> => {
  const language = await getRequestLanguage(req);
  const word = await VocabularyWord.findOne({ ...idOrSlugQuery(req.params.id), isPublished: true });
  if (!word) {
    res.status(404).json({ success: false, message: 'Vocabulary word not found' });
    return;
  }
  if (!(await vocabularyWordAccessFor(req, word))) {
    res.status(403).json({ success: false, message: 'Premium subscription required for this vocabulary word' });
    return;
  }
  const userId = (req as AuthRequest).userId;
  const progress = await progressFor(userId, [word._id.toString()]);
  res.json({
    success: true,
    data: {
      ...localizeVocabularyWord(word, language),
      isLocked: false,
      isLearned: progress.get(word._id.toString())?.isLearned === true,
      isFavorite: progress.get(word._id.toString())?.isFavorite === true,
      mastery: Number(progress.get(word._id.toString())?.mastery || 0),
    },
  });
};

export const getVocabularyReviewQueue = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const language = await getRequestLanguage(req);
  const limit = Math.max(3, Math.min(20, Math.round(Number(req.query.limit) || 10)));
  const premiumAccess = await premiumAccessFor(req);
  const now = new Date();
  const dueProgress = await UserVocabularyProgress.find({
    userId,
    $or: [
      {
        isLearned: true,
        $or: [{ nextReviewAt: { $lte: now } }, { nextReviewAt: { $exists: false } }],
      },
      { isFavorite: true },
    ],
  }).sort({ nextReviewAt: 1, lastReviewedAt: 1 }).limit(limit).lean();
  const dueIds = dueProgress.map(item => item.wordId);
  const dueWords = dueIds.length > 0
    ? await VocabularyWord.find({
        _id: { $in: dueIds },
        isPublished: true,
        ...(premiumAccess ? {} : { isPremium: false }),
      })
    : [];
  const wordById = new Map(dueWords.map(word => [word._id.toString(), word]));
  const orderedDueWords = dueIds.flatMap(id => wordById.get(id) ? [wordById.get(id)!] : []);
  const dueProgressByWord = new Map(dueProgress.map(item => [item.wordId, item]));

  const remaining = Math.max(0, limit - orderedDueWords.length);
  const existingWordIds = remaining > 0
    ? await UserVocabularyProgress.find({ userId }).distinct('wordId')
    : [];
  const newWords = remaining > 0
    ? await VocabularyWord.find({
        isPublished: true,
        ...(premiumAccess ? {} : { isPremium: false }),
        _id: { $nin: existingWordIds },
      }).sort({ order: 1 }).limit(remaining)
    : [];
  const words = [...orderedDueWords, ...newWords];
  const sessionId = randomUUID();
  await VocabularyReviewSession.create({
    sessionId,
    userId,
    wordIds: words.map(word => word._id.toString()),
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
  });
  const dueCount = await UserVocabularyProgress.countDocuments({
    userId,
    $or: [
      {
        isLearned: true,
        $or: [{ nextReviewAt: { $lte: now } }, { nextReviewAt: { $exists: false } }],
      },
      { isFavorite: true },
    ],
  });

  res.json({
    success: true,
    data: {
      sessionId,
      dueCount,
      words: words.map(word => {
        const itemProgress = dueProgressByWord.get(word._id.toString());
        return {
          ...localizeVocabularyWord(word, language),
          isNew: !itemProgress,
          mastery: Number(itemProgress?.mastery || 0),
          reviewCount: Number(itemProgress?.reviewCount || 0),
          nextReviewAt: itemProgress?.nextReviewAt,
        };
      }),
    },
  });
};

export const updateVocabularyProgress = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const word = await VocabularyWord.findOne({ ...idOrSlugQuery(req.params.id), isPublished: true });
  if (!word) {
    res.status(404).json({ success: false, message: 'Vocabulary word not found' });
    return;
  }
  if (!(await vocabularyWordAccessFor(req, word))) {
    res.status(403).json({ success: false, message: 'Premium subscription required for this vocabulary word' });
    return;
  }

  const existing = await UserVocabularyProgress.findOne({ userId, wordId: word._id.toString() });
  const rating = ['again', 'hard', 'good', 'easy'].includes(String(req.body.rating))
    ? String(req.body.rating) as ReviewRating
    : null;
  const schedule = rating ? nextVocabularyReview(existing || {}, rating) : null;
  const savedForReview = req.body.saveForReview === true;
  const isLearned = rating
    ? true
    : typeof req.body.isLearned === 'boolean' ? req.body.isLearned : existing?.isLearned || false;
  const isFavorite = typeof req.body.isFavorite === 'boolean' ? req.body.isFavorite : existing?.isFavorite || false;
  const mastery = schedule?.mastery ?? (Number.isFinite(Number(req.body.mastery))
    ? Math.max(0, Math.min(5, Math.round(Number(req.body.mastery))))
    : existing?.mastery || 0);
  const reviewed = rating !== null || req.body.reviewed === true;

  const progress = await UserVocabularyProgress.findOneAndUpdate(
    { userId, wordId: word._id.toString() },
    {
      $set: {
        isLearned,
        isFavorite,
        mastery,
        ...(schedule ? {
          nextReviewAt: schedule.nextReviewAt,
          intervalDays: schedule.intervalDays,
          easeFactor: schedule.easeFactor,
        } : {}),
        ...(reviewed ? { lastReviewedAt: new Date() } : {}),
        ...(savedForReview && !existing?.nextReviewAt ? { nextReviewAt: new Date() } : {}),
      },
      ...(reviewed ? { $inc: { reviewCount: 1 } } : {}),
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );

  if ((existing?.isLearned || false) !== isLearned) {
    const publishedWordIds = await VocabularyWord.find({ isPublished: true }).distinct('_id');
    const [learnedCount, currentProgress] = await Promise.all([
      UserVocabularyProgress.countDocuments({
        userId,
        isLearned: true,
        wordId: { $in: publishedWordIds.map(String) },
      }),
      Progress.findOne({ userId }).lean(),
    ]);
    const totalWords = publishedWordIds.length;
    const vocabulary = totalWords > 0 ? Math.min(100, Math.round((learnedCount / totalWords) * 100)) : 0;
    const skills = ['speaking', 'tones', 'grammar', 'listening', 'reading'] as const;
    const overall = Math.round((vocabulary + skills.reduce(
      (sum, skill) => sum + Number(currentProgress?.[skill] || 0),
      0,
    )) / 6);
    await Progress.findOneAndUpdate(
      { userId },
      { $set: { wordsLearned: learnedCount, vocabulary, overall, lastUpdated: new Date() } },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  res.json({ success: true, message: 'Vocabulary progress saved', data: progress });
};

export const completeVocabularyReview = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const sessionId = String(req.body.sessionId || '');
  const session = await VocabularyReviewSession.findOne({ sessionId, userId });
  if (!session) {
    res.status(404).json({ success: false, message: 'Review session not found or expired' });
    return;
  }
  if (session.completedAt) {
    res.status(409).json({ success: false, message: 'Review session was already completed' });
    return;
  }
  const sessionCreatedAt = (session as unknown as { createdAt: Date }).createdAt;
  const reviewedProgress = await UserVocabularyProgress.find({
    userId,
    wordId: { $in: session.wordIds },
    lastReviewedAt: { $gte: sessionCreatedAt },
  }).lean();
  if (reviewedProgress.length === 0) {
    res.status(400).json({ success: false, message: 'Review at least one word before finishing' });
    return;
  }
  const claimed = await VocabularyReviewSession.findOneAndUpdate(
    { _id: session._id, completedAt: { $exists: false } },
    { $set: { completedAt: new Date() } },
    { new: true },
  );
  if (!claimed) {
    res.status(409).json({ success: false, message: 'Review session was already completed' });
    return;
  }

  const reviewedCount = reviewedProgress.length;
  const score = Math.round(reviewedProgress.reduce((sum, item) => sum + Number(item.mastery || 0) * 20, 0) / reviewedCount);
  const xpEarned = Math.min(20, reviewedCount * 2);
  const practiceMinutes = Math.max(1, Math.min(15, Math.round(Number(req.body.practiceMinutes) || Math.ceil(reviewedCount / 2))));
  const timezoneOffset = normalizeTimezoneOffset(req.header('x-timezone-offset'));
  const now = new Date();
  const streak = await recordLearningActivity(userId, timezoneOffset, now, undefined, practiceMinutes);
  if (streak === null) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  await User.findByIdAndUpdate(userId, { $inc: { xp: xpEarned } });

  const current = await Progress.findOne({ userId }).lean();
  const previousVocabulary = Number(current?.vocabulary || 0);
  const vocabulary = previousVocabulary === 0 ? score : Math.round(previousVocabulary * 0.8 + score * 0.2);
  const otherSkills = ['speaking', 'tones', 'grammar', 'listening', 'reading'] as const;
  const overall = Math.round((vocabulary + otherSkills.reduce(
    (sum, skill) => sum + Number(current?.[skill] || 0),
    0,
  )) / 6);
  const weekKey = localWeekKey(now, timezoneOffset);
  const weeklyXp = Array.from(
    { length: 7 },
    (_, index) => current?.weeklyXpWeek === weekKey ? Number(current?.weeklyXp?.[index] || 0) : 0,
  );
  weeklyXp[localWeekdayIndex(now, timezoneOffset)] += xpEarned;
  await Progress.findOneAndUpdate(
    { userId },
    {
      $set: { vocabulary, overall, weeklyXp, weeklyXpWeek: weekKey, lastUpdated: now },
      $inc: { totalSessions: 1, totalMinutes: practiceMinutes },
    },
    { upsert: true, setDefaultsOnInsert: true },
  );

  res.json({
    success: true,
    message: 'Vocabulary review completed',
    data: { reviewedCount, score, xpEarned, streak },
  });
};
