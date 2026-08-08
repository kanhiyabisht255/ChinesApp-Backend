import { AIUsageEvent, AppSetting } from '../models';
import { getCustomIntegrationSecret, updateCustomIntegrationSecret } from './integration-secrets.service';

export type AIProviderType = 'openai' | 'gemini' | 'anthropic' | 'openrouter' | 'groq' | 'custom';
export interface AIProviderConfig {
  id: string;
  name: string;
  type: AIProviderType;
  managedPreset?: boolean;
  baseUrl?: string;
  secretName?: string;
  chatModel?: string;
  transcriptionModel?: string;
  ttsModel?: string;
  realtimeModel?: string;
  capabilities: string[];
  priority: number;
  enabled: boolean;
  dailyBudgetUsd: number;
  monthlyBudgetUsd: number;
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  inputAudioCostPerMinute: number;
  outputAudioCostPerMinute: number;
}

const KEY = 'ai-providers';
const DEFAULT_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'openai-default',
    name: 'OpenAI',
    type: 'openai',
    managedPreset: true,
    secretName: 'OPENAI_API_KEY',
    chatModel: 'gpt-4o-mini',
    transcriptionModel: 'gpt-4o-mini-transcribe',
    ttsModel: 'gpt-4o-mini-tts',
    realtimeModel: 'gpt-realtime-2.1-mini',
    capabilities: ['chat', 'talk_response', 'talk_transcription', 'talk_tts', 'talk_realtime'],
    priority: 10,
    enabled: true,
    dailyBudgetUsd: 0,
    monthlyBudgetUsd: 0,
    inputCostPerMillionTokens: 0.15,
    outputCostPerMillionTokens: 0.60,
    inputAudioCostPerMinute: 0.006,
    outputAudioCostPerMinute: 0.024,
  },
  {
    id: 'bluesminds-gpt-4o-mini',
    name: 'Bluesminds GPT-4o mini',
    type: 'custom',
    managedPreset: true,
    baseUrl: 'https://api.bluesminds.com/v1',
    secretName: 'BLUESMINDS_API_KEY',
    chatModel: 'gpt-4o-mini',
    capabilities: ['chat', 'talk_response'],
    priority: 5,
    enabled: false,
    dailyBudgetUsd: 0,
    monthlyBudgetUsd: 0,
    inputCostPerMillionTokens: 0.3,
    outputCostPerMillionTokens: 0.18,
    inputAudioCostPerMinute: 0,
    outputAudioCostPerMinute: 0,
  },
  {
    id: 'gemini-default',
    name: 'Google Gemini',
    type: 'gemini',
    managedPreset: true,
    secretName: 'GEMINI_API_KEY',
    chatModel: 'gemini-2.5-flash',
    capabilities: ['chat'],
    priority: 20,
    enabled: false,
    dailyBudgetUsd: 0,
    monthlyBudgetUsd: 0,
    inputCostPerMillionTokens: 0,
    outputCostPerMillionTokens: 0,
    inputAudioCostPerMinute: 0,
    outputAudioCostPerMinute: 0,
  },
  {
    id: 'anthropic-default',
    name: 'Anthropic',
    type: 'anthropic',
    managedPreset: true,
    secretName: 'ANTHROPIC_API_KEY',
    chatModel: 'claude-3-5-haiku-latest',
    capabilities: ['chat'],
    priority: 30,
    enabled: false,
    dailyBudgetUsd: 0,
    monthlyBudgetUsd: 0,
    inputCostPerMillionTokens: 0,
    outputCostPerMillionTokens: 0,
    inputAudioCostPerMinute: 0,
    outputAudioCostPerMinute: 0,
  },
];
const DEFAULT_PROVIDER_IDS = new Set(DEFAULT_PROVIDERS.map(provider => provider.id));

const cloneProvider = (provider: AIProviderConfig): AIProviderConfig => ({
  ...provider,
  capabilities: [...provider.capabilities],
});

