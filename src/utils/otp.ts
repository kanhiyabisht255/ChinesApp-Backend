import crypto from 'crypto';

const OTP_STORE: Map<string, { otp: string; expiresAt: number; attempts: number }> = new Map();

export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

export const storeOTP = (phone: string, otp: string, expiresInMs: number = 5 * 60 * 1000): void => {
  OTP_STORE.set(phone, {
    otp,
    expiresAt: Date.now() + expiresInMs,
    attempts: 0,
  });
};

export const verifyOTP = (phone: string, inputOTP: string): { valid: boolean; message: string } => {
  const stored = OTP_STORE.get(phone);
  
  if (!stored) {
    return { valid: false, message: 'OTP not found. Please request a new OTP.' };
  }
  
  if (Date.now() > stored.expiresAt) {
    OTP_STORE.delete(phone);
    return { valid: false, message: 'OTP has expired. Please request a new otp.' };
  }
  
  if (stored.attempts >= 3) {
    OTP_STORE.delete(phone);
    return { valid: false, message: 'Too many attempts. Please request a new OTP.' };
  }
  
  stored.attempts++;
  
  if (stored.otp !== inputOTP) {
    return { valid: false, message: 'Invalid OTP. Please try again.' };
  }
  
  OTP_STORE.delete(phone);
  return { valid: true, message: 'OTP verified successfully.' };
};

export const sendOTPviaMSG91 = async (phone: string, otp: string): Promise<{ success: boolean; message: string }> => {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const senderId = process.env.MSG91_SENDER_ID || 'CHNAPP';
  
  if (!authKey || authKey === 'your-msg91-auth-key') {
    storeOTP(phone, otp);
    console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
    return { success: true, message: `OTP sent successfully (DEV: ${otp})` };
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
        mobiles: phone.startsWith('+') ? phone : `91${phone}`,
        var1: otp,
      }),
    });
    
    const data = await response.json() as { type?: string; message?: string };
    
    if (response.ok && data.type === 'success') {
      storeOTP(phone, otp);
      return { success: true, message: 'OTP sent successfully' };
    }
    
    return { success: false, message: data.message || 'Failed to send OTP' };
  } catch (error) {
    console.error('MSG91 Error:', error);
    storeOTP(phone, otp);
    return { success: true, message: `OTP sent (fallback). DEV: ${otp}` };
  }
};

export const hashPhone = (phone: string): string => {
  return crypto.createHash('sha256').update(phone).digest('hex').slice(0, 16);
};