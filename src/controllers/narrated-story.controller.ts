import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { NarratedStory, User, UserNarratedStoryProgress } from '../models';
import type { AuthRequest, INarratedStory } from '../types';
import { hasActivePremium } from '../services/entitlement.service';
import { contentAccess, hasContentAccess } from '../services/reward.service';
import { deleteStoryAudio, uploadStoryAudio } from '../services/cloudinary-audio.service';
import {
  applyStoryTimings,
  cleanStoryText,
  parseStoryAccessTier,
  parseStoryQuestions,
  parseStorySegments,
  parseStoryVocabulary,
  storyDuplicateQuery,
  storyContentHash,
  storySlug,
  storyTitleKey,
} from '../services/narrated-story.service';
import { createError } from '../middleware/error';

const idOrSlugQuery = (value: string): Record<string, unknown> =>
  mongoose.isValidObjectId(value) ? { $or: [{ _id: value }, { slug: value }] } : { slug: value };

const bodyBoolean = (value: unknown): boolean => value === true || value === 'true';

const storyAccess = async (userId: string | undefined, story: { _id: unknown; accessTier: INarratedStory['accessTier'] }): Promise<boolean> => {
  if (story.accessTier === 'free') return true;
  if (!userId) return false;
  const user = await User.findById(userId).select('isPremium premiumExpiry').lean();
  if (user && hasActivePremium(user)) return true;
  return story.accessTier === 'rewarded_or_premium'
    ? hasContentAccess(userId, 'story', String(story._id))
    : false;
};

const preview = (story: Record<string, any>, unlocked: boolean): Record<string, any> => {
  if (unlocked) return { ...story, isLocked: false };
  return {
    _id: story._id,
    slug: story.slug,
    title: story.title,
    titleCn: story.titleCn,
    pinyin: story.pinyin,
    description: story.description,
    category: story.category,
    hskLevel: story.hskLevel,
    coverImageUrl: story.coverImageUrl,
    accentColor: story.accentColor,
    accessTier: story.accessTier,
    isPremium: story.isPremium,
    isPublished: story.isPublished,
    isFeatured: story.isFeatured,
    order: story.order,
    durationMs: story.durationMs,
    estimatedMinutes: story.estimatedMinutes,
    audioUrl: null,
    audioFormat: story.audioFormat,
    segments: [],
    vocabulary: [],
    questions: [],
    isLocked: true,
  };
};

const progressMap = async (userId: string | undefined, ids: string[]) => {
  if (!userId || !ids.length) return new Map<string, any>();
  const rows = await UserNarratedStoryProgress.find({ userId, storyId: { $in: ids } }).lean();
  return new Map(rows.map(row => [row.storyId, row]));
};

export const getNarratedStories = async (req: Request, res: Response): Promise<void> => {
  const stories = await NarratedStory.find({ isPublished: true }).sort({ isFeatured: -1, order: 1, createdAt: -1 }).lean();
  const userId = (req as AuthRequest).userId;
  const storyIds = stories.map(story => String(story._id));
  const [progresses, access] = await Promise.all([
    progressMap(userId, storyIds),
    contentAccess(userId, 'story', storyIds),
  ]);
  const data = stories.map(story => {
    const storyId = String(story._id);
    const unlocked = story.accessTier === 'free'
      || access.premium
      || (story.accessTier === 'rewarded_or_premium' && access.unlockedIds.has(storyId));
    return { ...preview(story, unlocked), progress: progresses.get(storyId) || null };
  });
  res.json({ success: true, data });
};

export const getNarratedStory = async (req: Request, res: Response): Promise<void> => {
  const story = await NarratedStory.findOne({ ...idOrSlugQuery(req.params.id), isPublished: true }).lean();
  if (!story) throw createError(404, 'Story not found');
  const userId = (req as AuthRequest).userId;
  const unlocked = await storyAccess(userId, story);
  const progress = userId ? await UserNarratedStoryProgress.findOne({ userId, storyId: String(story._id) }).lean() : null;
  res.json({ success: true, data: { ...preview(story, unlocked), progress } });
};

