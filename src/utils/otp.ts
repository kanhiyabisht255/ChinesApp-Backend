import crypto from 'crypto';
import { OTPCode } from '../models';

const isProduction = (): boolean => process.env.NODE_ENV === 'production';

export const normalizePhone = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;
  return `+${digits}`;
};

const hashOTP = (phone: string, otp: string): string => {
  const pepper = process.env.OTP_SECRET || process.env.JWT_SECRET || 'development-only-otp-secret';
  return crypto.createHmac('sha256', pepper).update(`${phone}:${otp}`).digest('hex');
};

export const generateOTP = (length: number = 6): string => {
  const max = 10 ** length;
  return crypto.randomInt(0, max).toString().padStart(length, '0');
};

export const storeOTP = async (phone: string, otp: string, expiresInMs: number = 5 * 60 * 1000): Promise<void> => {
  await OTPCode.findOneAndUpdate(
    { phone },
    {
      $set: {
        otpHash: hashOTP(phone, otp),
        attempts: 0,
        expiresAt: new Date(Date.now() + expiresInMs),
      },
    },
    { upsert: true, new: true }
  );
};

export const verifyOTP = async (phone: string, inputOTP: string): Promise<{ valid: boolean; message: string }> => {
  const stored = await OTPCode.findOne({ phone });
  
  if (!stored) {
    return { valid: false, message: 'OTP not found. Please request a new OTP.' };
  }
  
  if (Date.now() > stored.expiresAt.getTime()) {
    await stored.deleteOne();
    return { valid: false, message: 'OTP has expired. Please request a new OTP.' };
  }
  
  if (stored.attempts >= 3) {
    await stored.deleteOne();
    return { valid: false, message: 'Too many attempts. Please request a new OTP.' };
  }

  const expected = Buffer.from(stored.otpHash, 'hex');
  const actual = Buffer.from(hashOTP(phone, inputOTP), 'hex');
  const matches = expected.length === actual.length && crypto.timingSafeEqual(expected, actual);

  if (!matches) {
    stored.attempts += 1;
    await stored.save();
    return { valid: false, message: 'Invalid OTP. Please try again.' };
  }
  
  await stored.deleteOne();
  return { valid: true, message: 'OTP verified successfully.' };
};

export const sendOTPviaMSG91 = async (phone: string, otp: string): Promise<{ success: boolean; message: string }> => {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const senderId = process.env.MSG91_SENDER_ID || 'CHNAPP';
  
  if (!authKey || authKey === 'your-msg91-auth-key' || !templateId) {
    if (isProduction()) {
      return { success: false, message: 'OTP service is not configured' };
    }
    await storeOTP(phone, otp);
    console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
    return { success: true, message: 'OTP generated in development mode' };
  }
  
  try {
    const response = await fetch('https://control.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        'authkey': authKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_id: templateId,
        sender: senderId,
        mobiles: phone.replace(/^\+/, ''),
        var1: otp,
      }),
    });
    
    const data = await response.json() as { type?: string; message?: string };
    
    if (response.ok && data.type === 'success') {
      await storeOTP(phone, otp);
      return { success: true, message: 'OTP sent successfully' };
    }
    
    return { success: false, message: data.message || 'Failed to send OTP' };
  } catch (error) {
    console.error('MSG91 Error:', error);
    if (!isProduction()) {
      await storeOTP(phone, otp);
      console.log(`[DEV MODE] OTP fallback for ${phone}: ${otp}`);
      return { success: true, message: 'OTP generated in development mode' };
    }
    return { success: false, message: 'OTP provider is temporarily unavailable' };
  }
};

export const hashPhone = (phone: string): string => {
  return crypto.createHash('sha256').update(phone).digest('hex').slice(0, 16);
};
