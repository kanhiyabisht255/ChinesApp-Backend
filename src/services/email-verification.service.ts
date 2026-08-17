import crypto from 'crypto';
import { EmailVerificationCode } from '../models';
import { createError } from '../middleware/error';
import { getIntegrationSecret } from './integration-secrets.service';

const CODE_LENGTH = 6;
const CODE_TTL_MS = 10 * 60 * 1000;

export const normalizeEmail = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
};

const generateCode = (): string =>
  crypto.randomInt(0, 10 ** CODE_LENGTH).toString().padStart(CODE_LENGTH, '0');

const hashCode = (email: string, code: string): string => {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET || 'development-only-email-code-secret';
  return crypto.createHmac('sha256', secret).update(`${email}:${code}`).digest('hex');
};

const sendVerificationEmail = async (email: string, code: string): Promise<void> => {
  const apiKey = await getIntegrationSecret('RESEND_API_KEY');
  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      throw createError(503, 'Email verification is not configured');
    }
    console.log(`[DEV MODE] Email verification code for ${email}: ${code}`);
    return;
  }

  const from = process.env.EMAIL_FROM?.trim() || 'Learn Chinese <onboarding@resend.dev>';
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
        subject: 'Verify your Learn Chinese email',
        text: `Your Learn Chinese verification code is ${code}. It expires in 10 minutes.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#171717"><h2>Verify your Learn Chinese email</h2><p>Enter this code in the app:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px 0">${code}</div><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>`,
      }),
    });
  } catch {
    throw createError(503, 'Verification email could not be sent. Please try again');
  }

  if (!response.ok) {
    throw createError(503, 'Verification email could not be sent. Check the email provider configuration');
  }
};

export const issueEmailVerificationCode = async (email: string): Promise<void> => {
  const code = generateCode();
  await EmailVerificationCode.findOneAndUpdate(
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
    await sendVerificationEmail(email, code);
  } catch (error) {
    await EmailVerificationCode.deleteOne({ email });
    throw error;
  }
};

export const verifyEmailCode = async (
  email: string,
  code: string,
): Promise<{ valid: boolean; message: string }> => {
  const stored = await EmailVerificationCode.findOne({ email });
  if (!stored) return { valid: false, message: 'Verification code not found. Request a new code.' };

  if (stored.expiresAt.getTime() < Date.now()) {
    await stored.deleteOne();
    return { valid: false, message: 'Verification code has expired. Request a new code.' };
  }

  if (stored.attempts >= 5) {
    await stored.deleteOne();
    return { valid: false, message: 'Too many incorrect attempts. Request a new code.' };
  }

  const expected = Buffer.from(stored.otpHash, 'hex');
  const actual = Buffer.from(hashCode(email, code), 'hex');
  const matches = expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  if (!matches) {
    stored.attempts += 1;
    await stored.save();
    return { valid: false, message: 'Incorrect verification code.' };
  }

  await stored.deleteOne();
  return { valid: true, message: 'Email verified successfully.' };
};
