import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ReadingStory, User } from '../models';
import type { AuthRequest } from '../types';
import { getRequestLanguage, localizeReadingStory } from '../services/localization.service';
import { hasActivePremium } from '../services/entitlement.service';

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
  res.json({
    success: true,
    data: stories.map(story => {
      const localized = localizeReadingStory(story, language);
      return story.isPremium && !premiumAccess ? redactPremiumStory(localized) : { ...localized, isLocked: false };
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
  res.json({ success: true, data: { ...localizeReadingStory(story, language), isLocked: false } });
};
