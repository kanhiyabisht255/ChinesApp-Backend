import type { AppConfig } from '../types';
import { AppSetting } from '../models';

const MONETIZATION_POLICY_VERSION = 2;

const DEFAULT_CONFIG: AppConfig = {
  monetizationPolicyVersion: MONETIZATION_POLICY_VERSION,
  minAppVersion: '1.0.0',
  forceUpdate: false,
  maintenanceMode: false,
  supportEmail: 'support@chinesapp.com',
  features: {
    voiceCallEnabled: true,
    chatEnabled: true,
    premiumRequiredForScenarios: [],
  },
  aiConfig: {
    model: 'gpt-4o-mini',
    maxTokens: 220,
    temperature: 0.6,
    transcriptionModel: 'gpt-transcribe',
    ttsModel: 'gpt-4o-mini-tts',
    ttsVoice: 'marin',
    ttsSpeed: 0.9,
  },
  pricing: {
    monthly: 499,
    yearly: 2999,
    lifetime: 7999,
  },
  monetization: {
    freeVoiceCallsPerDay: 3,
    freeVoiceTurnsPerDay: 10,
    freeChatMessagesPerDay: 20,
    voiceCallGemCost: 20,
    voiceTurnGemCost: 5,
    chatMessageGemCost: 5,
  },
  ads: {
    enabled: true,
    bannerEnabled: false,
    interstitialEnabled: false,
    rewardedEnabled: true,
    interstitialCooldownSeconds: 600,
    bannerAdUnitId: '',
    interstitialAdUnitId: '',
    rewardedAdUnitId: '',
    maxRewardedAdsPerDay: 3,
    contentUnlockHours: 24,
    voiceCallsPerReward: 1,
    voiceTurnsPerReward: 2,
    rewardedContentTypes: ['lesson', 'reading', 'listening', 'vocabulary'],
  },
};

let cachedConfig: AppConfig = DEFAULT_CONFIG;
let lastFetchTime = 0;
const CACHE_TTL = 60 * 1000;

const mergeConfig = (base: AppConfig, updates: Partial<AppConfig>): AppConfig => ({
  ...base,
  ...updates,
  features: { ...base.features, ...(updates.features || {}) },
  aiConfig: { ...base.aiConfig, ...(updates.aiConfig || {}) },
  pricing: { ...base.pricing, ...(updates.pricing || {}) },
  monetization: { ...base.monetization, ...(updates.monetization || {}) },
  ads: { ...base.ads, ...(updates.ads || {}) },
});

export const getAppConfig = async (): Promise<AppConfig> => {
  if (Date.now() - lastFetchTime < CACHE_TTL) return cachedConfig;

  try {
    const setting = await AppSetting.findOne({ key: 'app-config' }).lean();
    const stored = (setting?.value || {}) as Partial<AppConfig>;
    const storedPolicyVersion = Number(stored.monetizationPolicyVersion || 0);
    cachedConfig = mergeConfig(DEFAULT_CONFIG, stored);

    // Apply the product monetization policy once to existing installations. After
    // migration, Admin changes remain authoritative and are not overwritten.
    if (storedPolicyVersion < MONETIZATION_POLICY_VERSION) {
      cachedConfig = mergeConfig(cachedConfig, {
        monetizationPolicyVersion: MONETIZATION_POLICY_VERSION,
        ads: {
          ...cachedConfig.ads,
          bannerEnabled: false,
          interstitialEnabled: false,
          rewardedEnabled: true,
          interstitialCooldownSeconds: 600,
          maxRewardedAdsPerDay: 3,
          contentUnlockHours: 24,
          rewardedContentTypes: ['lesson', 'reading', 'listening', 'vocabulary'],
        },
      });
      await AppSetting.findOneAndUpdate(
        { key: 'app-config' },
        { $set: { value: cachedConfig } },
        { upsert: true, new: true },
      );
    }
  } catch (error) {
    console.error('App config database error:', error);
  }
  lastFetchTime = Date.now();
  return cachedConfig;
};

