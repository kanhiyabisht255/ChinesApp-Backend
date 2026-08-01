import { Request } from 'express';

export interface IUser {
  _id: string;
  phone: string;
  name: string;
  email?: string;
  avatar?: string;
  isPremium: boolean;
  premiumExpiry?: Date;
  gems: number;
  xp: number;
  streak: number;
  lastStreakDate?: Date;
  dailyGoal: number;
  todayMinutes: number;
  hskLevel: number;
  nativeLanguage: string;
  learningGoal?: 'general' | 'travel' | 'business' | 'hsk' | 'culture';
  googleId?: string;
  isAdmin?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type LearningLevel = 'starter' | 'beginner' | 'intermediate' | 'advanced' | 'fluent';
export type AccessTier = 'free' | 'premium';
export type LessonType =
  | 'pronunciation'
  | 'vocabulary'
  | 'dialogue'
  | 'grammar'
  | 'listening'
  | 'reading'
  | 'story'
  | 'character'
  | 'quiz';

export interface IProgress {
  _id: string;
  userId: string;
  speaking: number;
  tones: number;
  vocabulary: number;
  grammar: number;
  listening: number;
  reading: number;
  overall: number;
  weeklyXp: number[];
  totalSessions: number;
  totalMinutes: number;
  wordsLearned: number;
  completedLessonIds: string[];
  lastLessonId?: string;
  lastUpdated: Date;
}

export interface ICallSession {
  _id: string;
  sessionId?: string;
  userId: string;
  scenarioId?: string;
  scenarioTitle: string;
  status?: 'started' | 'completed';
  duration: number;
  score: number;
  feedback: string;
  transcript: ITranscriptItem[];
  expiresAt?: Date;
  createdAt: Date;
}

export interface ITranscriptItem {
  role: 'user' | 'ai';
  chinese: string;
  pinyin: string;
  english: string;
  timestamp: number;
}

export interface IChatMessage {
  _id: string;
  userId: string;
  role: 'user' | 'ai';
  content: string;
  pinyin?: string;
  translation?: string;
  createdAt: Date;
}

export interface ICourse {
  _id: string;
  slug: string;
  title: string;
  titleCn: string;
  hskLevel: number;
  description: string;
  totalLessons: number;
  color: string;
  icon: string;
  isPremium: boolean;
  order: number;
  level: LearningLevel;
  category: string;
  accessTier: AccessTier;
  outcomes: string[];
  supportedLanguages: string[];
  isPublished: boolean;
  source?: 'packaged' | 'admin';
  contentVersion?: string;
  translations?: Map<string, Map<string, string>>;
  createdAt: Date;
}

export interface IGrammarPoint {
  title: string;
  explanation: string;
  example: string;
  examplePinyin: string;
  exampleTranslation: string;
  translations?: Map<string, string>;
}

export interface ILesson {
  _id: string;
  slug: string;
  courseId: string;
  title: string;
  titleCn: string;
  pinyin: string;
  description: string;
  order: number;
  type: LessonType;
  estimatedMinutes: number;
  xpReward: number;
  isPremium: boolean;
  isPublished: boolean;
  source?: 'packaged' | 'admin';
  contentVersion?: string;
  objectives: string[];
  vocab: IVocabItem[];
  grammarPoints?: IGrammarPoint[];
  sentences?: IExampleSentence[];
  exercises?: IExercise[];
  translations?: Map<string, Map<string, string>>;
  createdAt: Date;
}

export interface IExampleSentence {
  chinese: string;
  pinyin: string;
  english: string;
  literalMeaning?: string;
  breakdown?: ISentenceChunk[];
  pattern?: string;
  grammarNote?: string;
  usageNote?: string;
  substitutions?: ISubstitutionSentence[];
  translations?: Map<string, string>;
  explanationTranslations?: Map<string, Map<string, string>>;
}

export interface ISentenceChunk {
  chinese: string;
  pinyin: string;
  meaning: string;
  translations?: Map<string, string>;
}

export interface ISubstitutionSentence {
  chinese: string;
  pinyin: string;
  english: string;
  translations?: Map<string, string>;
}

export interface IExercise {
  type: 'multiple_choice' | 'reorder' | 'listen_select' | 'speak' | 'translate' | 'trace';
  prompt: string;
  promptChinese?: string;
  options?: string[];
  answer: string;
  explanation?: string;
  translations?: Map<string, string>;
  optionTranslations?: Map<string, string[]>;
  answerTranslations?: Map<string, string>;
  explanationTranslations?: Map<string, string>;
}

export interface IVocabItem {
  chinese: string;
  pinyin: string;
  english: string;
  partOfSpeech: string;
  examples?: string[];
  translations?: Map<string, string>;
}

export interface IScenario {
  _id: string;
  slug: string;
  title: string;
  titleCn: string;
  pinyin: string;
  description: string;
  icon: string;
  difficulty: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  color: string;
  isPremium: boolean;
  dialogues: IDialogueItem[];
  order: number;
  estimatedMinutes: number;
  learningGoals: string[];
  systemPrompt?: string;
  isPublished: boolean;
  source?: 'packaged' | 'admin';
  contentVersion?: string;
  translations?: Map<string, Map<string, string>>;
  createdAt: Date;
}

export interface IDialogueItem {
  speaker: 'ai' | 'user';
  chinese: string;
  pinyin: string;
  english: string;
  translations?: Map<string, string>;
}

export interface ISubscription {
  _id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  paymentId: string;
  amount: number;
  createdAt: Date;
}

export interface IGemTransaction {
  _id: string;
  userId: string;
  type: 'purchase' | 'spend' | 'reward';
  amount: number;
  balance: number;
  description?: string;
  paymentId?: string;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  userId?: string;
  user?: IUser;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  requestId?: string;
}

export interface AIVoiceResponse {
  chinese: string;
  pinyin: string;
  english: string;
  audioUrl?: string;
  pronunciationScore?: number;
  feedback?: string;
}

export interface AppConfig {
  minAppVersion: string;
  forceUpdate: boolean;
  maintenanceMode: boolean;
  features: {
    voiceCallEnabled: boolean;
    chatEnabled: boolean;
    premiumRequiredForScenarios: string[];
  };
  aiConfig: {
    model: string;
    maxTokens: number;
    temperature: number;
    transcriptionModel: string;
    ttsModel: string;
    ttsVoice: string;
  };
  pricing: {
    monthly: number;
    yearly: number;
    lifetime: number;
  };
  ads: {
    enabled: boolean;
    bannerEnabled: boolean;
    interstitialEnabled: boolean;
    rewardedEnabled: boolean;
    interstitialCooldownSeconds: number;
    bannerAdUnitId: string;
    interstitialAdUnitId: string;
    rewardedAdUnitId: string;
  };
}
