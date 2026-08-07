import crypto from 'crypto';
import { createError } from '../middleware/error';
import type {
  INarratedStoryQuestion,
  INarratedStorySegment,
  INarratedStoryVocabulary,
  NarratedStoryAccessTier,
} from '../types';

const collapseWhitespace = (value: unknown): string => String(value || '').replace(/\s+/g, ' ').trim();

export const cleanStoryText = (value: unknown, maxLength: number): string =>
  collapseWhitespace(value).slice(0, maxLength);

export const storyTitleKey = (value: unknown): string =>
  collapseWhitespace(value).toLocaleLowerCase('en-US').replace(/[^\p{L}\p{N}]+/gu, '');

export const storyContentHash = (segments: Array<Pick<INarratedStorySegment, 'chinese'>>): string => {
  const normalized = segments.map(segment => collapseWhitespace(segment.chinese).replace(/\s/g, '')).join('');
  return crypto.createHash('sha256').update(normalized).digest('hex');
};

export const storySlug = (title: unknown): string => {
  const base = collapseWhitespace(title)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
  return base || `story-${Date.now()}`;
};

const parseArray = (value: unknown, field: string): unknown[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      throw createError(400, `${field} must contain valid JSON`);
    }
  }
  return [];
};

export const parseStorySegments = (value: unknown): Array<Omit<INarratedStorySegment, 'startMs' | 'endMs'> & { startMs?: number; endMs?: number }> => {
  const raw = parseArray(value, 'segments');
  if (raw.length < 1) throw createError(400, 'At least one Chinese, Pinyin and English segment is required');
  if (raw.length > 300) throw createError(400, 'A story cannot contain more than 300 segments');
  return raw.map((item, index) => {
    const input = (item || {}) as Record<string, unknown>;
    const chinese = cleanStoryText(input.chinese, 1000);
    const pinyin = cleanStoryText(input.pinyin, 1500);
    const english = cleanStoryText(input.english, 2000);
    if (!chinese || !pinyin || !english) {
      throw createError(400, `Segment ${index + 1} requires Chinese, Pinyin and English text`);
    }
    return {
      chinese,
      pinyin,
      english,
      startMs: Number.isFinite(Number(input.startMs)) ? Math.max(0, Math.round(Number(input.startMs))) : undefined,
      endMs: Number.isFinite(Number(input.endMs)) ? Math.max(0, Math.round(Number(input.endMs))) : undefined,
    };
  });
};

export const applyStoryTimings = (
  segments: ReturnType<typeof parseStorySegments>,
  durationMs: number,
): { segments: INarratedStorySegment[]; timingMode: 'estimated' | 'manual' } => {
  const safeDuration = Math.max(1, Math.round(durationMs));
  const hasManualTimings = segments.every((segment, index) => {
    if (segment.startMs === undefined || segment.endMs === undefined || segment.endMs <= segment.startMs) return false;
    if (index > 0 && segment.startMs < Number(segments[index - 1].endMs || 0)) return false;
    return segment.endMs <= safeDuration + 2000;
  });
  if (hasManualTimings) {
    return {
      timingMode: 'manual',
      segments: segments.map(segment => ({
        chinese: segment.chinese,
        pinyin: segment.pinyin,
        english: segment.english,
        startMs: Number(segment.startMs),
        endMs: Number(segment.endMs),
      })),
    };
  }

  const weights = segments.map(segment => Math.max(1, [...segment.chinese.replace(/\s/g, '')].length));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = 0;
  const estimated = segments.map((segment, index) => {
    const startMs = cursor;
    const proportionalEnd = index === segments.length - 1
      ? safeDuration
      : Math.round(cursor + (safeDuration * weights[index]) / totalWeight);
    const endMs = Math.max(startMs + 1, proportionalEnd);
    cursor = endMs;
    return { ...segment, startMs, endMs } as INarratedStorySegment;
  });
  return { segments: estimated, timingMode: 'estimated' };
};

export const parseStoryVocabulary = (value: unknown): INarratedStoryVocabulary[] =>
  parseArray(value, 'vocabulary').slice(0, 100).map((item, index) => {
    const input = (item || {}) as Record<string, unknown>;
    const result = {
      chinese: cleanStoryText(input.chinese, 100),
      pinyin: cleanStoryText(input.pinyin, 160),
      english: cleanStoryText(input.english, 300),
    };
    if (!result.chinese || !result.pinyin || !result.english) {
      throw createError(400, `Vocabulary item ${index + 1} is incomplete`);
    }
    return result;
  });

export const parseStoryQuestions = (value: unknown): INarratedStoryQuestion[] =>
  parseArray(value, 'questions').slice(0, 20).map((item, index) => {
    const input = (item || {}) as Record<string, unknown>;
    const options = Array.isArray(input.options)
      ? input.options.map(option => cleanStoryText(option, 300)).filter(Boolean).slice(0, 6)
      : [];
    const result = {
      prompt: cleanStoryText(input.prompt, 500),
      options,
      answer: cleanStoryText(input.answer, 300),
      explanation: cleanStoryText(input.explanation, 800),
    };
    if (!result.prompt || options.length < 2 || !result.answer || !result.explanation) {
      throw createError(400, `Question ${index + 1} requires a prompt, options, answer and explanation`);
    }
    return result;
  });

export const parseStoryAccessTier = (value: unknown): NarratedStoryAccessTier =>
  ['free', 'rewarded_or_premium', 'premium'].includes(String(value))
    ? String(value) as NarratedStoryAccessTier
    : 'rewarded_or_premium';

export const storyDuplicateQuery = (
  title: string,
  titleCn: string,
  segments: Array<Pick<INarratedStorySegment, 'chinese'>>,
  excludeId?: string,
): Record<string, unknown> => ({
  ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  $or: [
    { contentHash: storyContentHash(segments) },
    { titleKey: storyTitleKey(title) },
    { titleCnKey: storyTitleKey(titleCn) },
  ],
});
