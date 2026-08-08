import type { AppConfig } from '../types';
import { AppSetting } from '../models';

const MONETIZATION_POLICY_VERSION = 5;

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
    freeChatMessagesPerDay: 10,
    premiumChatMessagesPerDay: 100,
    premiumChatMessagesPerMonth: 1000,
    freeTalkDemoMinutesPerDay: 3,
    freeTalkMaxMinutesPerSession: 3,
    freeTalkMaxTurnsPerSession: 5,
    premiumTalkMinutesPerSession: 15,
    premiumTalkMinutesPerDay: 20,
    premiumTalkMinutesPerMonth: 300,
    realtimeTalkEnabled: true,
    globalDailyBudgetUsd: 100,
    globalMonthlyBudgetUsd: 2000,
    freeUserDailyCostCapUsd: 0.05,
    premiumUserDailyCostCapUsd: 0.2,
    premiumUserMonthlyCostCapUsd: 1.5,
  },
  pricing: {
    monthly: 499,
    yearly: 2999,
    lifetime: 7999,
  },
  monetization: {
    freeVoiceCallsPerDay: 1,
    freeVoiceTurnsPerDay: 5,
    freeChatMessagesPerDay: 10,
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
    maxRewardedAdsPerDay: 8,
    maxContentRewardedAdsPerDay: 5,
    maxChatRewardedAdsPerDay: 1,
    maxTalkRewardedAdsPerDay: 2,
    contentUnlockHours: 24,
    chatMessagesPerReward: 3,
    talkMinutesPerReward: 1,
    voiceCallsPerReward: 1,
    voiceTurnsPerReward: 2,
    rewardedContentTypes: ['lesson', 'reading', 'listening', 'vocabulary', 'story'],
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
          maxRewardedAdsPerDay: 8,
          maxContentRewardedAdsPerDay: 5,
          maxChatRewardedAdsPerDay: 1,
          maxTalkRewardedAdsPerDay: 2,
          contentUnlockHours: 24,
          chatMessagesPerReward: 3,
          talkMinutesPerReward: 1,
          rewardedContentTypes: ['lesson', 'reading', 'listening', 'vocabulary', 'story'],
        },
        aiConfig: {
          ...cachedConfig.aiConfig,
          freeUserDailyCostCapUsd: 0.05,
          premiumUserDailyCostCapUsd: 0.2,
          premiumUserMonthlyCostCapUsd: 1.5,
        },
        monetization: {
          ...cachedConfig.monetization,
          freeVoiceCallsPerDay: 1,
          freeVoiceTurnsPerDay: 5,
          freeChatMessagesPerDay: 10,
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
      freeChatMessagesPerDay: Math.max(0, Math.min(Math.round(Number(merged.aiConfig.freeChatMessagesPerDay) || current.aiConfig.freeChatMessagesPerDay || 10), 10000)),
      premiumChatMessagesPerDay: Math.max(0, Math.min(Math.round(Number(merged.aiConfig.premiumChatMessagesPerDay) || current.aiConfig.premiumChatMessagesPerDay || 100), 10000)),
      premiumChatMessagesPerMonth: Math.max(0, Math.min(Math.round(Number(merged.aiConfig.premiumChatMessagesPerMonth) || current.aiConfig.premiumChatMessagesPerMonth || 1000), 100000)),
      freeTalkDemoMinutesPerDay: Math.max(1, Math.min(Math.round(Number(merged.aiConfig.freeTalkDemoMinutesPerDay) || current.aiConfig.freeTalkDemoMinutesPerDay || 3), 60)),
      freeTalkMaxMinutesPerSession: Math.max(1, Math.min(Math.round(Number(merged.aiConfig.freeTalkMaxMinutesPerSession) || current.aiConfig.freeTalkMaxMinutesPerSession || 3), 60)),
      freeTalkMaxTurnsPerSession: Math.max(1, Math.min(Math.round(Number(merged.aiConfig.freeTalkMaxTurnsPerSession) || current.aiConfig.freeTalkMaxTurnsPerSession || 5), 100)),
      premiumTalkMinutesPerSession: Math.max(1, Math.min(Math.round(Number(merged.aiConfig.premiumTalkMinutesPerSession) || current.aiConfig.premiumTalkMinutesPerSession || 15), 120)),
      premiumTalkMinutesPerDay: Math.max(1, Math.min(Math.round(Number(merged.aiConfig.premiumTalkMinutesPerDay) || current.aiConfig.premiumTalkMinutesPerDay || 20), 1440)),
      premiumTalkMinutesPerMonth: Math.max(1, Math.min(Math.round(Number(merged.aiConfig.premiumTalkMinutesPerMonth) || current.aiConfig.premiumTalkMinutesPerMonth || 300), 100000)),
      realtimeTalkEnabled: Boolean(merged.aiConfig.realtimeTalkEnabled ?? current.aiConfig.realtimeTalkEnabled),
      globalDailyBudgetUsd: Math.max(0, Math.min(Number(merged.aiConfig.globalDailyBudgetUsd) || current.aiConfig.globalDailyBudgetUsd || 100, 1_000_000)),
      globalMonthlyBudgetUsd: Math.max(0, Math.min(Number(merged.aiConfig.globalMonthlyBudgetUsd) || current.aiConfig.globalMonthlyBudgetUsd || 2000, 10_000_000)),
      freeUserDailyCostCapUsd: Math.max(0, Math.min(Number(merged.aiConfig.freeUserDailyCostCapUsd) || current.aiConfig.freeUserDailyCostCapUsd || 0.05, 10_000)),
      premiumUserDailyCostCapUsd: Math.max(0, Math.min(Number(merged.aiConfig.premiumUserDailyCostCapUsd) || current.aiConfig.premiumUserDailyCostCapUsd || 0.2, 10_000)),
      premiumUserMonthlyCostCapUsd: Math.max(0, Math.min(Number(merged.aiConfig.premiumUserMonthlyCostCapUsd) || current.aiConfig.premiumUserMonthlyCostCapUsd || 1.5, 100_000)),
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
      maxContentRewardedAdsPerDay: Math.max(0, Math.min(Math.round(Number(merged.ads.maxContentRewardedAdsPerDay) || 0), 20)),
      maxChatRewardedAdsPerDay: Math.max(0, Math.min(Math.round(Number(merged.ads.maxChatRewardedAdsPerDay) || 0), 20)),
      maxTalkRewardedAdsPerDay: Math.max(0, Math.min(Math.round(Number(merged.ads.maxTalkRewardedAdsPerDay) || 0), 20)),
      contentUnlockHours: Math.max(1, Math.min(Math.round(Number(merged.ads.contentUnlockHours) || current.ads.contentUnlockHours), 168)),
      chatMessagesPerReward: Math.max(1, Math.min(Math.round(Number(merged.ads.chatMessagesPerReward) || current.ads.chatMessagesPerReward || 3), 20)),
      talkMinutesPerReward: Math.max(1, Math.min(Math.round(Number(merged.ads.talkMinutesPerReward) || current.ads.talkMinutesPerReward || 1), 5)),
      voiceCallsPerReward: Math.max(1, Math.min(Math.round(Number(merged.ads.voiceCallsPerReward) || current.ads.voiceCallsPerReward), 5)),
      voiceTurnsPerReward: Math.max(1, Math.min(Math.round(Number(merged.ads.voiceTurnsPerReward) || current.ads.voiceTurnsPerReward), 20)),
      rewardedContentTypes: [...new Set(
        (Array.isArray(merged.ads.rewardedContentTypes) ? merged.ads.rewardedContentTypes : current.ads.rewardedContentTypes)
          .filter(type => ['lesson', 'reading', 'listening', 'vocabulary', 'story'].includes(type)),
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