const validBaseUrl = (value?: string) => {
  if (!value) return undefined;
  const parsed = new URL(value);
  if (parsed.protocol !== 'https:') throw new Error('Provider Base URL must use HTTPS');
  const host = parsed.hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.startsWith('10.') || host.startsWith('192.168.') || host.startsWith('172.16.')) throw new Error('Private provider hosts are blocked');
  return value.replace(/\/$/, '').slice(0, 300);
};

export const listAIProviders = async (): Promise<AIProviderConfig[]> => {
  const setting = await AppSetting.findOne({ key: KEY }).lean();
  const stored = Array.isArray(setting?.value) ? setting.value as AIProviderConfig[] : [];
  const missingDefaults = DEFAULT_PROVIDERS.filter(preset => !stored.some(provider => provider.id === preset.id));
  let changed = missingDefaults.length > 0;
  const providers = [
    ...stored.map(provider => {
      if (provider.id !== 'openai-default') return provider;
      const hasNoRates = [provider.inputCostPerMillionTokens, provider.outputCostPerMillionTokens, provider.inputAudioCostPerMinute, provider.outputAudioCostPerMinute]
        .every(value => Number(value || 0) === 0);
      const needsRealtimeUpgrade = provider.realtimeModel === 'gpt-realtime-2.1' || !provider.realtimeModel;
      if (!hasNoRates && !needsRealtimeUpgrade) return provider;
      changed = true;
      const preset = DEFAULT_PROVIDERS[0];
      return {
        ...provider,
        realtimeModel: needsRealtimeUpgrade ? preset.realtimeModel : provider.realtimeModel,
        inputCostPerMillionTokens: hasNoRates ? preset.inputCostPerMillionTokens : provider.inputCostPerMillionTokens,
        outputCostPerMillionTokens: hasNoRates ? preset.outputCostPerMillionTokens : provider.outputCostPerMillionTokens,
        inputAudioCostPerMinute: hasNoRates ? preset.inputAudioCostPerMinute : provider.inputAudioCostPerMinute,
        outputAudioCostPerMinute: hasNoRates ? preset.outputAudioCostPerMinute : provider.outputAudioCostPerMinute,
      };
    }),
    ...missingDefaults.map(cloneProvider),
  ];
  if (!changed) return stored;
  await AppSetting.findOneAndUpdate(
    { key: KEY },
    { $set: { value: providers } },
    { upsert: true, new: true },
  );
  return providers;
};

