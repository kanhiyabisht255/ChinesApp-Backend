import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  AIUsage,
  CallSession,
  ChatMessage,
  GemTransaction,
  Progress,
  RewardGrant,
  Subscription,
  User,
} from '../models';
import type { AuthRequest } from '../types';
import { normalizeLanguageCode } from '../services/localization.service';
import { getAppConfig } from '../services/config.service';
import {
  localWeekKey,
  normalizeTimezoneOffset,
  recordLearningActivity,
  visibleStreak,
  visibleTodayMinutes,
} from '../services/streak.service';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  
  const user = await User.findById(authReq.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  
  const timezoneOffset = normalizeTimezoneOffset(req.header('x-timezone-offset'));
  res.json({
    success: true,
    data: {
      ...user.toObject(),
      streak: visibleStreak(user.streak, user.lastStreakDate, new Date(), timezoneOffset),
      todayMinutes: visibleTodayMinutes(user.todayMinutes, user.lastDailyProgressDate, new Date(), timezoneOffset),
    },
  });
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { name, avatar, dailyGoal, nativeLanguage, hskLevel, learningGoal } = req.body;

  const updateFields: Record<string, unknown> = {};
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 60) {
      res.status(400).json({ success: false, message: 'Name must be between 1 and 60 characters' });
      return;
    }
    updateFields.name = name.trim();
  }
  if (avatar !== undefined) {
    if (avatar !== null && (typeof avatar !== 'string' || avatar.length > 500)) {
      res.status(400).json({ success: false, message: 'Invalid avatar URL' });
      return;
    }
    updateFields.avatar = avatar;
  }
  if (dailyGoal !== undefined) {
    const parsedGoal = Number(dailyGoal);
    if (!Number.isInteger(parsedGoal) || parsedGoal < 5 || parsedGoal > 180) {
      res.status(400).json({ success: false, message: 'Daily goal must be between 5 and 180 minutes' });
      return;
    }
    updateFields.dailyGoal = parsedGoal;
  }
  if (nativeLanguage !== undefined) updateFields.nativeLanguage = normalizeLanguageCode(nativeLanguage);
  if (hskLevel !== undefined) {
    const parsedLevel = Number(hskLevel);
    if (!Number.isInteger(parsedLevel) || parsedLevel < 1 || parsedLevel > 6) {
      res.status(400).json({ success: false, message: 'HSK level must be between 1 and 6' });
      return;
    }
    updateFields.hskLevel = parsedLevel;
  }
  if (learningGoal !== undefined) {
    if (!['general', 'travel', 'business', 'hsk', 'culture'].includes(learningGoal)) {
      res.status(400).json({ success: false, message: 'Invalid learning goal' });
      return;
    }
    updateFields.learningGoal = learningGoal;
  }

  const user = await User.findByIdAndUpdate(
    authReq.userId,
    { $set: updateFields },
    { new: true }
  );

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({ success: true, message: 'Profile updated', data: user });
};

export const getProgress = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const timezoneOffset = normalizeTimezoneOffset(req.header('x-timezone-offset'));
  const weekKey = localWeekKey(new Date(), timezoneOffset);
  
  const progress = await Progress.findOne({ userId: authReq.userId });
  
  if (!progress) {
    const newProgress = await Progress.create({
      userId: authReq.userId,
      speaking: 0,
      tones: 0,
      vocabulary: 0,
      grammar: 0,
      listening: 0,
      reading: 0,
      overall: 0,
      weeklyXp: [0, 0, 0, 0, 0, 0, 0],
      weeklyXpWeek: weekKey,
      totalSessions: 0,
      totalMinutes: 0,
      wordsLearned: 0,
    });
    res.json({ success: true, data: newProgress });
    return;
  }
  
  const data = progress.toObject();
  res.json({
    success: true,
    data: {
      ...data,
      weeklyXp: data.weeklyXpWeek === weekKey ? data.weeklyXp : [0, 0, 0, 0, 0, 0, 0],
      weeklyXpWeek: weekKey,
    },
  });
};

