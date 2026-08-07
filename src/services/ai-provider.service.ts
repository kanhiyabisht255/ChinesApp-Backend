import { AppSetting } from '../models';
import { getCustomIntegrationSecret, updateCustomIntegrationSecret } from './integration-secrets.service';

export type AIProviderType = 'openai' | 'gemini' | 'anthropic' | 'openrouter' | 'groq' | 'custom';
export interface AIProviderConfig {
  id: string;
  name: string;
  type: AIProviderType;
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
}

const KEY = 'ai-providers';
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
  return Array.isArray(setting?.value) ? setting?.value as AIProviderConfig[] : [];
};

export const saveAIProvider = async (input: Partial<AIProviderConfig> & { apiKey?: string }): Promise<AIProviderConfig> => {
  const providers = await listAIProviders();
  const id = String(input.id || `provider_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  const existing = providers.find(provider => provider.id === id);
  const provider: AIProviderConfig = {
    id,
    name: String(input.name || existing?.name || id).trim().slice(0, 100),
    type: (input.type || existing?.type || 'custom') as AIProviderType,
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
  };
  if (input.apiKey?.trim()) await updateCustomIntegrationSecret(provider.secretName!, input.apiKey.trim());
  const next = existing ? providers.map(item => item.id === id ? provider : item) : [...providers, provider];
  await AppSetting.findOneAndUpdate({ key: KEY }, { $set: { value: next } }, { upsert: true, new: true });
  return provider;
};

export const deleteAIProvider = async (id: string) => {
  const providers = await listAIProviders();
  const provider = providers.find(item => item.id === id);
  if (provider?.secretName) await updateCustomIntegrationSecret(provider.secretName, null);
  await AppSetting.findOneAndUpdate({ key: KEY }, { $set: { value: providers.filter(item => item.id !== id) } }, { upsert: true, new: true });
};

export const providerSecretConfigured = async (provider: AIProviderConfig) => Boolean(provider.secretName && await getCustomIntegrationSecret(provider.secretName));

export const selectAIProvider = async (capability: string): Promise<(AIProviderConfig & { apiKey?: string }) | null> => {
  const providers = (await listAIProviders()).filter(provider => provider.enabled && provider.capabilities.includes(capability)).sort((a, b) => a.priority - b.priority);
  const provider = providers[0];
  if (!provider) return null;
  return { ...provider, apiKey: provider.secretName ? await getCustomIntegrationSecret(provider.secretName) : undefined };
};