export const updateLocalConfig = async (updates: Partial<AppConfig>): Promise<AppConfig> => {
  const current = await getAppConfig();
  const merged = mergeConfig(current, updates);
  cachedConfig = {
    ...merged,
    monetizationPolicyVersion: MONETIZATION_POLICY_VERSION,
    minAppVersion: /^\d+\.\d+\.\d+$/.test(merged.minAppVersion) ? merged.minAppVersion : current.minAppVersion,
    supportEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(merged.supportEmail || ''))
      ? String(merged.supportEmail).trim().slice(0, 200)
      : current.supportEmail,
    aiConfig: {
      model: String(merged.aiConfig.model || current.aiConfig.model).trim().slice(0, 100),
      maxTokens: Math.max(64, Math.min(Number(merged.aiConfig.maxTokens) || current.aiConfig.maxTokens, 2000)),
      temperature: Math.max(0, Math.min(Number(merged.aiConfig.temperature) || 0, 1)),
      transcriptionModel: String(merged.aiConfig.transcriptionModel || current.aiConfig.transcriptionModel).trim().slice(0, 100),
      ttsModel: String(merged.aiConfig.ttsModel || current.aiConfig.ttsModel).trim().slice(0, 100),
      ttsVoice: String(merged.aiConfig.ttsVoice || current.aiConfig.ttsVoice).trim().slice(0, 50),
      ttsSpeed: Math.max(0.5, Math.min(Number(merged.aiConfig.ttsSpeed) || current.aiConfig.ttsSpeed, 1.2)),
    },
    pricing: {
      monthly: Math.max(1, Math.min(Number(merged.pricing.monthly) || current.pricing.monthly, 1_000_000)),
      yearly: Math.max(1, Math.min(Number(merged.pricing.yearly) || current.pricing.yearly, 1_000_000)),
      lifetime: Math.max(1, Math.min(Number(merged.pricing.lifetime) || current.pricing.lifetime, 1_000_000)),
    },
    monetization: {
      freeVoiceCallsPerDay: Math.max(0, Math.min(Math.round(Number(merged.monetization.freeVoiceCallsPerDay) || 0), 1000)),
      freeVoiceTurnsPerDay: Math.max(0, Math.min(Math.round(Number(merged.monetization.freeVoiceTurnsPerDay) || 0), 1000)),
      freeChatMessagesPerDay: Math.max(0, Math.min(Math.round(Number(merged.monetization.freeChatMessagesPerDay) || 0), 10000)),
      voiceCallGemCost: Math.max(1, Math.min(Math.round(Number(merged.monetization.voiceCallGemCost) || current.monetization.voiceCallGemCost), 100000)),
      voiceTurnGemCost: Math.max(1, Math.min(Math.round(Number(merged.monetization.voiceTurnGemCost) || current.monetization.voiceTurnGemCost), 100000)),
      chatMessageGemCost: Math.max(1, Math.min(Math.round(Number(merged.monetization.chatMessageGemCost) || current.monetization.chatMessageGemCost), 100000)),
    },
    ads: {
      enabled: Boolean(merged.ads.enabled),
      bannerEnabled: Boolean(merged.ads.bannerEnabled),
      interstitialEnabled: Boolean(merged.ads.interstitialEnabled),
      rewardedEnabled: Boolean(merged.ads.rewardedEnabled),
      interstitialCooldownSeconds: Math.max(
        30,
        Math.min(Math.round(Number(merged.ads.interstitialCooldownSeconds) || current.ads.interstitialCooldownSeconds), 3600),
      ),
      bannerAdUnitId: String(merged.ads.bannerAdUnitId || '').trim().slice(0, 200),
      interstitialAdUnitId: String(merged.ads.interstitialAdUnitId || '').trim().slice(0, 200),
      rewardedAdUnitId: String(merged.ads.rewardedAdUnitId || '').trim().slice(0, 200),
      maxRewardedAdsPerDay: Math.max(0, Math.min(Math.round(Number(merged.ads.maxRewardedAdsPerDay) || 0), 20)),
      contentUnlockHours: Math.max(1, Math.min(Math.round(Number(merged.ads.contentUnlockHours) || current.ads.contentUnlockHours), 168)),
      voiceCallsPerReward: Math.max(1, Math.min(Math.round(Number(merged.ads.voiceCallsPerReward) || current.ads.voiceCallsPerReward), 5)),
      voiceTurnsPerReward: Math.max(1, Math.min(Math.round(Number(merged.ads.voiceTurnsPerReward) || current.ads.voiceTurnsPerReward), 20)),
      rewardedContentTypes: [...new Set(
        (Array.isArray(merged.ads.rewardedContentTypes) ? merged.ads.rewardedContentTypes : current.ads.rewardedContentTypes)
          .filter(type => ['lesson', 'reading', 'listening', 'vocabulary'].includes(type)),
      )] as AppConfig['ads']['rewardedContentTypes'],
    },
  };
  await AppSetting.findOneAndUpdate(
    { key: 'app-config' },
    { $set: { value: cachedConfig } },
    { upsert: true, new: true }
  );
  lastFetchTime = Date.now();
  return cachedConfig;
};

export const getFeatureFlag = async (feature: keyof AppConfig['features']): Promise<boolean> => {
  const config = await getAppConfig();
  const value = config.features[feature];
  return Array.isArray(value) ? value.length > 0 : value ?? true;
};

export const isMaintenanceMode = async (): Promise<boolean> => (await getAppConfig()).maintenanceMode;

export const checkAppVersion = async (version: string): Promise<{ update: boolean; force: boolean }> => {
  const config = await getAppConfig();
  const minVersion = config.minAppVersion.split('.').map(Number);
  const currentVersion = version.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const min = minVersion[i] || 0;
    const current = currentVersion[i] || 0;
    if (current < min) return { update: true, force: config.forceUpdate };
    if (current > min) return { update: false, force: false };
  }
  return { update: false, force: false };
};
