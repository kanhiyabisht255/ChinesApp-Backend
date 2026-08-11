import crypto from 'crypto';
import {
  AccountDeletionCode,
  AIUsage,
  AIUsageEvent,
  AppAnalyticsEvent,
  CallSession,
  ChatMessage,
  EmailVerificationCode,
  GemTransaction,
  MistakeMemory,
  Progress,
  RealtimeSession,
  RewardGrant,
  Subscription,
  User,
  UserListeningProgress,
  UserNarratedStoryProgress,
  UserReadingProgress,
  UserVocabularyProgress,
  VocabularyReviewSession,
} from '../models';
import { createError } from '../middleware/error';
import { getIntegrationSecret } from './integration-secrets.service';

const CODE_LENGTH = 6;
const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const generateCode = (): string =>
  crypto.randomInt(0, 10 ** CODE_LENGTH).toString().padStart(CODE_LENGTH, '0');

const hashCode = (email: string, code: string): string => {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET || 'development-only-account-deletion-secret';
  return crypto.createHmac('sha256', secret).update(`${email}:account-deletion:${code}`).digest('hex');
};

const sendDeletionCodeEmail = async (email: string, code: string): Promise<void> => {
  const apiKey = await getIntegrationSecret('RESEND_API_KEY');
  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      throw createError(503, 'Account deletion email is not configured');
    }
    console.log(`[DEV MODE] Account deletion code for ${email}: ${code}`);
    return;
  }

  const from = process.env.EMAIL_FROM?.trim() || 'Learn Chines <onboarding@resend.dev>';
  let response: globalThis.Response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: 'Confirm deletion of your Learn Chines account',
        text: `Your Learn Chines account deletion code is ${code}. It expires in 10 minutes. Entering this code on the deletion page permanently deletes your account and associated app data. If you did not request deletion, ignore this email.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#171717"><h2>Confirm account deletion</h2><p>Enter this code on the Learn Chines account deletion page:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px 0">${code}</div><p>This code expires in 10 minutes. Confirming permanently deletes your account and associated app data. If you did not request deletion, ignore this email and your account will remain active.</p></div>`,
      }),
    });
  } catch {
    throw createError(503, 'Account deletion email could not be sent. Please try again');
  }

  if (!response.ok) {
    throw createError(503, 'Account deletion email could not be sent. Check the email provider configuration');
  }
};

export const issueAccountDeletionCode = async (email: string): Promise<void> => {
  const userExists = await User.exists({ email });
  if (!userExists) return;

  const code = generateCode();
  await AccountDeletionCode.findOneAndUpdate(
    { email },
    {
      $set: {
        otpHash: hashCode(email, code),
        attempts: 0,
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
      },
    },
    { upsert: true, new: true },
  );

  try {
    await sendDeletionCodeEmail(email, code);
  } catch (error) {
    await AccountDeletionCode.deleteOne({ email });
    throw error;
  }
};

export const verifyAccountDeletionCode = async (
  email: string,
  code: string,
): Promise<{ valid: boolean; message: string }> => {
  const stored = await AccountDeletionCode.findOne({ email });
  if (!stored) return { valid: false, message: 'Deletion code not found. Request a new code.' };

  if (stored.expiresAt.getTime() < Date.now()) {
    await stored.deleteOne();
    return { valid: false, message: 'Deletion code has expired. Request a new code.' };
  }

  if (stored.attempts >= MAX_ATTEMPTS) {
    await stored.deleteOne();
    return { valid: false, message: 'Too many incorrect attempts. Request a new code.' };
  }

  const expected = Buffer.from(stored.otpHash, 'hex');
  const actual = Buffer.from(hashCode(email, code), 'hex');
  const matches = expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  if (!matches) {
    stored.attempts += 1;
    await stored.save();
    return { valid: false, message: 'Incorrect deletion code.' };
  }

  await stored.deleteOne();
  return { valid: true, message: 'Deletion request verified.' };
};

export const deleteUserAccount = async (userId: string): Promise<boolean> => {
  const user = await User.findById(userId).select('email').lean();
  if (!user) return false;

  await Promise.all([
    Progress.deleteMany({ userId }),
    CallSession.deleteMany({ userId }),
    ChatMessage.deleteMany({ userId }),
    UserVocabularyProgress.deleteMany({ userId }),
    UserReadingProgress.deleteMany({ userId }),
    UserNarratedStoryProgress.deleteMany({ userId }),
    UserListeningProgress.deleteMany({ userId }),
    VocabularyReviewSession.deleteMany({ userId }),
    Subscription.deleteMany({ userId }),
    GemTransaction.deleteMany({ userId }),
    AIUsage.deleteMany({ userId }),
    AIUsageEvent.deleteMany({ userId }),
    AppAnalyticsEvent.deleteMany({ userId }),
    RealtimeSession.deleteMany({ userId }),
    MistakeMemory.deleteMany({ userId }),
    RewardGrant.deleteMany({ userId }),
  ]);

  const deleted = await User.findByIdAndDelete(userId);
  if (!deleted) return false;

  if (user.email) {
    await Promise.all([
      EmailVerificationCode.deleteOne({ email: user.email }),
      AccountDeletionCode.deleteOne({ email: user.email }),
    ]);
  }

  return true;
};
