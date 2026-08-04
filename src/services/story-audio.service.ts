import crypto from 'crypto';
import { GoogleAuth } from 'google-auth-library';
import { createError } from '../middleware/error';
import { getIntegrationSecret } from './integration-secrets.service';

export const STORY_TTS_MODEL = 'gemini-3-1-flash-tts';
const YOUBOT_BASE_URL = 'https://you.bot/api/v1';
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

type JsonRecord = Record<string, unknown>;

const asRecord = (value: unknown): JsonRecord | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;

const nestedString = (value: unknown, paths: string[][]): string | undefined => {
  for (const path of paths) {
    let current: unknown = value;
    for (const part of path) current = asRecord(current)?.[part];
    if (typeof current === 'string' && current.trim()) return current.trim();
    if (typeof current === 'number') return String(current);
  }
  return undefined;
};

export const extractTaskId = (payload: unknown): string | undefined => nestedString(payload, [
  ['task_id'],
  ['taskId'],
  ['id'],
  ['data', 'task_id'],
  ['data', 'taskId'],
  ['data', 'id'],
  ['task', 'id'],
]);

const collectHttpsUrls = (value: unknown, depth = 0): string[] => {
  if (depth > 6) return [];
  if (typeof value === 'string') {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '::1'].includes(url.hostname) || url.hostname.endsWith('.local')) {
        return [];
      }
      return [url.toString()];
    } catch {
      return [];
    }
  }
  if (Array.isArray(value)) return value.flatMap(item => collectHttpsUrls(item, depth + 1));
  const record = asRecord(value);
  return record ? Object.values(record).flatMap(item => collectHttpsUrls(item, depth + 1)) : [];
};

export const extractAudioUrl = (payload: unknown): string | undefined => {
  const urls = [...new Set(collectHttpsUrls(payload))];
  return urls.find(url => /\.(mp3|wav|m4a|aac|ogg|flac)(\?|$)/i.test(url))
    || urls.find(url => /(audio|output|result|download)/i.test(url));
};

const parseJsonResponse = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw createError(502, 'The TTS provider returned an invalid response');
  }
};

const providerError = (status: number): Error => {
  if (status === 401 || status === 403) return createError(503, 'YouBot API key is invalid or does not have access to this model');
  if (status === 402 || status === 429) return createError(429, 'YouBot credits are exhausted. Replace the API key in Admin → API Keys and try again');
  return createError(502, 'The TTS provider is temporarily unavailable');
};