export const updateProgress = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const metricNames = ['speaking', 'tones', 'vocabulary', 'grammar', 'listening', 'reading'] as const;
  const updates: Record<string, number> = {};
  for (const metric of metricNames) {
    if (req.body[metric] !== undefined) {
      const value = Number(req.body[metric]);
      if (!Number.isFinite(value)) {
        res.status(400).json({ success: false, message: `Invalid ${metric} score` });
        return;
      }
      updates[metric] = Math.round(Math.max(0, Math.min(value, 100)));
    }
  }
  if (Object.keys(updates).length === 0) {
    res.status(400).json({ success: false, message: 'At least one progress metric is required' });
    return;
  }

  const current = await Progress.findOne({ userId: authReq.userId });
  const mergedScores = metricNames.map(metric => updates[metric] ?? Number(current?.[metric] || 0));
  updates.overall = Math.round(mergedScores.reduce((sum, value) => sum + value, 0) / metricNames.length);
  const practiceMinutes = Math.round(Math.max(1, Math.min(Number(req.body.practiceMinutes) || 3, 60)));
  const timezoneOffset = normalizeTimezoneOffset(req.header('x-timezone-offset'));
  const streak = await recordLearningActivity(authReq.userId, timezoneOffset, new Date(), undefined, practiceMinutes);
  if (streak === null) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  
  const progress = await Progress.findOneAndUpdate(
    { userId: authReq.userId },
    {
      $set: { ...updates, lastUpdated: new Date() },
      $inc: { totalSessions: 1, totalMinutes: practiceMinutes },
    },
    { new: true, upsert: true }
  );
  
  res.json({ success: true, message: 'Practice progress updated', data: { ...progress?.toObject(), streak } });
};

export const addXp = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { amount } = req.body;
  
  const user = await User.findByIdAndUpdate(
    authReq.userId,
    { $inc: { xp: amount } },
    { new: true }
  );
  
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  
  const progress = await Progress.findOne({ userId: authReq.userId });
  if (progress) {
    const dayIndex = new Date().getDay();
    const weeklyXp = progress.weeklyXp;
    weeklyXp[dayIndex] = (weeklyXp[dayIndex] || 0) + amount;
    await progress.updateOne({ weeklyXp });
  }
  
  res.json({ success: true, data: { xp: user.xp } });
};

export const updateStreak = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const timezoneOffset = normalizeTimezoneOffset(req.header('x-timezone-offset'));
  const streak = await recordLearningActivity(authReq.userId, timezoneOffset);

  if (streak === null) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({ success: true, data: { streak } });
};

export const getGems = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  
  const user = await User.findById(authReq.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  
  res.json({ success: true, data: { gems: user.gems } });
};

export const addGems = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { amount, paymentId } = req.body;
  
  const user = await User.findById(authReq.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  
  const newBalance = user.gems + amount;
  
  await user.updateOne({ gems: newBalance });
  
  await GemTransaction.create({
    userId: authReq.userId,
    type: 'purchase',
    amount,
    balance: newBalance,
    paymentId,
  });
  
  res.json({ success: true, data: { gems: newBalance } });
};

export const spendGems = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { amount, description } = req.body;
  const safeAmount = Number(amount);
  if (!Number.isInteger(safeAmount) || safeAmount <= 0 || safeAmount > 100000) {
    res.status(400).json({ success: false, message: 'Invalid gem amount' });
    return;
  }

  const user = await User.findOneAndUpdate(
    { _id: authReq.userId, gems: { $gte: safeAmount } },
    { $inc: { gems: -safeAmount } },
    { new: true }
  );
  if (!user) {
    res.status(400).json({ success: false, message: 'Insufficient gems' });
    return;
  }
  
  await GemTransaction.create({
    userId: authReq.userId,
    type: 'spend',
    amount: -safeAmount,
    balance: user.gems,
    description: typeof description === 'string' ? description.slice(0, 200) : undefined,
  });
  
  res.json({ success: true, data: { gems: user.gems } });
};

