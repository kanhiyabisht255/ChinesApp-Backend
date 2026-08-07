import { randomUUID } from 'crypto';
import mongoose, { type Model } from 'mongoose';
import { Request, Response } from 'express';
import {
  AIUsage,
  Lesson,
  ListeningLesson,
  NarratedStory,
  ReadingStory,
  RewardGrant,
  Scenario,
  User,
  VocabularyTopic,
} from '../models';
import type { AuthRequest, RewardedContentType } from '../types';
import { getAppConfig } from '../services/config.service';
import { hasActivePremium } from '../services/entitlement.service';
import { isRewardedContentType, rewardGrantAmount, rewardedUnlockIds } from '../services/reward.service';

type RewardType = 'content' | 'voiceCall' | 'voiceTurn';

const contentModels: Record<RewardedContentType, Model<any>> = {
  lesson: Lesson,
  reading: ReadingStory,
  listening: ListeningLesson,
  vocabulary: VocabularyTopic,
  story: NarratedStory,
  scenario: Scenario,
};

const idOrSlugQuery = (value: string): Record<string, unknown> =>
  mongoose.isValidObjectId(value)
    ? { $or: [{ _id: value }, { slug: value }] }
    : { slug: value };

const utcDayStart = (): Date => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

const claimsToday = (userId: string): Promise<number> =>
  RewardGrant.countDocuments({ userId, status: 'claimed', claimedAt: { $gte: utcDayStart() } });

