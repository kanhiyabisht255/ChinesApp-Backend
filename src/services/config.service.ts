import type { AppConfig } from '../types';

const DEFAULT_CONFIG: AppConfig = {
  minAppVersion: '1.0.0',
  forceUpdate: false,
  maintenanceMode: false,
  features: {
    voiceCallEnabled: true,
    chatEnabled: true,
    premiumRequiredForScenarios: ['s7', 's8', 's9', 's10', 's11', 's12'],
  },
  aiConfig: {
    model: 'gpt-4o-mini',
    maxTokens: 150,
    temperature: 0.7,
  },
  pricing: {
    monthly: 499,
    yearly: 2999,
    lifetime: 7999,
  },
};

let cachedConfig: AppConfig = DEFAULT_CONFIG;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

export const getAppConfig = async (): Promise<AppConfig> => {
  if (Date.now() - lastFetchTime < CACHE_TTL) {
    return cachedConfig;
  }
  
  try {
    const response = await fetch(
      `https://firebaseremoteconfig.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/namespaces/firebase:fetch`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.FIREBASE_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          app_id: process.env.FIREBASE_APP_ID,
          app_instance_id: 'server',
        }),
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      cachedConfig = { ...DEFAULT_CONFIG, ...data };
      lastFetchTime = Date.now();
    }
  } catch (error) {
    console.error('Remote Config Error:', error);
  }
  
  return cachedConfig;
};

export const updateLocalConfig = (updates: Partial<AppConfig>): void => {
  cachedConfig = { ...cachedConfig, ...updates };
};

export const getFeatureFlag = async (feature: keyof AppConfig['features']): Promise<boolean> => {
  const config = await getAppConfig();
  return config.features[feature] ?? true;
};

export const isMaintenanceMode = async (): Promise<boolean> => {
  const config = await getAppConfig();
  return config.maintenanceMode;
};

export const checkAppVersion = async (version: string): Promise<{ update: boolean; force: boolean }> => {
  const config = await getAppConfig();
  const minVersion = config.minAppVersion.split('.').map(Number);
  const currentVersion = version.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    const min = minVersion[i] || 0;
    const current = currentVersion[i] || 0;
    
    if (current < min) {
      return { update: true, force: config.forceUpdate };
    }
    if (current > min) {
      return { update: false, force: false };
    }
  }
  
  return { update: false, force: false };
};