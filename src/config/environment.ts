import { getMongoUri } from './database';
import { assertJwtConfigured } from '../utils/jwt';

export const validateEnvironment = (): void => {
  getMongoUri();
  assertJwtConfigured();

  const warnings: string[] = [];
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-your-')) {
    warnings.push('OPENAI_API_KEY is missing; AI chat and voice will return unavailable');
  }
  if (!process.env.ADMIN_EMAIL || (!process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD_HASH)) {
    warnings.push('Admin credentials are missing; admin login will be unavailable');
  }
  if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
    warnings.push('FRONTEND_URL is missing; browser-based admin requests from another origin will be blocked');
  }
  if (!process.env.GOOGLE_CLIENT_ID) {
    warnings.push('GOOGLE_CLIENT_ID is missing; Google Sign-In will be unavailable');
  }
  if (!process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON && !process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64) {
    warnings.push('Google Play service account is missing; Android purchases cannot be verified');
  }
  if (!process.env.ADMIN_CONFIG_ENCRYPTION_KEY) {
    warnings.push('ADMIN_CONFIG_ENCRYPTION_KEY is missing; integration secrets cannot be saved from admin');
  }
  warnings.forEach(message => console.warn(`⚠️ ${message}`));
};