export const purchaseAiCredit = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const creditType = String(req.body.creditType || '');
  const config = await getAppConfig();
  const offers: Record<string, { field: 'voiceCalls' | 'voiceTurns' | 'chatMessages'; cost: number; label: string }> = {
    voiceCall: { field: 'voiceCalls', cost: config.monetization.voiceCallGemCost, label: 'one extra AI call' },
    voiceTurn: { field: 'voiceTurns', cost: config.monetization.voiceTurnGemCost, label: 'one extra speaking turn' },
    chatMessage: { field: 'chatMessages', cost: config.monetization.chatMessageGemCost, label: 'one extra AI chat message' },
  };
  const offer = offers[creditType];
  if (!offer) {
    res.status(400).json({ success: false, message: 'Invalid AI credit type' });
    return;
  }

  const date = new Date().toISOString().slice(0, 10);
  const dbSession = await mongoose.startSession();
  let balance: number | null = null;
  let failure: 'quota_available' | 'insufficient_gems' | null = null;
  try {
    await dbSession.withTransaction(async () => {
      const usage = await AIUsage.findOne({ userId: authReq.userId, date }).session(dbSession);
      if (!usage || Number(usage[offer.field] || 0) <= 0) {
        failure = 'quota_available';
        return;
      }
      const user = await User.findOneAndUpdate(
        { _id: authReq.userId, gems: { $gte: offer.cost } },
        { $inc: { gems: -offer.cost } },
        { new: true, session: dbSession },
      );
      if (!user) {
        failure = 'insufficient_gems';
        return;
      }
      await AIUsage.updateOne(
        { _id: usage._id, [offer.field]: { $gt: 0 } },
        { $inc: { [offer.field]: -1 } },
        { session: dbSession },
      );
      balance = user.gems;
      await GemTransaction.create([{
        userId: authReq.userId,
        type: 'spend',
        amount: -offer.cost,
        balance: user.gems,
        description: `Unlocked ${offer.label}`,
      }], { session: dbSession });
    });
  } finally {
    await dbSession.endSession();
  }

  if (failure === 'quota_available') {
    res.status(409).json({ success: false, message: 'Your free quota is still available; no gems were spent.' });
    return;
  }
  if (failure === 'insufficient_gems' || balance === null) {
    res.status(400).json({ success: false, message: `You need ${offer.cost} gems for ${offer.label}.` });
    return;
  }
  res.json({
    success: true,
    message: `${offer.label} unlocked`,
    data: { gems: balance, cost: offer.cost, creditType },
  });
};

export const getCallHistory = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  
  const calls = await CallSession.find({ userId: authReq.userId, status: { $ne: 'started' } })
    .sort({ createdAt: -1 })
    .limit(50);
  
  res.json({ success: true, data: calls });
};

export const getPurchaseHistory = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const [subscriptions, gemPurchases] = await Promise.all([
    Subscription.find({ userId: authReq.userId }).sort({ createdAt: -1 }).lean(),
    GemTransaction.find({ userId: authReq.userId, type: 'purchase' }).sort({ createdAt: -1 }).lean(),
  ]);

  const records = [
    ...subscriptions.map(subscription => ({
      id: subscription._id.toString(),
      type: 'premium',
      title: `${subscription.planId.charAt(0).toUpperCase()}${subscription.planId.slice(1)} Premium`,
      description: `Premium access until ${subscription.endDate.toISOString().slice(0, 10)}`,
      status: subscription.status,
      amount: subscription.amount,
      currency: 'INR',
      date: subscription.createdAt.toISOString(),
    })),
    ...gemPurchases.map(transaction => ({
      id: transaction._id.toString(),
      type: 'gems',
      title: `${transaction.amount} gems added`,
      description: transaction.description || 'Gem purchase',
      status: 'completed',
      date: transaction.createdAt.toISOString(),
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  res.json({ success: true, data: records });
};

export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const userId = authReq.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  await Promise.all([
    Progress.deleteMany({ userId }),
    CallSession.deleteMany({ userId }),
    ChatMessage.deleteMany({ userId }),
    Subscription.deleteMany({ userId }),
    GemTransaction.deleteMany({ userId }),
    AIUsage.deleteMany({ userId }),
    RewardGrant.deleteMany({ userId }),
  ]);
  const deleted = await User.findByIdAndDelete(userId);
  if (!deleted) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({ success: true, message: 'Account and learning data deleted' });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: 'Logged out successfully' });
};
