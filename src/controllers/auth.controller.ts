import { Request, Response } from 'express';
import { User, Progress } from '../models';
import { generateOTP, normalizePhone, sendOTPviaMSG91, verifyOTP } from '../utils/otp';
import { generateToken } from '../utils/jwt';
import type { AuthRequest } from '../types';
import { normalizeLanguageCode } from '../services/localization.service';
import { hasActivePremium } from '../services/entitlement.service';
import { getIntegrationSecret } from '../services/integration-secrets.service';

export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  const phone = normalizePhone(req.body.phone);
  
  if (!phone) {
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
  const phone = normalizePhone(req.body.phone);
  const { otp, name, nativeLanguage, learningGoal } = req.body;

  if (!phone || !otp) {
    res.status(400).json({ success: false, message: 'Phone and OTP required' });
    return;
  }

  const verification = await verifyOTP(phone, String(otp));

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
      nativeLanguage: normalizeLanguageCode(nativeLanguage),
      learningGoal: learningGoal || 'general',
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
  
  const activePremium = hasActivePremium(user);
  if (user.isPremium !== activePremium) {
    user.isPremium = activePremium;
    await user.save();
  }

  const token = generateToken({
    userId: user._id.toString(),
    phone: user.phone,
    isPremium: activePremium,
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
        isPremium: activePremium,
        gems: user.gems,
        streak: user.streak,
        xp: user.xp,
        hskLevel: user.hskLevel,
        dailyGoal: user.dailyGoal,
        todayMinutes: user.todayMinutes,
        nativeLanguage: user.nativeLanguage,
        learningGoal: user.learningGoal,
      },
    },
  });
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  const { idToken, nativeLanguage, learningGoal } = req.body;
  const googleClientId = await getIntegrationSecret('GOOGLE_CLIENT_ID');

  if (!idToken) {
    res.status(400).json({ success: false, message: 'Google ID token required' });
    return;
  }

  if (!googleClientId) {
    res.status(503).json({ success: false, message: 'Google sign-in is not configured' });
    return;
  }

  const tokenResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!tokenResponse.ok) {
    res.status(401).json({ success: false, message: 'Invalid Google sign-in token' });
    return;
  }
  const identity = await tokenResponse.json() as {
    sub?: string;
    aud?: string;
    email?: string;
    email_verified?: string;
    name?: string;
    picture?: string;
  };
  if (!identity.sub || identity.aud !== googleClientId || identity.email_verified !== 'true') {
    res.status(401).json({ success: false, message: 'Google identity could not be verified' });
    return;
  }

  const googleId = identity.sub;
  let user = await User.findOne({ $or: [{ googleId }, ...(identity.email ? [{ email: identity.email }] : [])] });

  if (!user) {
    user = await User.create({
      googleId,
      email: identity.email,
      avatar: identity.picture,
      name: identity.name || 'Learner',
      phone: `google_${googleId}`,
      gems: 50,
      xp: 0,
      streak: 0,
      isPremium: false,
      dailyGoal: 10,
      todayMinutes: 0,
      hskLevel: 1,
      nativeLanguage: normalizeLanguageCode(nativeLanguage),
      learningGoal: learningGoal || 'general',
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
  } else if (!user.googleId) {
    user.googleId = googleId;
    if (!user.email) user.email = identity.email;
    if (!user.avatar) user.avatar = identity.picture;
    await user.save();
  }
  
  const activePremium = hasActivePremium(user);
  if (user.isPremium !== activePremium) {
    user.isPremium = activePremium;
    await user.save();
  }

  const token = generateToken({
    userId: user._id.toString(),
    phone: user.phone,
    isPremium: activePremium,
  });
  
  res.json({
    success: true,
    message: 'Google login successful',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        isPremium: activePremium,
        gems: user.gems,
        streak: user.streak,
        xp: user.xp,
        hskLevel: user.hskLevel,
        dailyGoal: user.dailyGoal,
        todayMinutes: user.todayMinutes,
        nativeLanguage: user.nativeLanguage,
        learningGoal: user.learningGoal,
      },
    },
  });
};

export const guestLogin = async (req: Request, res: Response): Promise<void> => {
  const { nativeLanguage, learningGoal } = req.body;
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
    nativeLanguage: normalizeLanguageCode(nativeLanguage),
    learningGoal: learningGoal || 'general',
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
        phone: user.phone,
        isPremium: user.isPremium,
        gems: user.gems,
        streak: user.streak,
        xp: user.xp,
        hskLevel: user.hskLevel,
        dailyGoal: user.dailyGoal,
        todayMinutes: user.todayMinutes,
        nativeLanguage: user.nativeLanguage,
        learningGoal: user.learningGoal,
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

  const activePremium = hasActivePremium(user);
  if (user.isPremium !== activePremium) {
    user.isPremium = activePremium;
    await user.save();
  }
  
  res.json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      avatar: user.avatar,
      isPremium: activePremium,
      premiumExpiry: user.premiumExpiry,
      gems: user.gems,
      xp: user.xp,
      streak: user.streak,
      dailyGoal: user.dailyGoal,
      todayMinutes: user.todayMinutes,
      hskLevel: user.hskLevel,
      nativeLanguage: user.nativeLanguage,
      learningGoal: user.learningGoal,
    },
  });
};
