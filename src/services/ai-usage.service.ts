import { AIUsageEvent } from '../models';

export type AIUsageFeature = 'chat' | 'talk_transcription' | 'talk_response' | 'talk_tts' | 'talk_realtime';

export const recordAiUsageEvent = async (event: {
  userId?: string;
  premium: boolean;
  feature: AIUsageFeature;
  model?: string;
  status: 'success' | 'failure';
  inputTokens?: number;
  outputTokens?: number;
  inputAudioSeconds?: number;
  outputAudioSeconds?: number;
  durationMs?: number;
  estimatedCostUsd?: number;
  metadata?: Record<string, unknown>;
}) => AIUsageEvent.create({
  userId: event.userId,
  plan: event.premium ? 'premium' : 'free',
  provider: 'openai',
  feature: event.feature,
  model: event.model,
  status: event.status,
  inputTokens: event.inputTokens || 0,
  outputTokens: event.outputTokens || 0,
  inputAudioSeconds: event.inputAudioSeconds || 0,
  outputAudioSeconds: event.outputAudioSeconds || 0,
  durationMs: event.durationMs || 0,
  estimatedCostUsd: event.estimatedCostUsd || 0,
  metadata: event.metadata || {},
}).catch(error => console.error('AI usage ledger write failed:', error));
