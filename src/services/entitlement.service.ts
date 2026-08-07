import { AIUsage } from '../models';
import { getAppConfig } from './config.service';

export type AiQuotaType = 'voiceCalls' | 'voiceTurns' | 'chatMessages';
type QuotaResult = { allowed: boolean; remaining?: number; limit?: number; daily?: number; monthly?: number };

const utcDateKey = (): string => new Date().toISOString().slice(0, 10);
const utcMonthKey = (): string => new Date().toISOString().slice(0, 7);

export const hasActivePremium = (user: { isPremium?: boolean; premiumExpiry?: Date } | null | undefined): boolean => {
  if (!user) return false;
  if (user.premiumExpiry) return user.premiumExpiry > new Date();
  return Boolean(user.isPremium);
};

const ensure = async (userId: string, date: string) => AIUsage.findOneAndUpdate(
  { userId, date },
  { $setOnInsert: { voiceCalls: 0, voiceTurns: 0, chatMessages: 0, voiceSeconds: 0, estimatedCostUsd: 0 } },
  { upsert: true, new: true },
).lean();

export const consumeAiQuota = async (userId: string | undefined, type: AiQuotaType, isPremium: boolean): Promise<QuotaResult> => {
  const config = await getAppConfig();
  if (!userId) return { allowed: false, remaining: 0, limit: 0 };
  const ai = config.aiConfig;
  const date = utcDateKey();
  const month = utcMonthKey();
  const dailyLimit = type === 'chatMessages'
    ? (isPremium ? (ai.premiumChatMessagesPerDay || 100) : (ai.freeChatMessagesPerDay || 10))
    : type === 'voiceCalls'
      ? (isPremium ? 1000 : (ai.freeTalkMaxTurnsPerSession ? 1 : 1))
      : (isPremium ? 1000 : (ai.freeTalkMaxTurnsPerSession || 5));
  const monthlyLimit = type === 'chatMessages' && isPremium ? (ai.premiumChatMessagesPerMonth || 1000) : undefined;
  await ensure(userId, date);
  const daily = await AIUsage.findOneAndUpdate(
    { userId, date, [type]: { $lt: dailyLimit } },
    { $inc: { [type]: 1 } },
    { new: true },
  ).lean();
  if (!daily) return { allowed: false, remaining: 0, limit: dailyLimit, daily: dailyLimit };
  let monthlyUsed = 0;
  if (monthlyLimit) {
    const monthly = await ensure(userId, month);
    monthlyUsed = Number(monthly?.[type] || 0);
    if (monthlyUsed >= monthlyLimit) {
      await AIUsage.updateOne({ userId, date }, { $inc: { [type]: -1 } });
      return { allowed: false, remaining: 0, limit: monthlyLimit, daily: dailyLimit, monthly: monthlyLimit };
    }
    await AIUsage.updateOne({ userId, date: month }, { $inc: { [type]: 1 } });
    monthlyUsed += 1;
  }
  const used = Number(daily[type] || 0);
  return { allowed: true, remaining: Math.max(0, dailyLimit - used), limit: dailyLimit, daily: used, monthly: monthlyLimit ? monthlyUsed : undefined };
};

export const refundAiQuota = async (userId: string | undefined, type: AiQuotaType, _isPremium: boolean): Promise<void> => {
  if (!userId) return;
  const date = utcDateKey();
  await AIUsage.updateOne({ userId, date, [type]: { $gt: 0 } }, { $inc: { [type]: -1 } });
  if (type === 'chatMessages') {
    await AIUsage.updateOne({ userId, date: utcMonthKey(), [type]: { $gt: 0 } }, { $inc: { [type]: -1 } });
  }
};

export const recordAiMinutes = async (userId: string, seconds: number): Promise<void> => {
  const amount = Math.max(0, Math.floor(seconds));
  if (!amount) return;
  await Promise.all([utcDateKey(), utcMonthKey()].map(async date => {
    await ensure(userId, date);
    await AIUsage.updateOne({ userId, date }, { $inc: { voiceSeconds: amount } });
  }));
};

export const getAiUsage = async (userId: string, isPremium: boolean) => {
  const [config, day, month] = await Promise.all([getAppConfig(), ensure(userId, utcDateKey()), ensure(userId, utcMonthKey())]);
  const ai = config.aiConfig;
  return {
    chat: { usedToday: Number(day?.chatMessages || 0), dailyLimit: isPremium ? (ai.premiumChatMessagesPerDay || 100) : (ai.freeChatMessagesPerDay || 10), usedMonth: Number(month?.chatMessages || 0), monthlyLimit: isPremium ? (ai.premiumChatMessagesPerMonth || 1000) : undefined },
    talk: { usedSecondsToday: Number(day?.voiceSeconds || 0), dailyLimitSeconds: (isPremium ? (ai.premiumTalkMinutesPerDay || 20) : (ai.freeTalkMaxMinutesPerSession || 3)) * 60, usedSecondsMonth: Number(month?.voiceSeconds || 0), monthlyLimitSeconds: isPremium ? (ai.premiumTalkMinutesPerMonth || 300) * 60 : undefined },
    premium: isPremium,
  };
};
