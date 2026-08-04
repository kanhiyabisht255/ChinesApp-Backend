import { Request, Response } from 'express';
import { ReadingStory } from '../models';
import { createError } from '../middleware/error';
import {
  STORY_TTS_MODEL,
  buildStoryParagraphs,
  generateAndStoreStoryAudio,
  storyContentHash,
} from '../services/story-audio.service';

const supportedLevels = ['beginner', 'elementary', 'intermediate', 'advanced'] as const;

const cleanText = (value: unknown, maxLength: number): string => String(value || '').trim().slice(0, maxLength);

const generatedChineseTitle = (storyText: string): string => {
  const firstSentence = storyText.replace(/\s+/g, '').split(/[。！？!?]/)[0] || '中文故事';
  return `${firstSentence.slice(0, 18)}${firstSentence.length > 18 ? '…' : ''}`;
};

export const getGeneratedAudioStories = async (req: Request, res: Response): Promise<void> => {
  const stories = await ReadingStory.find({ source: 'admin', audioProvider: 'you.bot' })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ success: true, data: stories });
};

export const generateAudioStory = async (req: Request, res: Response): Promise<void> => {
  const storyText = cleanText(req.body?.storyText, 20_000);
  if (storyText.length < 10) throw createError(400, 'Paste at least 10 characters of story text');
  if (String(req.body?.storyText || '').trim().length > 20_000) throw createError(413, 'Story text is too long');
  if (!/[\u3400-\u9fff]/u.test(storyText)) throw createError(400, 'The story must contain Chinese text');

  const contentHash = storyContentHash(storyText);
  const duplicate = await ReadingStory.findOne({ contentHash }).select('_id title isPublished').lean();
  if (duplicate) {
    res.status(409).json({
      success: false,
      message: 'This exact story is already saved. Open it from Recent generated stories.',
      data: duplicate,
    });
    return;
  }

  const titleCn = cleanText(req.body?.titleCn, 100) || generatedChineseTitle(storyText);
  const title = cleanText(req.body?.title, 120) || `Audio Story · ${titleCn}`;
  const requestedLevel = cleanText(req.body?.level, 30);
  const level = supportedLevels.includes(requestedLevel as typeof supportedLevels[number])
    ? requestedLevel as typeof supportedLevels[number]
    : 'beginner';
  const paragraphs = buildStoryParagraphs(storyText);
  if (!paragraphs.length) throw createError(400, 'Story text could not be split into readable paragraphs');

  const storedAudio = await generateAndStoreStoryAudio(storyText, title);
  const maxOrder = await ReadingStory.findOne().sort({ order: -1 }).select('order').lean();
  const generatedAt = new Date();
  const isPublished = req.body?.isPublished !== false;
  const story = await ReadingStory.create({
    slug: `audio-story-${generatedAt.getTime()}-${contentHash.slice(0, 8)}`,
    title,
    titleCn,
    pinyin: '',
    description: cleanText(req.body?.description, 300) || 'Listen to a naturally narrated Mandarin Chinese story.',
    category: cleanText(req.body?.category, 50) || 'audio-stories',
    level,
    icon: 'auto_stories',
    color: '#7F43FE',
    isPremium: req.body?.isPremium !== false,
    estimatedMinutes: Math.max(1, Math.min(30, Math.ceil(storyText.replace(/\s/g, '').length / 180))),
    order: Number(maxOrder?.order || 0) + 1,
    paragraphs,
    vocabulary: [],
    questions: [],
    audioUrl: storedAudio.audioUrl,
    audioStorageProvider: 'google-drive',
    audioStorageId: storedAudio.fileId,
    audioProvider: 'you.bot',
    ttsModel: STORY_TTS_MODEL,
    contentHash,
    generatedAt,
    isPublished,
    source: 'admin',
    contentVersion: `audio-${generatedAt.toISOString()}`,
  });
  res.status(201).json({
    success: true,
    message: isPublished
      ? 'Story audio generated, saved to Google Drive and published'
      : 'Story audio generated, saved to Google Drive as a draft',
    data: story,
  });
};

export const updateGeneratedAudioStory = async (req: Request, res: Response): Promise<void> => {
  const updates: Record<string, unknown> = {};
  if (typeof req.body?.isPublished === 'boolean') updates.isPublished = req.body.isPublished;
  if (typeof req.body?.isPremium === 'boolean') updates.isPremium = req.body.isPremium;
  if (typeof req.body?.title === 'string' && req.body.title.trim()) updates.title = cleanText(req.body.title, 120);
  if (typeof req.body?.titleCn === 'string' && req.body.titleCn.trim()) updates.titleCn = cleanText(req.body.titleCn, 100);
  if (!Object.keys(updates).length) throw createError(400, 'No supported story changes were provided');

  const story = await ReadingStory.findOneAndUpdate(
    { _id: req.params.id, source: 'admin', audioProvider: 'you.bot' },
    { $set: updates },
    { new: true, runValidators: true },
  );
  if (!story) throw createError(404, 'Generated audio story not found');
  res.json({ success: true, message: 'Story availability updated', data: story });
};
