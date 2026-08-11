import crypto from 'crypto';
import { createError } from '../middleware/error';
import { getIntegrationSecret } from './integration-secrets.service';

interface CloudinaryCredentials {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

interface CloudinaryUploadResponse {
  public_id?: string;
  secure_url?: string;
  duration?: number;
  bytes?: number;
  format?: string;
  eager?: Array<{ secure_url?: string; format?: string; bytes?: number }>;
  error?: { message?: string };
}

const credentials = async (): Promise<CloudinaryCredentials> => {
  const [cloudName, apiKey, apiSecret] = await Promise.all([
    getIntegrationSecret('CLOUDINARY_CLOUD_NAME'),
    getIntegrationSecret('CLOUDINARY_API_KEY'),
    getIntegrationSecret('CLOUDINARY_API_SECRET'),
  ]);
  if (!cloudName || !apiKey || !apiSecret) {
    throw createError(503, 'Cloudinary is not configured. Add Cloud Name, API Key and API Secret in Admin API Keys.');
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(cloudName)) throw createError(503, 'Cloudinary Cloud Name is invalid');
  return { cloudName, apiKey, apiSecret };
};

const signature = (params: Record<string, string | number | boolean>, apiSecret: string): string => {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== '' && value !== undefined)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return crypto.createHash('sha1').update(`${payload}${apiSecret}`).digest('hex');
};

const safePublicId = (name: string): string => {
  const base = name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  return `${base || 'story'}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
};

export const uploadStoryAudio = async (file: Express.Multer.File, title: string) => {
  const { cloudName, apiKey, apiSecret } = await credentials();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    eager: 'f_m4a,ac_aac,br_96k',
    eager_async: 'false',
    folder: 'chinesapp/stories',
    public_id: safePublicId(title || file.originalname),
    timestamp,
  };
  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }), file.originalname);
  Object.entries(params).forEach(([key, value]) => form.append(key, String(value)));
  form.append('api_key', apiKey);
  form.append('signature', signature(params, apiSecret));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(180_000),
  });
  const result = await response.json() as CloudinaryUploadResponse;
  if (!response.ok || !result.public_id || !result.secure_url) {
    throw createError(502, result.error?.message || 'Cloudinary audio upload failed');
  }
  const delivery = result.eager?.find(item => item.secure_url)?.secure_url || result.secure_url;
  const deliveryFormat = result.eager?.find(item => item.format)?.format || result.format || 'm4a';
  return {
    sourceAudioUrl: result.secure_url,
    audioUrl: delivery,
    audioStorageProvider: 'cloudinary' as const,
    audioPublicId: result.public_id,
    audioFormat: deliveryFormat,
    audioBytes: Number(result.eager?.find(item => item.bytes)?.bytes || result.bytes || file.size),
    durationMs: Math.max(1, Math.round(Number(result.duration || 0) * 1000)),
  };
};

export const deleteStoryAudio = async (publicId: string | undefined): Promise<void> => {
  if (!publicId) return;
  const { cloudName, apiKey, apiSecret } = await credentials();
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { invalidate: true, public_id: publicId, timestamp };
  const form = new FormData();
  Object.entries(params).forEach(([key, value]) => form.append(key, String(value)));
  form.append('api_key', apiKey);
  form.append('signature', signature(params, apiSecret));
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/destroy`, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw createError(502, 'Cloudinary audio cleanup failed');
};
