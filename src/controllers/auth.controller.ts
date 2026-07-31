import { Request, Response } from 'express';
import { User, Progress } from '../models';
import { generateOTP, sendOTPviaMSG91, verifyOTP } from '../utils/otp';
import { generateToken } from '../utils/jwt';
import type { AuthRequest } from '../types';

export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  const { phone } = req.body;
  
  if (!phone || phone.length < 10) {
    res.status(400).json({ success: false, message: 'Valid phone number required' });
    return;
  }
  
  const otp = generateOTP(6);
  const result = await sendOTPviaMSG91(phone, otp);
  
  if (result.success) {
    res.json({ success: true, message: 'OTP sent successfully' });
  } else {
    res.status(500).json({ success: false, message: result.message });
  }
};

export const verifyOTPAndLogin = async (req: Request, res: Response): Promise<void> => {
  const { phone, otp, name } = req.body;
  
  if (!phone || !otp) {
    res.status(400).json({ success: false, message: 'Phone and OTP required' });
    return;
  }
  
  const verification = verifyOTP(phone, otp);
  
  if (!verification.valid) {
    res.status(400).json({ success: false, message: verification.message });
    return;
  }
  
  let user = await User.findOne({ phone });
  
  if (!user) {
    user = await User.create({
      phone,
      name: name || 'Learner',
      gems: 50,
      xp: 0,
      streak: 0,
      isPremium: false,
      dailyGoal: 10,
      todayMinutes: 0,
      hskLevel: 1,
    });
    
    await Progress.create({
      userId: user._id.toString(),
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
  }
  
  const token = generateToken({
    userId: user._id.toString(),
    phone: user.phone,
    isPremium: user.isPremium,
  });
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        isPremium: user.isPremium,
        gems: user.gems,
        streak: user.streak,
        xp: user.xp,
        hskLevel: user.hskLevel,
      },
    },
  });
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  const { googleId, email, name } = req.body;
  
  if (!googleId) {
    res.status(400).json({ success: false, message: 'Google ID required' });
    return;
  }
  
  let user = await User.findOne({ googleId });
  
  if (!user) {
    user = await User.create({
      googleId,
      email,
      name: name || 'Learner',
      phone: `google_${googleId.slice(0, 10)}`,
      gems: 50,
      xp: 0,
      streak: 0,
      isPremium: false,
      dailyGoal: 10,
      todayMinutes: 0,
      hskLevel: 1,
    });
    
    await Progress.create({
      userId: user._id.toString(),
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
  }
  
  const token = generateToken({
    userId: user._id.toString(),
    phone: user.phone,
    isPremium: user.isPremium,
  });
  
  res.json({
    success: true,
    message: 'Google login successful',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        gems: user.gems,
        streak: user.streak,
      },
    },
  });
};

export const guestLogin = async (req: Request, res: Response): Promise<void> => {
  const guestId = `guest_${Date.now()}`;
  
  const user = await User.create({
    phone: guestId,
    name: 'Guest',
    gems: 50,
    xp: 0,
    streak: 0,
    isPremium: false,
    dailyGoal: 10,
    todayMinutes: 0,
    hskLevel: 1,
  });
  
  await Progress.create({
    userId: user._id.toString(),
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
  
  const token = generateToken({
    userId: user._id.toString(),
    phone: user.phone,
    isPremium: user.isPremium,
  });
  
  res.json({
    success: true,
    message: 'Guest login successful',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        isPremium: user.isPremium,
        gems: user.gems,
      },
    },
  });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const user = await User.findById(authReq.userId);
  
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  
  res.json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      avatar: user.avatar,
      isPremium: user.isPremium,
      premiumExpiry: user.premiumExpiry,
      gems: user.gems,
      xp: user.xp,
      streak: user.streak,
      dailyGoal: user.dailyGoal,
      todayMinutes: user.todayMinutes,
      hskLevel: user.hskLevel,
    },
  });
};