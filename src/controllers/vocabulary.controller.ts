import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  Progress,
  User,
  UserVocabularyProgress,
  VocabularyTopic,
  VocabularyWord,
} from '../models';
import type { AuthRequest } from '../types';
import { hasActivePremium } from '../services/entitlement.service';
import {
  getRequestLanguage,
  localizeVocabularyTopic,
  localizeVocabularyWord,
} from '../services/localization.service';

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

const progressFor = async (userId: string | undefined, wordIds: string[]) => {
  if (!userId || wordIds.length === 0) return new Map<string, Record<string, unknown>>();
  const progress = await UserVocabularyProgress.find({ userId, wordId: { $in: wordIds } }).lean();
  return new Map(progress.map(item => [item.wordId, item as unknown as Record<string, unknown>]));
};

export const getVocabularyTopics = async (req: Request, res: Response): Promise<void> => {
  const language = await getRequestLanguage(req);
  const userId = (req as AuthRequest).userId;
  const [topics, words, premiumAccess] = await Promise.all([
    VocabularyTopic.find({ isPublished: true }).sort({ hskLevel: 1, order: 1 }),
    VocabularyWord.find({ isPublished: true }).sort({ topicId: 1, order: 1 }),
    premiumAccessFor(req),
  ]);
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
      isLocked: topic.isPremium && !premiumAccess,
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

  const premiumAccess = await premiumAccessFor(req);
  if (topic.isPremium && !premiumAccess) {
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
  if (word.isPremium && !(await premiumAccessFor(req))) {
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

export const updateVocabularyProgress = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const word = await VocabularyWord.findOne({ ...idOrSlugQuery(req.params.id), isPublished: true });
  if (!word) {
    res.status(404).json({ success: false, message: 'Vocabulary word not found' });
    return;
  }
  if (word.isPremium && !(await premiumAccessFor(req))) {
    res.status(403).json({ success: false, message: 'Premium subscription required for this vocabulary word' });
    return;
  }

  const existing = await UserVocabularyProgress.findOne({ userId, wordId: word._id.toString() });
  const isLearned = typeof req.body.isLearned === 'boolean' ? req.body.isLearned : existing?.isLearned || false;
  const isFavorite = typeof req.body.isFavorite === 'boolean' ? req.body.isFavorite : existing?.isFavorite || false;
  const mastery = Number.isFinite(Number(req.body.mastery))
    ? Math.max(0, Math.min(5, Math.round(Number(req.body.mastery))))
    : existing?.mastery || 0;
  const reviewed = req.body.reviewed === true;

  const progress = await UserVocabularyProgress.findOneAndUpdate(
    { userId, wordId: word._id.toString() },
    {
      $set: {
        isLearned,
        isFavorite,
        mastery,
        ...(reviewed ? { lastReviewedAt: new Date() } : {}),
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
