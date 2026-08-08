import { AIUsage, RewardGrant } from '../models';
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
      // Call starts are a separate guard from talk minutes/turns. Respect the
      // monetization setting here; the old expression always reduced free
      // users to one call even when Admin configured a different value.
      ? (isPremium ? 1000 : Math.max(0, config.monetization.freeVoiceCallsPerDay))
      : (isPremium ? 1000 : Math.max(0, config.monetization.freeVoiceTurnsPerDay));
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

export const recordAiCounter = async (userId: string, type: 'voiceCalls' | 'voiceTurns'): Promise<void> => {
  const date = utcDateKey();
  await ensure(userId, date);
  await AIUsage.updateOne({ userId, date }, { $inc: { [type]: 1 } });
};

export const getAiUsage = async (userId: string, isPremium: boolean) => {
  const dayStart = new Date(`${utcDateKey()}T00:00:00.000Z`);
  const [config, day, month, rewardRows] = await Promise.all([
    getAppConfig(),
    ensure(userId, utcDateKey()),
    ensure(userId, utcMonthKey()),
    RewardGrant.aggregate([
      { $match: { userId, source: { $ne: 'gems' }, status: 'claimed', claimedAt: { $gte: dayStart } } },
      { $group: { _id: '$rewardType', count: { $sum: 1 } } },
    ]),
  ]);
  const ai = config.aiConfig;
  const rawChatUsedToday = Number(day?.chatMessages || 0);
  const rawTalkUsedToday = Number(day?.voiceSeconds || 0);
  const rawCallsUsedToday = Number(day?.voiceCalls || 0);
  const baseChatLimit = isPremium ? (ai.premiumChatMessagesPerDay || 100) : (ai.freeChatMessagesPerDay || 10);
  const baseTalkLimitSeconds = (isPremium
    ? (ai.premiumTalkMinutesPerDay || 20)
    : (ai.freeTalkDemoMinutesPerDay || ai.freeTalkMaxMinutesPerSession || 3)) * 60;
  const voiceCallLimit = isPremium ? 1000 : Math.max(3, config.aiConfig.maxTalkSessionStartsPerDay || 10);
  const rewardCounts = new Map<string, number>(rewardRows.map(row => [String(row._id), Number(row.count || 0)]));
  const contentRewards = rewardCounts.get('content') || 0;
  const chatRewards = rewardCounts.get('chatMessages') || 0;
  const talkRewards = (rewardCounts.get('talkMinutes') || 0) + (rewardCounts.get('voiceCall') || 0) + (rewardCounts.get('voiceTurn') || 0);
  const totalRewards = [...rewardCounts.values()].reduce((sum, count) => sum + count, 0);
  return {
    chat: {
      usedToday: Math.max(0, rawChatUsedToday),
      dailyLimit: baseChatLimit + Math.max(0, -rawChatUsedToday),
      usedMonth: Number(month?.chatMessages || 0),
      monthlyLimit: isPremium ? (ai.premiumChatMessagesPerMonth || 1000) : undefined,
    },
    talk: {
      usedSecondsToday: Math.max(0, rawTalkUsedToday),
      dailyLimitSeconds: baseTalkLimitSeconds + Math.max(0, -rawTalkUsedToday),
      usedSecondsMonth: Number(month?.voiceSeconds || 0),
      monthlyLimitSeconds: isPremium ? (ai.premiumTalkMinutesPerMonth || 300) * 60 : undefined,
      usedCallsToday: Math.max(0, rawCallsUsedToday),
      dailyCallLimit: voiceCallLimit + Math.max(0, -rawCallsUsedToday),
    },
    rewards: {
      contentUsedToday: contentRewards,
      contentDailyLimit: config.ads.maxContentRewardedAdsPerDay ?? 5,
      chatUsedToday: chatRewards,
      chatDailyLimit: config.ads.maxChatRewardedAdsPerDay ?? 1,
      talkUsedToday: talkRewards,
      talkDailyLimit: config.ads.maxTalkRewardedAdsPerDay ?? 2,
      totalUsedToday: totalRewards,
      totalDailyLimit: config.ads.maxRewardedAdsPerDay,
    },
    premium: isPremium,
  };
};
