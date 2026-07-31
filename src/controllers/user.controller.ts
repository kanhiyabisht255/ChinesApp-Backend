import { Request, Response } from 'express';
import { User, Progress, CallSession, GemTransaction } from '../models';
import type { AuthRequest } from '../types';

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
  const { name, avatar, dailyGoal } = req.body;
  
  const user = await User.findByIdAndUpdate(
    authReq.userId,
    { $set: { name, avatar, dailyGoal } },
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
  const updates = req.body;
  
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
  
  const user = await User.findById(authReq.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  
  if (user.gems < amount) {
    res.status(400).json({ success: false, message: 'Insufficient gems' });
    return;
  }
  
  const newBalance = user.gems - amount;
  
  await user.updateOne({ gems: newBalance });
  
  await GemTransaction.create({
    userId: authReq.userId,
    type: 'spend',
    amount: -amount,
    balance: newBalance,
    description,
  });
  
  res.json({ success: true, data: { gems: newBalance } });
};

export const getCallHistory = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  
  const calls = await CallSession.find({ userId: authReq.userId })
    .sort({ createdAt: -1 })
    .limit(50);
  
  res.json({ success: true, data: calls });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: 'Logged out successfully' });
};