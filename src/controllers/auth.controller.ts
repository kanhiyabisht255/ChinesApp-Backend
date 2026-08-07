import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { Progress, User } from '../models';
import { generateToken } from '../utils/jwt';
import type { AuthRequest } from '../types';
import { normalizeLanguageCode } from '../services/localization.service';
import { hasActivePremium } from '../services/entitlement.service';
import { getIntegrationSecret } from '../services/integration-secrets.service';
import {
  issueEmailVerificationCode,
  normalizeEmail,
  verifyEmailCode,
} from '../services/email-verification.service';
import { normalizeTimezoneOffset, visibleStreak, visibleTodayMinutes } from '../services/streak.service';

const passwordIsValid = (value: unknown): value is string =>
  typeof value === 'string' && value.length >= 8 && value.length <= 128;

const createProgressIfMissing = async (userId: string): Promise<void> => {
  await Progress.updateOne(
    { userId },
    {
      $setOnInsert: {
        userId,
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
      },
    },
    { upsert: true },
  );
};

const userPayload = (user: any, activePremium = hasActivePremium(user)) => ({
  id: user._id,
  name: user.name,
  phone: user.phone || '',
  email: user.email,
  emailVerified: Boolean(user.emailVerified),
  avatar: user.avatar,
  isPremium: activePremium,
  premiumExpiry: user.premiumExpiry,
  gems: user.gems,
  streak: user.streak,
  xp: user.xp,
  dailyGoal: user.dailyGoal,
  todayMinutes: user.todayMinutes,
  hskLevel: user.hskLevel,
  nativeLanguage: user.nativeLanguage,
  learningGoal: user.learningGoal,
});

const issueAuthResponse = async (res: Response, user: any, message: string): Promise<void> => {
  const activePremium = hasActivePremium(user);
  if (user.isPremium !== activePremium) {
    user.isPremium = activePremium;
    await user.save();
  }

  const token = generateToken({
    userId: user._id.toString(),
    phone: user.phone || user.email || '',
    isPremium: activePremium,
  });

  res.json({
    success: true,
    message,
    data: { token, user: userPayload(user, activePremium) },
  });
};

export const registerWithEmail = async (req: Request, res: Response): Promise<void> => {
  const email = normalizeEmail(req.body?.email);
  const { name, password, nativeLanguage, learningGoal } = req.body || {};
  if (!email) {
    res.status(400).json({ success: false, message: 'Valid email address required' });
    return;
  }
  if (!passwordIsValid(password)) {
    res.status(400).json({ success: false, message: 'Password must be 8 to 128 characters' });
    return;
  }
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
    res.status(400).json({ success: false, message: 'Name must be 2 to 80 characters' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  let user = await User.findOne({ email }).select('+passwordHash');
  if (user?.emailVerified) {
    res.status(409).json({ success: false, message: 'An account already exists for this email. Sign in instead.' });
    return;
  }

  if (user) {
    user.passwordHash = passwordHash;
    user.name = name.trim();
    user.nativeLanguage = normalizeLanguageCode(nativeLanguage);
    user.learningGoal = learningGoal || 'general';
    user.emailVerified = false;
    await user.save();
  } else {
    user = await User.create({
      email,
      passwordHash,
      emailVerified: false,
      name: name.trim(),
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
  }

  await createProgressIfMissing(user._id.toString());
  await issueEmailVerificationCode(email);
  res.json({
    success: true,
    message: 'Verification code sent to your email',
    data: { email },
  });
};

export const resendEmailVerification = async (req: Request, res: Response): Promise<void> => {
  const email = normalizeEmail(req.body?.email);
  if (!email) {
    res.status(400).json({ success: false, message: 'Valid email address required' });
    return;
  }
  const user = await User.findOne({ email }).select('email emailVerified');
  if (!user) {
    res.status(404).json({ success: false, message: 'Account not found. Create an account first.' });
    return;
  }
  if (user.emailVerified) {
    res.status(400).json({ success: false, message: 'This email is already verified. Sign in instead.' });
    return;
  }
  await issueEmailVerificationCode(email);
  res.json({ success: true, message: 'Verification code sent to your email', data: { email } });
};

export const verifyEmailAndLogin = async (req: Request, res: Response): Promise<void> => {
  const email = normalizeEmail(req.body?.email);
  const code = String(req.body?.code || '').trim();
  if (!email || !/^\d{6}$/.test(code)) {
    res.status(400).json({ success: false, message: 'Valid email and 6-digit verification code required' });
    return;
  }

  const verification = await verifyEmailCode(email, code);
  if (!verification.valid) {
    res.status(400).json({ success: false, message: verification.message });
    return;
  }

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    res.status(404).json({ success: false, message: 'Account not found. Create an account first.' });
    return;
  }
  user.emailVerified = true;
  await user.save();
  await issueAuthResponse(res, user, 'Email verified successfully');
};

export const loginWithEmail = async (req: Request, res: Response): Promise<void> => {
  const email = normalizeEmail(req.body?.email);
  const { password } = req.body || {};
  if (!email || typeof password !== 'string' || !password) {
    res.status(400).json({ success: false, message: 'Email and password required' });
    return;
  }

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }
  if (!user.emailVerified) {
    res.status(403).json({ success: false, message: 'Please verify your email before signing in', code: 'EMAIL_NOT_VERIFIED' });
    return;
  }
  await issueAuthResponse(res, user, 'Login successful');
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
  const email = normalizeEmail(identity.email);
  if (!identity.sub || identity.aud !== googleClientId || identity.email_verified !== 'true' || !email) {
    res.status(401).json({ success: false, message: 'Google identity could not be verified' });
    return;
  }

  const googleId = identity.sub;
  let user = await User.findOne({ $or: [{ googleId }, { email }] }).select('+passwordHash');
  if (!user) {
    user = await User.create({
      googleId,
      email,
      emailVerified: true,
      avatar: identity.picture,
      name: identity.name || 'Learner',
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
    await createProgressIfMissing(user._id.toString());
  } else {
    user.googleId = googleId;
    user.email = user.email || email;
    user.emailVerified = true;
    if (!user.avatar) user.avatar = identity.picture;
    await user.save();
    await createProgressIfMissing(user._id.toString());
  }

  await issueAuthResponse(res, user, 'Google login successful');
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
  const timezoneOffset = normalizeTimezoneOffset(req.header('x-timezone-offset'));
  res.json({
    success: true,
    data: userPayload({
      ...user.toObject(),
      streak: visibleStreak(user.streak, user.lastStreakDate, new Date(), timezoneOffset),
      todayMinutes: visibleTodayMinutes(user.todayMinutes, user.lastDailyProgressDate, new Date(), timezoneOffset),
    }, activePremium),
  });
};