export const saveNarratedStoryProgress = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const story = await NarratedStory.findOne({ ...idOrSlugQuery(req.params.id), isPublished: true }).lean();
  if (!story) throw createError(404, 'Story not found');
  if (!(await storyAccess(userId, story))) throw createError(403, 'Unlock this story before saving progress');
  const durationMs = Math.max(0, Math.round(Number(req.body.durationMs) || story.durationMs));
  const positionMs = Math.max(0, Math.min(durationMs, Math.round(Number(req.body.positionMs) || 0)));
  const completionPercent = Math.max(0, Math.min(100, Math.round(Number(req.body.completionPercent) || (durationMs ? positionMs / durationMs * 100 : 0))));
  const isCompleted = req.body.isCompleted === true || completionPercent >= 90;
  const now = new Date();
  const update: Record<string, unknown> = {
    $set: { positionMs, durationMs, completionPercent, isCompleted, lastPlayedAt: now, ...(isCompleted ? { completedAt: now } : {}) },
    $setOnInsert: { userId, storyId: String(story._id) },
  };
  if (req.body.event === 'start') update.$inc = { playCount: 1 };
  const progress = await UserNarratedStoryProgress.findOneAndUpdate(
    { userId, storyId: String(story._id) },
    update,
    { upsert: true, new: true, runValidators: true },
  ).lean();
  res.json({ success: true, data: progress });
};

const parseStoryBody = (body: Record<string, any>, uploaded: Awaited<ReturnType<typeof uploadStoryAudio>>) => {
  const segmentsInput = parseStorySegments(body.segments);
  const timings = applyStoryTimings(segmentsInput, uploaded.durationMs);
  const title = cleanStoryText(body.title, 160);
  const titleCn = cleanStoryText(body.titleCn, 160);
  if (!title || !titleCn) throw createError(400, 'English and Chinese story titles are required');
  const accessTier = parseStoryAccessTier(body.accessTier);
  return {
    title,
    titleCn,
    pinyin: cleanStoryText(body.pinyin, 500),
    description: cleanStoryText(body.description, 800),
    category: cleanStoryText(body.category, 80) || 'everyday',
    hskLevel: Math.max(1, Math.min(6, Math.round(Number(body.hskLevel) || 1))),
    coverImageUrl: cleanStoryText(body.coverImageUrl, 500) || undefined,
    accentColor: /^#[0-9A-Fa-f]{6}$/.test(String(body.accentColor || '')) ? body.accentColor : '#7F43FE',
    accessTier,
    isPremium: accessTier !== 'free',
    isPublished: bodyBoolean(body.isPublished),
    isFeatured: bodyBoolean(body.isFeatured),
    order: Math.max(0, Math.round(Number(body.order) || 0)),
    ...uploaded,
    estimatedMinutes: Math.max(1, Math.ceil(uploaded.durationMs / 60_000)),
    timingMode: timings.timingMode,
    segments: timings.segments,
    vocabulary: parseStoryVocabulary(body.vocabulary),
    questions: parseStoryQuestions(body.questions),
    contentHash: storyContentHash(timings.segments),
    titleKey: storyTitleKey(title),
    titleCnKey: storyTitleKey(titleCn),
    slug: storySlug(title),
  };
};

export const getAdminNarratedStories = async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: await NarratedStory.find().sort({ order: 1, createdAt: -1 }).lean() });
};

export const checkNarratedStoryDuplicate = async (req: Request, res: Response): Promise<void> => {
  const title = cleanStoryText(req.body?.title, 160);
  const titleCn = cleanStoryText(req.body?.titleCn, 160);
  const segments = parseStorySegments(req.body?.segments);
  if (!title || !titleCn) throw createError(400, 'English and Chinese story titles are required');
  const duplicate = await NarratedStory.findOne(storyDuplicateQuery(title, titleCn, segments)).select('_id title titleCn').lean();
  res.json({ success: true, data: { duplicate: Boolean(duplicate), story: duplicate || null } });
};