const youBotRequest = async (path: string, apiKey: string, init?: RequestInit): Promise<unknown> => {
  let response: Response;
  try {
    response = await fetch(`${YOUBOT_BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw createError(502, 'Could not reach the TTS provider');
  }
  if (!response.ok) throw providerError(response.status);
  return parseJsonResponse(response);
};

const sleep = (milliseconds: number): Promise<void> => new Promise(resolve => setTimeout(resolve, milliseconds));

const taskState = (payload: unknown): string => (nestedString(payload, [
  ['status'],
  ['state'],
  ['data', 'status'],
  ['data', 'state'],
  ['task', 'status'],
]) || '').toLowerCase();

const generateYouBotAudio = async (storyText: string): Promise<{ sourceUrl: string; taskId?: string }> => {
  const apiKey = await getIntegrationSecret('YOUBOT_API_KEY');
  if (!apiKey) throw createError(503, 'Add the YouBot API key in Admin → API Keys first');

  const created = await youBotRequest('/generate', apiKey, {
    method: 'POST',
    body: JSON.stringify({
      modelId: STORY_TTS_MODEL,
      input: {
        speakers: [{
          speaker_id: 'Narrator',
          voice_name: 'Zephyr',
          audio_profile: 'Mandarin Chinese learning narrator',
          style: 'Warm, clear and expressive teacher',
          pace: 'Natural',
          accent: 'Neutral',
        }],
        dialogue_turns: [{ speaker_id: 'Narrator', text: storyText }],
        temperature: 0.8,
        scene: 'A friendly Mandarin teacher narrates a Chinese learning story clearly.',
        sample_context: 'Use accurate Standard Mandarin pronunciation, natural pauses and clear tones.',
      },
    }),
  });
  const immediateUrl = extractAudioUrl(created);
  if (immediateUrl) return { sourceUrl: immediateUrl, taskId: extractTaskId(created) };

  const taskId = extractTaskId(created);
  if (!taskId) throw createError(502, 'The TTS provider did not return a task ID');
  for (let attempt = 0; attempt < 90; attempt += 1) {
    if (attempt > 0) await sleep(2_000);
    const task = await youBotRequest(`/task/${encodeURIComponent(taskId)}?model=${encodeURIComponent(STORY_TTS_MODEL)}`, apiKey);
    const audioUrl = extractAudioUrl(task);
    if (audioUrl) return { sourceUrl: audioUrl, taskId };
    const state = taskState(task);
    if (['failed', 'failure', 'cancelled', 'canceled', 'error'].includes(state)) {
      throw createError(502, 'The TTS provider could not generate this story audio');
    }
  }
  throw createError(504, 'Story audio generation timed out. Please try again');
};

const downloadAudio = async (sourceUrl: string): Promise<{ bytes: Buffer; mimeType: string; extension: string }> => {
  let response: Response;
  try {
    response = await fetch(sourceUrl, { signal: AbortSignal.timeout(45_000) });
  } catch {
    throw createError(502, 'Generated audio could not be downloaded');
  }
  if (!response.ok) throw createError(502, 'Generated audio could not be downloaded');
  const announcedSize = Number(response.headers.get('content-length') || 0);
  if (announcedSize > MAX_AUDIO_BYTES) throw createError(413, 'Generated audio is too large to store');
  const mimeType = (response.headers.get('content-type') || 'audio/mpeg').split(';')[0].trim().toLowerCase();
  if (mimeType.startsWith('text/') || mimeType.includes('html') || mimeType.includes('json')) {
    throw createError(502, 'The TTS provider returned a page instead of an audio file');
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length || bytes.length > MAX_AUDIO_BYTES) throw createError(413, 'Generated audio is empty or too large');
  const extension = mimeType.includes('wav') ? 'wav'
    : mimeType.includes('mp4') || mimeType.includes('m4a') ? 'm4a'
      : mimeType.includes('ogg') ? 'ogg'
        : 'mp3';
  return { bytes, mimeType, extension };
};

const driveCredentials = async (): Promise<Record<string, unknown>> => {
  const raw = await getIntegrationSecret('GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON');
  if (!raw) throw createError(503, 'Add Google Drive service-account JSON in Admin → API Keys first');
  try {
    const credentials = JSON.parse(raw) as Record<string, unknown>;
    if (typeof credentials.client_email !== 'string' || typeof credentials.private_key !== 'string') throw new Error();
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    return credentials;
  } catch {
    throw createError(503, 'Google Drive service-account JSON is invalid');
  }
};

const uploadToGoogleDrive = async (
  audio: { bytes: Buffer; mimeType: string; extension: string },
  title: string,
): Promise<{ fileId: string; audioUrl: string }> => {
  const folderId = await getIntegrationSecret('GOOGLE_DRIVE_FOLDER_ID');
  if (!folderId || !/^[a-zA-Z0-9_-]{10,200}$/.test(folderId)) {
    throw createError(503, 'Add a valid Google Drive folder ID in Admin → API Keys first');
  }
  const auth = new GoogleAuth({
    credentials: await driveCredentials(),
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  const boundary = `chinesapp_${crypto.randomBytes(12).toString('hex')}`;
  const safeTitle = title.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'story';
  const metadata = { name: `${safeTitle}-${Date.now()}.${audio.extension}`, parents: [folderId], mimeType: audio.mimeType };
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${audio.mimeType}\r\n\r\n`),
    audio.bytes,
    Buffer.from(`\r\n--${boundary}--`),
  ]);
  let fileId = '';
  try {
    const uploaded = await auth.request<{ id?: string }>({
      url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      data: body,
    });
    fileId = uploaded.data.id || '';
    if (!fileId) throw new Error('Missing file ID');
    await auth.request({
      url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: { type: 'anyone', role: 'reader' },
    });
  } catch {
    if (fileId) {
      await auth.request({
        url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,
        method: 'DELETE',
      }).catch(() => undefined);
    }
    throw createError(502, 'Audio could not be saved to Google Drive. Check the folder sharing and service account');
  }
  return {
    fileId,
    audioUrl: `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`,
  };
};

export const storyContentHash = (storyText: string): string => crypto
  .createHash('sha256')
  .update(storyText.normalize('NFKC').replace(/\s+/g, ' ').trim())
  .digest('hex');

export const buildStoryParagraphs = (storyText: string): Array<{ chinese: string; pinyin: string; english: string }> => {
  const explicit = storyText.split(/\n+/).map(value => value.trim()).filter(Boolean);
  const pieces = explicit.length > 1
    ? explicit
    : (storyText.match(/[^。！？!?]+[。！？!?]?/g) || [storyText]).map(value => value.trim()).filter(Boolean);
  const paragraphs: string[] = [];
  let current = '';
  pieces.forEach(piece => {
    if (current && current.length + piece.length > 260) {
      paragraphs.push(current);
      current = piece;
    } else {
      current += piece;
    }
  });
  if (current) paragraphs.push(current);
  return paragraphs.map(chinese => ({ chinese, pinyin: '', english: '' }));
};

export const generateAndStoreStoryAudio = async (storyText: string, title: string) => {
  const generated = await generateYouBotAudio(storyText);
  const audio = await downloadAudio(generated.sourceUrl);
  const drive = await uploadToGoogleDrive(audio, title);
  return { ...drive, providerTaskId: generated.taskId };
};
