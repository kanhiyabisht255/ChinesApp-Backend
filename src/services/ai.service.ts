import OpenAI, { toFile } from 'openai';
import { getLanguageName, normalizeLanguageCode } from './localization.service';
import { getAppConfig } from './config.service';
import { getIntegrationSecret } from './integration-secrets.service';
import { estimateProviderCost, selectAIProvider, selectAIProviders, type AIProviderConfig } from './ai-provider.service';
import { recordAiUsageEvent } from './ai-usage.service';

let openaiClient: OpenAI | null = null;
let openaiClientKey = '';

export class AIServiceError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, code = 'AI_UNAVAILABLE', statusCode = 503) {
    super(message);
    this.name = 'AIServiceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

const getOpenAI = async (capability = 'chat', selected?: (AIProviderConfig & { apiKey?: string }) | null): Promise<{ client: OpenAI; model?: string; provider: AIProviderConfig | null }> => {
  const selectedProvider = selected === undefined ? await selectAIProvider(capability) : selected;
  const selectedCompatible = selectedProvider && ['openai', 'openrouter', 'groq', 'custom'].includes(selectedProvider.type) ? selectedProvider : null;
  const routed = selectedCompatible;
  const apiKey = routed?.apiKey || await getIntegrationSecret('OPENAI_API_KEY');
  if (!apiKey || apiKey.startsWith('sk-your-')) {
    throw new AIServiceError('AI tutor is not configured yet');
  }
  const baseURL = routed?.baseUrl;
  const cacheKey = `${apiKey}:${baseURL || 'default'}`;
  if (!openaiClient || openaiClientKey !== cacheKey) {
    openaiClient = new OpenAI({
      apiKey,
      baseURL,
      timeout: 30_000,
      maxRetries: 1,
    });
    openaiClientKey = cacheKey;
  }
  const model = capability === 'talk_transcription' ? routed?.transcriptionModel : capability === 'talk_tts' ? routed?.ttsModel : capability === 'talk_realtime' ? routed?.realtimeModel : routed?.chatModel;
  return { client: openaiClient, model, provider: routed };
};

export interface TutorOptions {
  isVoiceCall?: boolean;
  nativeLanguage?: string;
  hskLevel?: number;
  learningGoal?: string;
  scenarioPrompt?: string;
  userId?: string;
  isPremium?: boolean;
  inputAudioSeconds?: number;
}

const buildChineseSystemPrompt = (options: TutorOptions): string => {
  const languageCode = normalizeLanguageCode(options.nativeLanguage);
  const languageName = getLanguageName(languageCode);
  const level = Math.min(Math.max(options.hskLevel || 1, 1), 6);

  return `You are Ling (灵), a friendly, accurate and encouraging AI Mandarin Chinese tutor. Your role is to:

1. Help users practice speaking Chinese
2. Correct vocabulary and grammar gently without interrupting every turn
3. Provide pinyin for all Chinese text
4. Translate explanations into ${languageName} (${languageCode})
5. Be patient, culturally respectful and useful in real life

Rules:
- Learner level: HSK ${level}; learning goal: ${options.learningGoal || 'general communication'}
- Keep voice responses concise (1-2 short sentences); chat responses may use up to 4 short sentences
- Use simplified Chinese unless the learner explicitly requests traditional characters
- Never invent pronunciation facts. Use tone-marked pinyin with correct spacing
- Give one actionable correction at a time and praise specifically, not generically
- If the learner uses ${languageName}, teach the natural Mandarin equivalent
- Avoid romantic, sexual, medical, legal or financial role-play beyond safe language practice
${options.scenarioPrompt ? `- Scenario instructions: ${options.scenarioPrompt}` : ''}

When the user speaks in another language, respond in level-appropriate Chinese with pinyin and a ${languageName} translation.
When the user speaks in Chinese, respond in Chinese with corrections if needed.

Return valid JSON only with this shape:
{"chinese":"...","pinyin":"...","english":"${languageName} translation","correction":"optional concise correction","feedback":"optional learning tip"}`;
};

export const generateAIResponse = async (
  userMessage: string,
  context: string[] = [],
  options: TutorOptions = {}
): Promise<{ chinese: string; pinyin: string; english: string; correction?: string; feedback?: string }> => {
  try {
    const appConfig = await getAppConfig();
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: buildChineseSystemPrompt(options) },
      ...context.map((msg, i) => ({
        role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg,
      })),
      { role: 'user', content: userMessage },
    ];
    
