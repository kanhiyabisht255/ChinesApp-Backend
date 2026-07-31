import jwt from 'jsonwebtoken';

const getJwtExpiresIn = (): jwt.SignOptions['expiresIn'] =>
  (process.env.JWT_EXPIRES_IN || '30d') as jwt.SignOptions['expiresIn'];
const PLACEHOLDER_SECRETS = new Set([
  'your-super-secret-jwt-key',
  'your-super-secret-jwt-key-change-in-production',
]);

const getJwtSecret = (): string => {
  const configured = process.env.JWT_SECRET?.trim();
  if (configured && !PLACEHOLDER_SECRETS.has(configured)) return configured;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured with a strong unique value in production');
  }
  return 'development-only-jwt-secret-do-not-deploy';
};

export const assertJwtConfigured = (): void => {
  getJwtSecret();
};

export interface JwtPayload {
  userId: string;
  phone: string;
  isPremium: boolean;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: getJwtExpiresIn() });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    return null;
  }
};

export const extractToken = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
};