export const bulkImportNarratedStories = async (req: Request, res: Response): Promise<void> => {
  const rows: Array<Record<string, any>> = Array.isArray(req.body?.stories) ? req.body.stories : [];
  if (!rows.length) throw createError(400, 'Add at least one story to import');
  if (rows.length > 100) throw createError(400, 'Import at most 100 stories at a time');
  const prepared = rows.map((row: Record<string, any>, index: number) => {
    const title = cleanStoryText(row.title, 160);
    const titleCn = cleanStoryText(row.titleCn, 160);
    if (!title || !titleCn) throw createError(400, `Story ${index + 1} requires English and Chinese titles`);
    const durationMs = Math.max(1, Math.round(Number(row.durationMs) || 0));
    const audioUrl = cleanStoryText(row.audioUrl, 1000);
    if (!/^https:\/\//i.test(audioUrl)) throw createError(400, `Story ${index + 1} requires a secure HTTPS audio URL`);
    const timing = applyStoryTimings(parseStorySegments(row.segments), durationMs);
    const accessTier = parseStoryAccessTier(row.accessTier);
    return {
      slug: storySlug(row.slug || title),
      title,
      titleCn,
      pinyin: cleanStoryText(row.pinyin, 500),
      description: cleanStoryText(row.description, 800),
      category: cleanStoryText(row.category, 80) || 'everyday',
      hskLevel: Math.max(1, Math.min(6, Math.round(Number(row.hskLevel) || 1))),
      coverImageUrl: cleanStoryText(row.coverImageUrl, 500) || undefined,
      accentColor: /^#[0-9A-Fa-f]{6}$/.test(String(row.accentColor || '')) ? row.accentColor : '#7F43FE',
      accessTier,
      isPremium: accessTier !== 'free',
      isPublished: row.isPublished === true,
      isFeatured: row.isFeatured === true,
      order: Math.max(0, Math.round(Number(row.order) || index + 1)),
      durationMs,
      estimatedMinutes: Math.max(1, Math.ceil(durationMs / 60_000)),
      sourceAudioUrl: cleanStoryText(row.sourceAudioUrl, 1000) || audioUrl,
      audioUrl,
      audioStorageProvider: String(row.audioStorageProvider) === 'cloudinary' ? 'cloudinary' : 'external',
      audioPublicId: cleanStoryText(row.audioPublicId, 500) || undefined,
      audioFormat: cleanStoryText(row.audioFormat, 20) || 'm4a',
      audioBytes: Math.max(0, Math.round(Number(row.audioBytes) || 0)),
      timingMode: timing.timingMode,
      segments: timing.segments,
      vocabulary: parseStoryVocabulary(row.vocabulary),
      questions: parseStoryQuestions(row.questions),
      contentHash: storyContentHash(timing.segments),
      titleKey: storyTitleKey(title),
      titleCnKey: storyTitleKey(titleCn),
    };
  });
  const seen = new Set<string>();
  prepared.forEach((story, index) => {
    const keys = [story.contentHash, story.titleKey, story.titleCnKey];
    if (keys.some(key => seen.has(key))) throw createError(409, `Duplicate detected inside import at story ${index + 1}`);
    keys.forEach(key => seen.add(key));
  });
  const existing = await NarratedStory.findOne({
    $or: [
      { contentHash: { $in: prepared.map(story => story.contentHash) } },
      { titleKey: { $in: prepared.map(story => story.titleKey) } },
      { titleCnKey: { $in: prepared.map(story => story.titleCnKey) } },
    ],
  }).select('_id title titleCn').lean();
  if (existing) throw createError(409, `Import rejected because a duplicate already exists: ${existing.title} / ${existing.titleCn}`);
  const stories = await NarratedStory.insertMany(prepared, { ordered: true });
  res.status(201).json({ success: true, message: `${stories.length} stories imported`, data: stories });
};

export const createNarratedStory = async (req: Request, res: Response): Promise<void> => {
  const file = req.file;
  if (!file) throw createError(400, 'Select a WAV or audio file');
  if (!/^audio\/(wav|x-wav|wave|mpeg|mp4|x-m4a|aac|ogg|webm)$/.test(file.mimetype) && !/\.(wav|mp3|m4a|aac|ogg|webm)$/i.test(file.originalname)) {
    throw createError(400, 'Only WAV, MP3, M4A, AAC, OGG or WebM audio files are supported');
  }
  if (file.size > 100 * 1024 * 1024) throw createError(413, 'Audio file must be 100 MB or smaller');
  const title = cleanStoryText(req.body?.title, 160);
  const titleCn = cleanStoryText(req.body?.titleCn, 160);
  const segmentInput = parseStorySegments(req.body?.segments);
  if (!title || !titleCn) throw createError(400, 'English and Chinese story titles are required');
  const duplicate = await NarratedStory.findOne(storyDuplicateQuery(title, titleCn, segmentInput)).select('_id title titleCn').lean();
  if (duplicate) throw createError(409, `Duplicate story already exists: ${duplicate.title} / ${duplicate.titleCn}`);
  const uploaded = await uploadStoryAudio(file, title || titleCn);
  try {
    const data = parseStoryBody(req.body || {}, uploaded);
    const maxOrder = await NarratedStory.findOne().sort({ order: -1 }).select('order').lean();
    if (!data.order) data.order = Number(maxOrder?.order || 0) + 1;
    const story = await NarratedStory.create(data);
    res.status(201).json({ success: true, message: 'Story created and audio uploaded to Cloudinary', data: story });
  } catch (error) {
    await deleteStoryAudio(uploaded.audioPublicId).catch(cleanupError => console.error('Cloudinary cleanup failed:', cleanupError));
    throw error;
  }
};

export const updateNarratedStory = async (req: Request, res: Response): Promise<void> => {
  const story = await NarratedStory.findById(req.params.id);
  if (!story) throw createError(404, 'Story not found');
  const updates: Record<string, unknown> = {};
  ['title', 'titleCn', 'pinyin', 'description', 'category', 'coverImageUrl', 'accentColor'].forEach(field => {
    if (typeof req.body?.[field] === 'string') updates[field] = cleanStoryText(req.body[field], field === 'description' ? 800 : 500);
  });
  if (['free', 'rewarded_or_premium', 'premium'].includes(String(req.body?.accessTier))) {
    updates.accessTier = req.body.accessTier;
    updates.isPremium = req.body.accessTier !== 'free';
  }
  ['isPublished', 'isFeatured'].forEach(field => { if (typeof req.body?.[field] === 'boolean') updates[field] = req.body[field]; });
  if (Number.isFinite(Number(req.body?.hskLevel))) updates.hskLevel = Math.max(1, Math.min(6, Math.round(Number(req.body.hskLevel))));
  if (Number.isFinite(Number(req.body?.order))) updates.order = Math.max(0, Math.round(Number(req.body.order)));
  if (Array.isArray(req.body?.segments)) {
    const segments = applyStoryTimings(parseStorySegments(req.body.segments), story.durationMs);
    updates.segments = segments.segments;
    updates.timingMode = segments.timingMode;
    updates.contentHash = storyContentHash(segments.segments);
  }
  if (Array.isArray(req.body?.vocabulary)) updates.vocabulary = parseStoryVocabulary(req.body.vocabulary);
  if (Array.isArray(req.body?.questions)) updates.questions = parseStoryQuestions(req.body.questions);
  if (typeof updates.title === 'string') updates.titleKey = storyTitleKey(updates.title);
  if (typeof updates.titleCn === 'string') updates.titleCnKey = storyTitleKey(updates.titleCn);
  const duplicate = await NarratedStory.findOne(storyDuplicateQuery(
    String(updates.title || story.title),
    String(updates.titleCn || story.titleCn),
    (updates.segments as any) || story.segments,
    story.id,
  )).select('_id title titleCn').lean();
  if (duplicate) throw createError(409, `Duplicate story already exists: ${duplicate.title} / ${duplicate.titleCn}`);
  Object.assign(story, updates);
  await story.save();
  res.json({ success: true, message: 'Story updated', data: story });
};

export const deleteNarratedStory = async (req: Request, res: Response): Promise<void> => {
  const story = await NarratedStory.findById(req.params.id);
  if (!story) throw createError(404, 'Story not found');
  await story.deleteOne();
  await UserNarratedStoryProgress.deleteMany({ storyId: story.id });
  await deleteStoryAudio(story.audioPublicId).catch(cleanupError => console.error('Cloudinary cleanup failed:', cleanupError));
  res.json({ success: true, message: 'Story and learner progress deleted' });
};