    const candidates = await selectAIProviders('chat');
    const providers = candidates.length ? [...candidates, null] : [null];
    let responseText = '';
    let usage = { inputTokens: 0, outputTokens: 0 };
    let provider: AIProviderConfig | null = null;
    let model = appConfig.aiConfig.model;
    let lastError: unknown;
    for (const candidate of providers) {
      try {
        if (candidate?.type === 'gemini') {
          const key = candidate.apiKey;
          if (!key) throw new AIServiceError('Gemini provider key is missing');
          model = candidate.chatModel || appConfig.aiConfig.model;
          const base = candidate.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
          const response = await fetch(`${base}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ systemInstruction: { parts: [{ text: messages[0].content }] }, contents: messages.slice(1).map(item => ({ role: item.role === 'assistant' ? 'model' : 'user', parts: [{ text: item.content }] })), generationConfig: { maxOutputTokens: options.isVoiceCall ? Math.min(appConfig.aiConfig.maxTokens, 180) : Math.min(appConfig.aiConfig.maxTokens, 400), temperature: appConfig.aiConfig.temperature, responseMimeType: 'application/json' } }) });
          const payload = await response.json() as any;
          if (!response.ok) throw new Error(payload?.error?.message || 'Gemini request failed');
          responseText = payload?.candidates?.[0]?.content?.parts?.map((part: any) => part.text || '').join('') || '';
          usage = { inputTokens: Number(payload?.usageMetadata?.promptTokenCount || 0), outputTokens: Number(payload?.usageMetadata?.candidatesTokenCount || 0) };
          provider = candidate;
          break;
        }
        if (candidate?.type === 'anthropic') {
          const key = candidate.apiKey;
          if (!key) throw new AIServiceError('Anthropic provider key is missing');
          model = candidate.chatModel || 'claude-3-5-haiku-latest';
          const base = candidate.baseUrl || 'https://api.anthropic.com';
          const response = await fetch(`${base}/v1/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model, system: messages[0].content, messages: messages.slice(1), max_tokens: options.isVoiceCall ? Math.min(appConfig.aiConfig.maxTokens, 180) : Math.min(appConfig.aiConfig.maxTokens, 400), temperature: appConfig.aiConfig.temperature } ) });
          const payload = await response.json() as any;
          if (!response.ok) throw new Error(payload?.error?.message || 'Anthropic request failed');
          responseText = payload?.content?.map((part: any) => part.text || '').join('') || '';
          usage = { inputTokens: Number(payload?.usage?.input_tokens || 0), outputTokens: Number(payload?.usage?.output_tokens || 0) };
          provider = candidate;
          break;
        }
        const routed = await getOpenAI('chat', candidate);
        model = routed.model || appConfig.aiConfig.model;
        const completion = await routed.client.chat.completions.create({ model, messages, max_tokens: options.isVoiceCall ? Math.min(appConfig.aiConfig.maxTokens, 180) : Math.min(appConfig.aiConfig.maxTokens, 400), temperature: Math.max(0, Math.min(appConfig.aiConfig.temperature, 1)), response_format: { type: 'json_object' } });
        responseText = completion.choices[0]?.message?.content || '';
        usage = { inputTokens: Number(completion.usage?.prompt_tokens || 0), outputTokens: Number(completion.usage?.completion_tokens || 0) };
        provider = routed.provider;
        break;
      } catch (error) {
        lastError = error;
        console.error('AI provider failed, trying fallback:', error);
      }
    }
    if (!responseText && lastError) throw lastError;
    if (!responseText) throw new AIServiceError('AI tutor returned an empty response', 'AI_EMPTY_RESPONSE');
    const parsed = parseAIResponse(responseText);
    await recordAiUsageEvent({ userId: options.userId, premium: Boolean(options.isPremium), feature: options.isVoiceCall ? 'talk_response' : 'chat', provider: provider?.id || 'openai', model, status: 'success', inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, estimatedCostUsd: estimateProviderCost(provider, usage), metadata: { adapter: provider?.type || 'openai' } });
    return parsed;
  } catch (error) {
    console.error('OpenAI Error:', error);
    if (error instanceof AIServiceError) throw error;
    throw new AIServiceError('AI tutor is temporarily unavailable. Please try again shortly.');
  }
};

const parseAIResponse = (text: string): { chinese: string; pinyin: string; english: string; correction?: string; feedback?: string } => {
  try {
    const jsonText = text.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(jsonText) as Record<string, unknown>;
    if (
      typeof parsed.chinese === 'string' && parsed.chinese.trim() &&
      typeof parsed.pinyin === 'string' && parsed.pinyin.trim() &&
      typeof parsed.english === 'string' && parsed.english.trim()
    ) {
      return {
        chinese: parsed.chinese.trim(),
        pinyin: parsed.pinyin.trim(),
        english: parsed.english.trim(),
        correction: typeof parsed.correction === 'string' ? parsed.correction : undefined,
        feedback: typeof parsed.feedback === 'string' ? parsed.feedback : undefined,
      };
    }
  } catch (error) {
    console.error('Invalid AI JSON response:', error);
  }
  throw new AIServiceError('AI tutor returned an invalid response', 'AI_INVALID_RESPONSE');
};

