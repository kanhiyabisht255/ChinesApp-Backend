import crypto from 'crypto';
import { AppSetting } from '../models';
import { createError } from '../middleware/error';

type SecretName =
  | 'OPENAI_API_KEY'
  | 'GOOGLE_CLIENT_ID'
  | 'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON'
  | 'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64'
  | 'MSG91_AUTH_KEY'
  | 'MSG91_TEMPLATE_ID'
  | 'MSG91_SENDER_ID'
  | 'RAZORPAY_KEY_ID'
  | 'RAZORPAY_KEY_SECRET'
  | 'YOUBOT_API_KEY'
  | 'GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON'
  | 'GOOGLE_DRIVE_FOLDER_ID';

export type IntegrationSecretUpdates = Partial<Record<SecretName, string | null>>;

interface EncryptedSecretStore {
  version: 1;
  iv: string;
  tag: string;
  data: string;
}

const SETTING_KEY = 'integration-secrets';
let cachedSecrets: Record<string, string> | null = null;
let cachedAt = 0;
const CACHE_TTL = 30_000;

const getEncryptionKey = (): Buffer => {
  const master = process.env.ADMIN_CONFIG_ENCRYPTION_KEY?.trim();
  if (!master || master.length < 16) {
    throw createError(503, 'Admin integration secret encryption is not configured');
  }
  return crypto.createHash('sha256').update(master).digest();
};

const decrypt = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object') return {};
  const store = value as Partial<EncryptedSecretStore>;
  if (store.version !== 1 || !store.iv || !store.tag || !store.data) return {};
  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(store.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(store.tag, 'base64'));
    return JSON.parse(Buffer.concat([
      decipher.update(Buffer.from(store.data, 'base64')),
      decipher.final(),
    ]).toString('utf8')) as Record<string, string>;
  } catch {
    throw createError(503, 'Admin integration secrets could not be decrypted');
  }
};

const encrypt = (secrets: Record<string, string>): EncryptedSecretStore => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(secrets), 'utf8'),
    cipher.final(),
  ]);
  return {
    version: 1,
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    data: encrypted.toString('base64'),
  };
};

const loadSecrets = async (): Promise<Record<string, string>> => {
  if (cachedSecrets && Date.now() - cachedAt < CACHE_TTL) return cachedSecrets;
  const setting = await AppSetting.findOne({ key: SETTING_KEY }).lean();
  cachedSecrets = decrypt(setting?.value);
  cachedAt = Date.now();
  return cachedSecrets;
};

export const getIntegrationSecret = async (name: SecretName): Promise<string | undefined> => {
  const secrets = await loadSecrets();
  return secrets[name]?.trim() || process.env[name]?.trim() || undefined;
};

export const updateIntegrationSecrets = async (updates: IntegrationSecretUpdates): Promise<void> => {
  const current = { ...(await loadSecrets()) };
  (Object.entries(updates) as Array<[SecretName, string | null | undefined]>).forEach(([name, value]) => {
    if (value === null) delete current[name];
    else if (typeof value === 'string' && value.trim()) current[name] = value.trim();
  });
  await AppSetting.findOneAndUpdate(
    { key: SETTING_KEY },
    { $set: { value: encrypt(current) } },
    { upsert: true, new: true },
  );
  cachedSecrets = current;
  cachedAt = Date.now();
};

const mask = (value: string | undefined): string | null => {
  if (!value) return null;
  if (value.length <= 8) return '••••••••';
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
};

export const getIntegrationSecretStatus = async () => {
  const names: SecretName[] = [
    'OPENAI_API_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON',
    'MSG91_AUTH_KEY',
    'MSG91_TEMPLATE_ID',
    'MSG91_SENDER_ID',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'YOUBOT_API_KEY',
    'GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON',
    'GOOGLE_DRIVE_FOLDER_ID',
  ];
  const secrets = await loadSecrets();
  return Object.fromEntries(names.map(name => {
    const value = secrets[name]?.trim() || process.env[name]?.trim();
    return [name, {
      configured: Boolean(value),
      source: secrets[name] ? 'admin' : value ? 'railway' : 'missing',
      hint: name === 'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON' || name === 'GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON'
        ? (value ? 'configured' : null)
        : mask(value),
    }];
  }));
};