export const prepareReward = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const rewardType = String(req.body.rewardType || '') as RewardType;
  if (!userId || !['content', 'voiceCall', 'voiceTurn'].includes(rewardType)) {
    res.status(400).json({ success: false, message: 'Valid reward type required' });
    return;
  }

  const [config, user] = await Promise.all([
    getAppConfig(),
    User.findById(userId).select('isPremium premiumExpiry').lean(),
  ]);
  if (!config.ads.enabled || !config.ads.rewardedEnabled || config.ads.maxRewardedAdsPerDay < 1) {
    res.status(503).json({ success: false, message: 'Rewarded unlocks are currently unavailable' });
    return;
  }
  if (user && hasActivePremium(user)) {
    res.status(409).json({ success: false, message: 'Premium already includes this access' });
    return;
  }

  const usedToday = await claimsToday(userId);
  if (usedToday >= config.ads.maxRewardedAdsPerDay) {
    res.status(429).json({ success: false, message: 'Daily rewarded-ad limit reached. Try again tomorrow or choose Premium.' });
    return;
  }

  let contentType: RewardedContentType | undefined;
  let contentId: string | undefined;
  if (rewardType === 'content') {
    if (!isRewardedContentType(req.body.contentType)) {
      res.status(400).json({ success: false, message: 'Valid content type required' });
      return;
    }
    const validContentType: RewardedContentType = req.body.contentType;
    contentType = validContentType;
    if (!config.ads.rewardedContentTypes.includes(validContentType)) {
      res.status(403).json({ success: false, message: 'This content is Premium-only' });
      return;
    }
    const requestedId = String(req.body.contentId || '').trim();
    const content = (requestedId
      ? await contentModels[validContentType].findOne({ ...idOrSlugQuery(requestedId), isPublished: true }).select('_id isPremium accessTier').lean()
      : null) as { _id: unknown; isPremium?: boolean } | null;
    if (!content) {
      res.status(404).json({ success: false, message: 'Content not found' });
      return;
    }
    if (!content.isPremium) {
      res.status(409).json({ success: false, message: 'This content is already free' });
      return;
    }
    if (validContentType === 'story' && (content as { accessTier?: string }).accessTier === 'premium') {
      res.status(403).json({ success: false, message: 'This story is Premium-only' });
      return;
    }
    contentId = String(content._id);
    const unlocked = await rewardedUnlockIds(userId, validContentType, [contentId]);
    if (unlocked.has(contentId)) {
      res.json({
        success: true,
        data: { alreadyUnlocked: true, contentType, contentId, remainingToday: config.ads.maxRewardedAdsPerDay - usedToday },
      });
      return;
    }
  } else {
    const date = new Date().toISOString().slice(0, 10);
    const usage = await AIUsage.findOne({ userId, date }).lean();
    const field = rewardType === 'voiceCall' ? 'voiceCalls' : 'voiceTurns';
    const limit = rewardType === 'voiceCall'
      ? config.monetization.freeVoiceCallsPerDay
      : config.monetization.freeVoiceTurnsPerDay;
    if (Number(usage?.[field] || 0) < limit) {
      res.status(409).json({ success: false, message: 'Use your remaining free AI quota before watching an ad' });
      return;
    }
  }

  const existingPending = await RewardGrant.findOne({
    userId,
    rewardType,
    ...(contentType ? { contentType, contentId } : {}),
    status: 'pending',
    expiresAt: { $gt: new Date() },
  }).lean();
  const rewardId = existingPending?.rewardId || `reward_${randomUUID()}`;
  const grantAmount = rewardGrantAmount(rewardType, config.ads);
  if (!existingPending) {
    await RewardGrant.create({
      rewardId,
      userId,
      rewardType,
      contentType,
      contentId,
      status: 'pending',
      grantAmount,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
  }

  res.json({
    success: true,
    data: {
      rewardId,
      rewardType,
      contentType,
      contentId,
      grantAmount,
      remainingToday: Math.max(0, config.ads.maxRewardedAdsPerDay - usedToday),
      unlockHours: rewardType === 'content' ? config.ads.contentUnlockHours : undefined,
    },
  });
};

export const claimReward = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const rewardId = String(req.body.rewardId || '');
  if (!userId || !rewardId.startsWith('reward_')) {
    res.status(400).json({ success: false, message: 'Valid reward ID required' });
    return;
  }
  const config = await getAppConfig();
  const existing = await RewardGrant.findOne({ userId, rewardId }).lean();
  if (existing?.status === 'claimed') {
    res.json({
      success: true,
      data: {
        alreadyClaimed: true,
        rewardType: existing.rewardType,
        contentType: existing.contentType,
        contentId: existing.contentId,
        grantAmount: existing.grantAmount,
        unlockedUntil: existing.rewardType === 'content' ? existing.expiresAt : undefined,
      },
    });
    return;
  }

  const session = await mongoose.startSession();
  let claimed: any = null;
  let remainingToday = 0;
  let failure: 'not_found' | 'daily_limit' | null = null;
  try {
    await session.withTransaction(async () => {
      const pending = await RewardGrant.findOne({
        userId,
        rewardId,
        status: 'pending',
        expiresAt: { $gt: new Date() },
      }).session(session);
      if (!pending) {
        failure = 'not_found';
        return;
      }
      const usedToday = await RewardGrant.countDocuments({
        userId,
        status: 'claimed',
        claimedAt: { $gte: utcDayStart() },
      }).session(session);
      if (usedToday >= config.ads.maxRewardedAdsPerDay) {
        failure = 'daily_limit';
        return;
      }

      const now = new Date();
      const expiresAt = pending.rewardType === 'content'
        ? new Date(now.getTime() + config.ads.contentUnlockHours * 60 * 60 * 1000)
        : new Date(now.getTime() + 48 * 60 * 60 * 1000);
      pending.status = 'claimed';
      pending.claimedAt = now;
      pending.expiresAt = expiresAt;
      await pending.save({ session });

      if (pending.rewardType === 'voiceCall' || pending.rewardType === 'voiceTurn') {
        const date = now.toISOString().slice(0, 10);
        const field = pending.rewardType === 'voiceCall' ? 'voiceCalls' : 'voiceTurns';
        const usage = await AIUsage.findOneAndUpdate(
          { userId, date },
          { $setOnInsert: { voiceCalls: 0, voiceTurns: 0, chatMessages: 0 } },
          { upsert: true, new: true, session },
        );
        // Negative usage represents earned credits when the configured free limit is zero.
        const nextUsage = Number(usage?.[field] || 0) - Number(pending.grantAmount || 1);
        await AIUsage.updateOne({ _id: usage?._id }, { $set: { [field]: nextUsage } }, { session });
      }
      claimed = pending.toObject();
      remainingToday = Math.max(0, config.ads.maxRewardedAdsPerDay - usedToday - 1);
    });
  } finally {
    await session.endSession();
  }

  if (!claimed) {
    const status = failure === 'daily_limit' ? 429 : 409;
    res.status(status).json({
      success: false,
      message: failure === 'daily_limit' ? 'Daily rewarded-ad limit reached' : 'Reward expired or already used',
    });
    return;
  }
  res.json({
    success: true,
    data: {
      rewardType: claimed.rewardType,
      contentType: claimed.contentType,
      contentId: claimed.contentId,
      grantAmount: claimed.grantAmount,
      unlockedUntil: claimed.rewardType === 'content' ? claimed.expiresAt : undefined,
      remainingToday,
    },
  });
};