export const transcribeAudio = async (
  audioBuffer: Buffer,
  options: TutorOptions = {},
  fileName = 'practice.m4a',
  mimeType = 'audio/mp4'
): Promise<string> => {
  try {
    const appConfig = await getAppConfig();
    const routed = await getOpenAI('talk_transcription');
    const transcription = await routed.client.audio.transcriptions.create({
      file: await toFile(audioBuffer, fileName, { type: mimeType }),
      model: routed.model || appConfig.aiConfig.transcriptionModel,
      response_format: 'json',
      prompt: `Mandarin learning practice. The learner may mix Mandarin Chinese with ${getLanguageName(normalizeLanguageCode(options.nativeLanguage))}. Preserve what was actually spoken.`,
    });

    const text = transcription.text?.trim();
    if (!text) throw new AIServiceError('No speech was detected', 'NO_SPEECH', 422);
    await recordAiUsageEvent({ userId: options.userId, premium: Boolean(options.isPremium), feature: 'talk_transcription', provider: routed.provider?.id || 'openai', model: routed.model || appConfig.aiConfig.transcriptionModel, status: 'success', inputAudioSeconds: options.inputAudioSeconds || 0, estimatedCostUsd: estimateProviderCost(routed.provider, { inputAudioSeconds: options.inputAudioSeconds || 0 }), metadata: { adapter: routed.provider?.type || 'openai' } });
    return text;
  } catch (error) {
    console.error('Transcription Error:', error);
    if (error instanceof AIServiceError) throw error;
    throw new AIServiceError('Your recording could not be transcribed. Please try again.');
  }
};

export const generateSpeech = async (text: string, options: TutorOptions = {}): Promise<Buffer> => {
  try {
    const appConfig = await getAppConfig();
    const routed = await getOpenAI('talk_tts');
    const response = await routed.client.audio.speech.create({
      model: routed.model || appConfig.aiConfig.ttsModel,
      voice: appConfig.aiConfig.ttsVoice,
      input: text,
      instructions: 'Speak natural standard Mandarin Chinese with a warm, patient tutor voice. Pronounce tones clearly at a slightly slower learning pace without sounding robotic.',
      response_format: 'mp3',
      speed: appConfig.aiConfig.ttsSpeed,
    });
    
    const buffer = Buffer.from(await response.arrayBuffer());
    await recordAiUsageEvent({ userId: options.userId, premium: Boolean(options.isPremium), feature: 'talk_tts', provider: routed.provider?.id || 'openai', model: routed.model || appConfig.aiConfig.ttsModel, status: 'success', outputAudioSeconds: Math.max(1, Math.ceil(text.length / 5)), estimatedCostUsd: estimateProviderCost(routed.provider, { outputAudioSeconds: Math.max(1, Math.ceil(text.length / 5)) }), metadata: { adapter: routed.provider?.type || 'openai' } });
    return buffer;
  } catch (error) {
    console.error('TTS Error:', error);
    if (error instanceof AIServiceError) throw error;
    throw new AIServiceError('Tutor audio is temporarily unavailable');
  }
};

export const analyzePronunciation = (
  expectedChinese: string,
  spokenText: string
): { score: number; feedback: string } => {
  const expectedChars = expectedChinese.replace(/[^\u4e00-\u9fff]/g, '');
  const spokenChars = spokenText.replace(/[^\u4e00-\u9fff]/g, '');
  
  if (expectedChars === spokenChars) {
    return { score: 100, feedback: 'The transcript matched the target phrase. Tone accuracy still needs listening review.' };
  }
  
  const commonChars = expectedChars.split('').filter(c => spokenChars.includes(c));
  const similarity = commonChars.length / Math.max(expectedChars.length, 1);
  const score = Math.round(similarity * 100);
  
  let feedback = 'Transcript match: ';
  if (score >= 80) {
    feedback += 'most words were recognized. Replay the reference and compare each tone.';
  } else if (score >= 60) {
    feedback += 'some words were recognized. Speak more slowly and keep syllables distinct.';
  } else {
    feedback += 'the phrase was not recognized reliably. Listen once, then repeat in short parts.';
  }
  
  return { score, feedback };
};

export const getScenarioPrompt = (scenarioTitle: string, difficulty: string): string => {
  return `You are helping the user practice the scenario: "${scenarioTitle}".
Difficulty level: ${difficulty}

Start by greeting them in Chinese relevant to this scenario.
Guide the conversation naturally.
Be patient and encouraging.
Provide corrections when needed.
Keep responses short and natural for a conversation.`;
};
