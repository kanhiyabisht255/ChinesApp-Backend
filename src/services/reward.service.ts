import { RewardGrant, User } from '../models';
import { hasActivePremium } from './entitlement.service';
import type { RewardedContentType } from '../types';

export const REWARDED_CONTENT_TYPES: RewardedContentType[] = [
  'lesson',
  'reading',
  'listening',
  'vocabulary',
  'story',
  'scenario',
];

export const isRewardedContentType = (value: unknown): value is RewardedContentType =>
  typeof value === 'string' && REWARDED_CONTENT_TYPES.includes(value as RewardedContentType);

export const rewardGrantAmount = (
  rewardType: 'content' | 'voiceCall' | 'voiceTurn',
  config: { voiceCallsPerReward: number; voiceTurnsPerReward: number },
): number => {
  if (rewardType === 'voiceCall') return Math.max(1, Math.round(config.voiceCallsPerReward));
  if (rewardType === 'voiceTurn') return Math.max(1, Math.round(config.voiceTurnsPerReward));
  return 1;
};

export const rewardedUnlockIds = async (
  userId: string | undefined,
  contentType: RewardedContentType,
  contentIds?: string[],
): Promise<Set<string>> => {
  if (!userId) return new Set();
  const query: Record<string, unknown> = {
    userId,
    rewardType: 'content',
    contentType,
    status: 'claimed',
    expiresAt: { $gt: new Date() },
  };
  if (contentIds?.length) query.contentId = { $in: contentIds };
  const grants = await RewardGrant.find(query).select('contentId').lean();
  return new Set(grants.map(grant => String(grant.contentId || '')).filter(Boolean));
};

export const contentAccess = async (
  userId: string | undefined,
  contentType: RewardedContentType,
  contentIds: string[],
): Promise<{ premium: boolean; unlockedIds: Set<string> }> => {
  if (!userId) return { premium: false, unlockedIds: new Set() };
  const user = await User.findById(userId).select('isPremium premiumExpiry').lean();
  if (user && hasActivePremium(user)) return { premium: true, unlockedIds: new Set(contentIds) };
  return {
    premium: false,
    unlockedIds: await rewardedUnlockIds(userId, contentType, contentIds),
  };
};

export const hasContentAccess = async (
  userId: string | undefined,
  contentType: RewardedContentType,
  contentId: string,
): Promise<boolean> => {
  const access = await contentAccess(userId, contentType, [contentId]);
  return access.premium || access.unlockedIds.has(contentId);
};
