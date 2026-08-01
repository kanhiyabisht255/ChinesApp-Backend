import { AIUsage } from '../models';
import { getAppConfig } from './config.service';

export type AiQuotaType = 'voiceCalls' | 'voiceTurns' | 'chatMessages';

const utcDateKey = (): string => new Date().toISOString().slice(0, 10);

export const hasActivePremium = (user: { isPremium?: boolean; premiumExpiry?: Date } | null | undefined): boolean => {
  if (!user) return false;
  if (user.premiumExpiry) return user.premiumExpiry > new Date();
  return Boolean(user.isPremium);
};

export const consumeAiQuota = async (
  userId: string | undefined,
  type: AiQuotaType,
  isPremium: boolean
): Promise<{ allowed: boolean; remaining?: number; limit?: number }> => {
  if (isPremium) return { allowed: true };
  const config = await getAppConfig();
  const freeLimits: Record<AiQuotaType, number> = {
    voiceCalls: config.monetization.freeVoiceCallsPerDay,
    voiceTurns: config.monetization.freeVoiceTurnsPerDay,
    chatMessages: config.monetization.freeChatMessagesPerDay,
  };
  if (!userId) return { allowed: false, remaining: 0, limit: freeLimits[type] };

  const date = utcDateKey();
  const limit = freeLimits[type];
  await AIUsage.findOneAndUpdate(
    { userId, date },
    { $setOnInsert: { voiceCalls: 0, voiceTurns: 0, chatMessages: 0 } },
    { upsert: true }
  );
  const usage = await AIUsage.findOneAndUpdate(
    { userId, date, [type]: { $lt: limit } },
    { $inc: { [type]: 1 } },
    { new: true }
  ).lean();
  if (!usage) return { allowed: false, remaining: 0, limit };
  const used = Number(usage[type] || 0);
  return { allowed: true, remaining: Math.max(0, limit - used), limit };
};

export const refundAiQuota = async (
  userId: string | undefined,
  type: AiQuotaType,
  isPremium: boolean
): Promise<void> => {
  if (isPremium || !userId) return;
  await AIUsage.updateOne(
    { userId, date: utcDateKey(), [type]: { $gt: 0 } },
    { $inc: { [type]: -1 } }
  );
};
