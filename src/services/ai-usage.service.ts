import { AIUsageEvent } from '../models';
import { getAppConfig } from './config.service';

export type AIUsageFeature = 'chat' | 'talk_transcription' | 'talk_response' | 'talk_tts' | 'talk_realtime';

export const recordAiUsageEvent = async (event: {
  userId?: string;
  premium: boolean;
  feature: AIUsageFeature;
  provider?: string;
  model?: string;
  status: 'success' | 'failure';
  inputTokens?: number;
  outputTokens?: number;
  inputAudioSeconds?: number;
  outputAudioSeconds?: number;
  durationMs?: number;
  estimatedCostUsd?: number;
  metadata?: Record<string, unknown>;
}) => AIUsageEvent.create({
  userId: event.userId,
  plan: event.premium ? 'premium' : 'free',
  provider: event.provider || 'openai',
  feature: event.feature,
  model: event.model,
  status: event.status,
  inputTokens: event.inputTokens || 0,
  outputTokens: event.outputTokens || 0,
  inputAudioSeconds: event.inputAudioSeconds || 0,
  outputAudioSeconds: event.outputAudioSeconds || 0,
  durationMs: event.durationMs || 0,
  estimatedCostUsd: event.estimatedCostUsd || 0,
  metadata: event.metadata || {},
}).catch(error => console.error('AI usage ledger write failed:', error));

type BudgetCheck = { allowed: boolean; scope?: 'global' | 'user_daily' | 'user_monthly' };
const budgetCache = new Map<string, { expiresAt: number; value: BudgetCheck }>();

const spendSince = async (start: Date, userId?: string): Promise<number> => {
  const match: Record<string, unknown> = { createdAt: { $gte: start } };
  if (userId) match.userId = userId;
  const result = await AIUsageEvent.aggregate([
    { $match: match },
    { $group: { _id: null, cost: { $sum: '$estimatedCostUsd' } } },
  ]);
  return Number(result[0]?.cost || 0);
};

export const checkAiSpendBudget = async (userId: string | undefined, premium: boolean): Promise<BudgetCheck> => {
  const cacheKey = `${userId || 'anonymous'}:${premium ? 'premium' : 'free'}`;
  const cached = budgetCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const config = await getAppConfig();
  const now = new Date();
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const [globalDay, globalMonth, userDay, userMonth] = await Promise.all([
    spendSince(dayStart),
    spendSince(monthStart),
    userId ? spendSince(dayStart, userId) : Promise.resolve(0),
    userId ? spendSince(monthStart, userId) : Promise.resolve(0),
  ]);

  let value: BudgetCheck = { allowed: true };
  if ((config.aiConfig.globalDailyBudgetUsd || 0) > 0 && globalDay >= (config.aiConfig.globalDailyBudgetUsd || 0)) {
    value = { allowed: false, scope: 'global' };
  } else if ((config.aiConfig.globalMonthlyBudgetUsd || 0) > 0 && globalMonth >= (config.aiConfig.globalMonthlyBudgetUsd || 0)) {
    value = { allowed: false, scope: 'global' };
  } else {
    const dailyCap = premium ? (config.aiConfig.premiumUserDailyCostCapUsd || 0) : (config.aiConfig.freeUserDailyCostCapUsd || 0);
    if (dailyCap > 0 && userDay >= dailyCap) value = { allowed: false, scope: 'user_daily' };
    const monthlyCap = premium ? (config.aiConfig.premiumUserMonthlyCostCapUsd || 0) : 0;
    if (value.allowed && monthlyCap > 0 && userMonth >= monthlyCap) value = { allowed: false, scope: 'user_monthly' };
  }
  budgetCache.set(cacheKey, { expiresAt: Date.now() + 15_000, value });
  return value;
};
