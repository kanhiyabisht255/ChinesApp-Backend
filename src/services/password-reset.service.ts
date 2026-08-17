import crypto from 'crypto';
import { PasswordResetCode, User } from '../models';
import { createError } from '../middleware/error';
import { getIntegrationSecret } from './integration-secrets.service';

const CODE_LENGTH = 6;
const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const generateCode = (): string =>
  crypto.randomInt(0, 10 ** CODE_LENGTH).toString().padStart(CODE_LENGTH, '0');

const hashCode = (email: string, code: string): string => {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET || 'development-only-password-reset-secret';
  return crypto.createHmac('sha256', secret).update(`${email}:password-reset:${code}`).digest('hex');
};

const sendResetCodeEmail = async (email: string, code: string): Promise<void> => {
  const apiKey = await getIntegrationSecret('RESEND_API_KEY');
  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      throw createError(503, 'Password reset email is not configured');
    }
    console.log(`[DEV MODE] Password reset code for ${email}: ${code}`);
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
        subject: 'Reset your Learn Chinese password',
        text: `Your Learn Chinese password reset code is ${code}. It expires in 10 minutes. If you did not request a password reset, ignore this email and your password will stay the same.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#171717"><h2>Reset your Learn Chinese password</h2><p>Enter this code in the app to choose a new password:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px 0">${code}</div><p>This code expires in 10 minutes. If you did not request a password reset, ignore this email and your password will stay the same.</p></div>`,
      }),
    });
  } catch {
    throw createError(503, 'Password reset email could not be sent. Please try again');
  }

  if (!response.ok) {
    throw createError(503, 'Password reset email could not be sent. Check the email provider configuration');
  }
};

export const issuePasswordResetCode = async (email: string): Promise<void> => {
  const userExists = await User.exists({ email });
  if (!userExists) return;

  const code = generateCode();
  await PasswordResetCode.findOneAndUpdate(
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
    await sendResetCodeEmail(email, code);
  } catch (error) {
    await PasswordResetCode.deleteOne({ email });
    throw error;
  }
};

export const verifyPasswordResetCode = async (
  email: string,
  code: string,
): Promise<{ valid: boolean; message: string }> => {
  const stored = await PasswordResetCode.findOne({ email });
  if (!stored) return { valid: false, message: 'Reset code not found. Request a new code.' };

  if (stored.expiresAt.getTime() < Date.now()) {
    await stored.deleteOne();
    return { valid: false, message: 'Reset code has expired. Request a new code.' };
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
    return { valid: false, message: 'Incorrect reset code.' };
  }

  await stored.deleteOne();
  return { valid: true, message: 'Reset code verified.' };
};