export const saveAIProvider = async (input: Partial<AIProviderConfig> & { apiKey?: string }): Promise<AIProviderConfig> => {
  const providers = await listAIProviders();
  const id = String(input.id || `provider_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  const existing = providers.find(provider => provider.id === id);
  const provider: AIProviderConfig = {
    id,
    name: String(input.name || existing?.name || id).trim().slice(0, 100),
    type: (input.type || existing?.type || 'custom') as AIProviderType,
    managedPreset: Boolean(existing?.managedPreset || DEFAULT_PROVIDER_IDS.has(id)),
    baseUrl: validBaseUrl(input.baseUrl || existing?.baseUrl),
    secretName: existing?.secretName || `AI_PROVIDER_${id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_KEY`,
    chatModel: String(input.chatModel || existing?.chatModel || '').trim().slice(0, 100),
    transcriptionModel: String(input.transcriptionModel || existing?.transcriptionModel || '').trim().slice(0, 100),
    ttsModel: String(input.ttsModel || existing?.ttsModel || '').trim().slice(0, 100),
    realtimeModel: String(input.realtimeModel || existing?.realtimeModel || '').trim().slice(0, 100),
    capabilities: Array.isArray(input.capabilities) ? input.capabilities.map(String).slice(0, 20) : existing?.capabilities || ['chat'],
    priority: Math.max(0, Math.min(1000, Number(input.priority ?? existing?.priority ?? 100))),
    enabled: Boolean(input.enabled ?? existing?.enabled ?? true),
    dailyBudgetUsd: Math.max(0, Number(input.dailyBudgetUsd ?? existing?.dailyBudgetUsd ?? 0)),
    monthlyBudgetUsd: Math.max(0, Number(input.monthlyBudgetUsd ?? existing?.monthlyBudgetUsd ?? 0)),
    inputCostPerMillionTokens: Math.max(0, Number(input.inputCostPerMillionTokens ?? existing?.inputCostPerMillionTokens ?? 0)),
    outputCostPerMillionTokens: Math.max(0, Number(input.outputCostPerMillionTokens ?? existing?.outputCostPerMillionTokens ?? 0)),
    inputAudioCostPerMinute: Math.max(0, Number(input.inputAudioCostPerMinute ?? existing?.inputAudioCostPerMinute ?? 0)),
    outputAudioCostPerMinute: Math.max(0, Number(input.outputAudioCostPerMinute ?? existing?.outputAudioCostPerMinute ?? 0)),
  };
  if (input.apiKey?.trim()) await updateCustomIntegrationSecret(provider.secretName!, input.apiKey.trim());
  const next = existing ? providers.map(item => item.id === id ? provider : item) : [...providers, provider];
  await AppSetting.findOneAndUpdate({ key: KEY }, { $set: { value: next } }, { upsert: true, new: true });
  return provider;
};

export const deleteAIProvider = async (id: string) => {
  const providers = await listAIProviders();
  const provider = providers.find(item => item.id === id);
  if (provider?.managedPreset || DEFAULT_PROVIDER_IDS.has(id)) {
    const disabled = providers.map(item => item.id === id ? { ...item, enabled: false } : item);
    await AppSetting.findOneAndUpdate({ key: KEY }, { $set: { value: disabled } }, { upsert: true, new: true });
    return;
  }
  if (provider?.secretName) await updateCustomIntegrationSecret(provider.secretName, null);
  await AppSetting.findOneAndUpdate({ key: KEY }, { $set: { value: providers.filter(item => item.id !== id) } }, { upsert: true, new: true });
};

export const providerSecretConfigured = async (provider: AIProviderConfig) => Boolean(provider.secretName && await getCustomIntegrationSecret(provider.secretName));

export const selectAIProviders = async (capability: string): Promise<Array<AIProviderConfig & { apiKey?: string }>> => {
  const providers = (await listAIProviders()).filter(provider => provider.enabled && provider.capabilities.includes(capability)).sort((a, b) => a.priority - b.priority);
  const now = new Date();
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const available: Array<AIProviderConfig & { apiKey?: string }> = [];
  for (const provider of providers) {
    const [day, month] = await Promise.all([
      AIUsageEvent.aggregate([{ $match: { provider: provider.id, createdAt: { $gte: dayStart } } }, { $group: { _id: null, cost: { $sum: '$estimatedCostUsd' } } }]),
      AIUsageEvent.aggregate([{ $match: { provider: provider.id, createdAt: { $gte: monthStart } } }, { $group: { _id: null, cost: { $sum: '$estimatedCostUsd' } } }]),
    ]);
    if (provider.dailyBudgetUsd > 0 && Number(day[0]?.cost || 0) >= provider.dailyBudgetUsd) continue;
    if (provider.monthlyBudgetUsd > 0 && Number(month[0]?.cost || 0) >= provider.monthlyBudgetUsd) continue;
    available.push({ ...provider, apiKey: provider.secretName ? await getCustomIntegrationSecret(provider.secretName) : undefined });
  }
  return available;
};

export const selectAIProvider = async (capability: string): Promise<(AIProviderConfig & { apiKey?: string }) | null> => (await selectAIProviders(capability))[0] || null;

export const estimateProviderCost = (provider: Partial<AIProviderConfig> | null, usage: { inputTokens?: number; outputTokens?: number; inputAudioSeconds?: number; outputAudioSeconds?: number }): number => {
  if (!provider) return 0;
  return Number((
    (usage.inputTokens || 0) / 1_000_000 * (provider.inputCostPerMillionTokens || 0) +
    (usage.outputTokens || 0) / 1_000_000 * (provider.outputCostPerMillionTokens || 0) +
    (usage.inputAudioSeconds || 0) / 60 * (provider.inputAudioCostPerMinute || 0) +
    (usage.outputAudioSeconds || 0) / 60 * (provider.outputAudioCostPerMinute || 0)
  ).toFixed(8));
};
