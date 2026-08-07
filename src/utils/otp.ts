import crypto from 'crypto';

export const normalizePhone = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;
  return `+${digits}`;
};

export const generateOTP = (length: number = 6): string => {
  const max = 10 ** length;
  return crypto.randomInt(0, max).toString().padStart(length, '0');
};

export const hashPhone = (phone: string): string => {
  return crypto.createHash('sha256').update(phone).digest('hex').slice(0, 16);
};
