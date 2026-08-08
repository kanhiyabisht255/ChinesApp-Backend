import OpenAI, { toFile } from 'openai';
import { listAIProviders, type AIProviderConfig, type AIProviderType } from './ai-provider.service';
import { getCustomIntegrationSecret } from './integration-secrets.service';

export type AIProviderTestCapability = 'chat' | 'talk_response' | 'talk_transcription' | 'talk_tts' | 'talk_realtime';

export interface AIProviderTestResult {
  providerId: string;
  capability: AIProviderTestCapability;
  model: string;
  latencyMs: number;
  message: string;
}

const OPENAI_COMPATIBLE_TYPES: AIProviderType[] = ['openai', 'openrouter', 'groq', 'custom'];

const modelFor = (provider: AIProviderConfig, capability: AIProviderTestCapability): string => {
  if (capability === 'talk_transcription') return provider.transcriptionModel || 'gpt-4o-mini-transcribe';
  if (capability === 'talk_tts') return provider.ttsModel || 'gpt-4o-mini-tts';
  if (capability === 'talk_realtime') return provider.realtimeModel || 'gpt-realtime-2.1-mini';
  return provider.chatModel || 'gpt-4o-mini';
};

const getProvider = async (id: string): Promise<AIProviderConfig & { apiKey?: string }> => {
  const provider = (await listAIProviders()).find(item => item.id === id);
  if (!provider) throw new Error('AI provider not found');
  if (!provider.secretName) throw new Error('Provider secret is not configured');
  const apiKey = await getCustomIntegrationSecret(provider.secretName);
  if (!apiKey) throw new Error('Provider API key is not configured');
  return { ...provider, apiKey };
};

const openAiClient = (provider: AIProviderConfig & { apiKey?: string }): OpenAI => {
  if (!provider.apiKey) throw new Error('Provider API key is not configured');
  return new OpenAI({
    apiKey: provider.apiKey,
    baseURL: provider.baseUrl,
    timeout: 20_000,
    maxRetries: 0,
  });
};

const baseUrlWithoutVersion = (provider: AIProviderConfig): string =>
  (provider.baseUrl || 'https://api.openai.com').replace(/\/v1\/?$/, '');

export const testAIProvider = async (
  providerId: string,
  capability: AIProviderTestCapability,
): Promise<AIProviderTestResult> => {
  const provider = await getProvider(providerId);
  if (!provider.capabilities.includes(capability)) {
    throw new Error(`Provider is not enabled for ${capability}`);
  }

  const model = modelFor(provider, capability);
  const started = Date.now();

  if (capability === 'talk_realtime') {
    if (!OPENAI_COMPATIBLE_TYPES.includes(provider.type)) {
      throw new Error('This provider does not expose the OpenAI Realtime client-secret API');
    }
    const response = await fetch(`${baseUrlWithoutVersion(provider)}/v1/realtime/client_secrets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model,
          audio: {
            input: { transcription: { model: provider.transcriptionModel || 'gpt-4o-mini-transcribe', language: 'zh' } },
            output: { voice: 'marin' },
          },
          instructions: 'You are Ling, a Mandarin Chinese tutor. Reply briefly for a connectivity test.',
        },
      }),
    });
    const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok || !((payload.value || payload.client_secret) as string | undefined)) {
      throw new Error(String((payload.error as { message?: string } | undefined)?.message || 'Realtime provider rejected the test session'));
    }
    return { providerId, capability, model, latencyMs: Date.now() - started, message: 'Realtime client-secret created successfully' };
  }

  if (provider.type === 'gemini') {
    if (!['chat', 'talk_response'].includes(capability)) throw new Error('Gemini adapter currently supports chat only');
    const response = await fetch(`${provider.baseUrl || 'https://generativelanguage.googleapis.com/v1beta'}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(provider.apiKey!)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Reply with exactly: 你好' }] }], generationConfig: { maxOutputTokens: 8 } }),
    });
    const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok) throw new Error(String((payload.error as { message?: string } | undefined)?.message || 'Gemini test request failed'));
    return { providerId, capability, model, latencyMs: Date.now() - started, message: 'Chat request completed successfully' };
  }

  if (provider.type === 'anthropic') {
    if (!['chat', 'talk_response'].includes(capability)) throw new Error('Anthropic adapter currently supports chat only');
    const response = await fetch(`${provider.baseUrl || 'https://api.anthropic.com'}/v1/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': provider.apiKey!, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 8, messages: [{ role: 'user', content: 'Reply with exactly: 你好' }] }),
    });
    const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok) throw new Error(String((payload.error as { message?: string } | undefined)?.message || 'Anthropic test request failed'));
    return { providerId, capability, model, latencyMs: Date.now() - started, message: 'Chat request completed successfully' };
  }

  const client = openAiClient(provider);
  if (capability === 'talk_tts') {
    const speech = await client.audio.speech.create({ model, voice: 'marin', input: '你好，这是连接测试。', response_format: 'mp3' });
    const bytes = new Uint8Array(await speech.arrayBuffer());
    if (!bytes.length) throw new Error('TTS provider returned an empty audio response');
    return { providerId, capability, model, latencyMs: Date.now() - started, message: `TTS response received (${bytes.length} bytes)` };
  }

  if (capability === 'talk_transcription') {
    const speech = await client.audio.speech.create({ model: provider.ttsModel || 'gpt-4o-mini-tts', voice: 'marin', input: '你好，这是语音识别测试。', response_format: 'mp3' });
    const audio = Buffer.from(await speech.arrayBuffer());
    const transcript = await client.audio.transcriptions.create({
      model,
      file: await toFile(audio, 'provider-test.mp3', { type: 'audio/mpeg' }),
      response_format: 'json',
      language: 'zh',
    });
    if (!transcript.text?.trim()) throw new Error('Transcription provider returned an empty transcript');
    return { providerId, capability, model, latencyMs: Date.now() - started, message: `TTS → STT round-trip succeeded: ${transcript.text.trim().slice(0, 80)}` };
  }

  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: 'Reply with exactly: 你好' }],
    max_tokens: 8,
  });
  if (!completion.choices[0]?.message?.content) throw new Error('Chat provider returned an empty response');
  return { providerId, capability, model, latencyMs: Date.now() - started, message: 'Chat request completed successfully' };
};
