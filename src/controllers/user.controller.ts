import { Request, Response } from 'express';
import { User, Progress, CallSession, GemTransaction } from '../models';
import type { AuthRequest } from '../types';
import { normalizeLanguageCode } from '../services/localization.service';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  
  const user = await User.findById(authReq.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  
  res.json({ success: true, data: user });
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
      totalSessions: 0,
      totalMinutes: 0,
      wordsLearned: 0,
    });
    res.json({ success: true, data: newProgress });
    return;
  }
  
  res.json({ success: true, data: progress });
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

  const values = Object.values(updates);
  updates.overall = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  
  const progress = await Progress.findOneAndUpdate(
    { userId: authReq.userId },
    { $set: updates },
    { new: true, upsert: true }
  );
  
  res.json({ success: true, message: 'Progress updated', data: progress });
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
  
  const user = await User.findById(authReq.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let newStreak = user.streak;
  
  if (user.lastStreakDate) {
    const lastDate = new Date(user.lastStreakDate);
    lastDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      newStreak = user.streak + 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }
  
  await user.updateOne({
    streak: newStreak,
    lastStreakDate: today,
  });
  
  res.json({ success: true, data: { streak: newStreak } });
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

export const getCallHistory = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  
  const calls = await CallSession.find({ userId: authReq.userId, status: { $ne: 'started' } })
    .sort({ createdAt: -1 })
    .limit(50);
  
  res.json({ success: true, data: calls });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: 'Logged out successfully' });
};
