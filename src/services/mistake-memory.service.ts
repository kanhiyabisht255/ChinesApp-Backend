import { MistakeMemory } from '../models';

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 500);

export const recordMistake = async (userId: string, original: string, correction: string, explanation = '') => {
  const normalized = normalize(original);
  if (!normalized || !correction.trim()) return;
  await MistakeMemory.findOneAndUpdate(
    { userId, normalized },
    { $set: { original: original.slice(0, 500), correction: correction.slice(0, 1000), explanation: explanation.slice(0, 1000), lastSeenAt: new Date(), nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }, $inc: { count: 1 } },
    { upsert: true, new: true },
  );
};

export const getMistakes = async (userId: string, limit = 20) => MistakeMemory.find({ userId }).sort({ count: -1, lastSeenAt: -1 }).limit(Math.max(1, Math.min(limit, 100))).lean();

export const getMistakePromptContext = async (userId: string, limit = 5) => {
  const mistakes = await getMistakes(userId, limit);
  return mistakes.map(item => `Learner mistake: ${item.original} -> ${item.correction}${item.explanation ? ` (${item.explanation})` : ''}`).join('\n');
};
