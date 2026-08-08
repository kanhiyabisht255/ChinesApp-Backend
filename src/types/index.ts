import { Request } from 'express';

export interface IUser {
  _id: string;
  phone?: string;
  name: string;
  email?: string;
  emailVerified?: boolean;
  passwordHash?: string;
  avatar?: string;
  isPremium: boolean;
  premiumExpiry?: Date;
  gems: number;
  xp: number;
  streak: number;
  lastStreakDate?: Date;
  dailyGoal: number;
  todayMinutes: number;
  lastDailyProgressDate?: Date;
  hskLevel: number;
  nativeLanguage: string;
  learningGoal?: 'general' | 'travel' | 'business' | 'hsk' | 'culture';
  placementCompletedAt?: Date;
  placementScore?: number;
  googleId?: string;
  isAdmin?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type LearningLevel = 'starter' | 'beginner' | 'intermediate' | 'advanced' | 'fluent';
export type AccessTier = 'free' | 'premium';
export type RewardedContentType = 'lesson' | 'reading' | 'listening' | 'vocabulary' | 'story' | 'scenario';
export type NarratedStoryAccessTier = 'free' | 'rewarded_or_premium' | 'premium';
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
  weeklyXpWeek?: string;
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
  correction?: string;
  feedback?: string;
  pronunciationScore?: number;
}

export interface IChatMessage {
  _id: string;
  userId: string;
  role: 'user' | 'ai';
  content: string;
  pinyin?: string;
  translation?: string;
  correction?: string;
  feedback?: string;
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

export interface IVocabularyTopic {
  _id: string;
  slug: string;
  title: string;
  titleCn: string;
  pinyin: string;
  description: string;
  hskLevel: number;
  level: 'starter' | 'beginner' | 'intermediate' | 'advanced';
  icon: string;
  color: string;
  isPremium: boolean;
  order: number;
  isPublished: boolean;
  source?: 'packaged' | 'admin';
  contentVersion?: string;
  translations?: Map<string, Map<string, string>>;
  createdAt: Date;
}

export interface IVocabularyWord {
  _id: string;
  slug: string;
  fingerprint: string;
  topicId: string;
  chinese: string;
  pinyin: string;
  english: string;
  partOfSpeech: string;
  classifier?: string;
  usageNote?: string;
  exampleChinese: string;
  examplePinyin: string;
  exampleEnglish: string;
  translations?: Map<string, Map<string, string>>;
  order: number;
  isPremium: boolean;
  isPublished: boolean;
  source?: 'packaged' | 'admin';
  contentVersion?: string;
  createdAt: Date;
}

export interface IUserVocabularyProgress {
  _id: string;
  userId: string;
  wordId: string;
  isLearned: boolean;
  isFavorite: boolean;
  mastery: number;
  reviewCount: number;
  lastReviewedAt?: Date;
  nextReviewAt?: Date;
  intervalDays: number;
  easeFactor: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserReadingProgress {
  _id: string;
  userId: string;
  storyId: string;
  isCompleted: boolean;
  bestScore: number;
  attempts: number;
  lastReadAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserNarratedStoryProgress {
  _id: string;
  userId: string;
  storyId: string;
  positionMs: number;
  durationMs: number;
  completionPercent: number;
  isCompleted: boolean;
  playCount: number;
  lastPlayedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserListeningProgress {
  _id: string;
  userId: string;
  lessonId: string;
  isCompleted: boolean;
  bestScore: number;
  attempts: number;
  totalListens: number;
  lastListenedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IListeningSegment {
  speaker: 'narrator' | 'speakerA' | 'speakerB';
  speakerName: string;
  chinese: string;
  pinyin: string;
  english: string;
  translations?: Map<string, string>;
}

export interface IListeningFocusWord {
  chinese: string;
  pinyin: string;
  english: string;
  translations?: Map<string, string>;
}

export interface IListeningQuestion {
  type: 'gist' | 'detail' | 'dictation' | 'sequence';
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  replaySegmentIndex?: number;
  translations?: Map<string, string>;
  optionTranslations?: Map<string, string[]>;
  explanationTranslations?: Map<string, string>;
}

export interface IListeningLesson {
  _id: string;
  slug: string;
  title: string;
  titleCn: string;
  pinyin: string;
  description: string;
  category: string;
  level: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  hskLevel: number;
  icon: string;
  color: string;
  isPremium: boolean;
  estimatedMinutes: number;
  xpReward: number;
  order: number;
  preListenTip: string;
  segments: IListeningSegment[];
  focusWords: IListeningFocusWord[];
  questions: IListeningQuestion[];
  isPublished: boolean;
  source?: 'packaged' | 'admin';
  contentVersion?: string;
  translations?: Map<string, Map<string, string>>;
  createdAt: Date;
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

export interface IReadingParagraph {
  chinese: string;
  pinyin: string;
  english: string;
  translations?: Map<string, string>;
}

export interface IReadingWord {
  chinese: string;
  pinyin: string;
  english: string;
  partOfSpeech?: string;
  exampleChinese: string;
  examplePinyin: string;
  exampleEnglish: string;
  translations?: Map<string, string>;
}

export interface IReadingQuestion {
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  translations?: Map<string, string>;
}

export interface IReadingStory {
  _id: string;
  slug: string;
  title: string;
  titleCn: string;
  pinyin: string;
  description: string;
  category: string;
  level: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  icon: string;
  color: string;
  isPremium: boolean;
  estimatedMinutes: number;
  order: number;
  paragraphs: IReadingParagraph[];
  vocabulary: IReadingWord[];
  questions: IReadingQuestion[];
  audioUrl?: string;
  audioStorageProvider?: 'google-drive';
  audioStorageId?: string;
  audioProvider?: 'you.bot';
  ttsModel?: string;
  contentHash?: string;
  generatedAt?: Date;
  isPublished: boolean;
  source?: 'packaged' | 'admin';
  contentVersion?: string;
  translations?: Map<string, Map<string, string>>;
  createdAt: Date;
}

export interface INarratedStorySegment {
  chinese: string;
  pinyin: string;
  english: string;
  startMs: number;
  endMs: number;
}

export interface INarratedStoryVocabulary {
  chinese: string;
  pinyin: string;
  english: string;
}

export interface INarratedStoryQuestion {
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface INarratedStory {
  _id: string;
  slug: string;
  title: string;
  titleCn: string;
  pinyin: string;
  description: string;
  category: string;
  hskLevel: number;
  coverImageUrl?: string;
  accentColor: string;
  accessTier: NarratedStoryAccessTier;
  isPremium: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  order: number;
  durationMs: number;
  estimatedMinutes: number;
  sourceAudioUrl: string;
  audioUrl: string;
  audioStorageProvider: 'cloudinary' | 'external';
  audioPublicId?: string;
  audioFormat: string;
  audioBytes: number;
  timingMode: 'estimated' | 'manual';
  segments: INarratedStorySegment[];
  vocabulary: INarratedStoryVocabulary[];
  questions: INarratedStoryQuestion[];
  contentHash: string;
  titleKey: string;
  titleCnKey: string;
  createdAt: Date;
  updatedAt: Date;
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
  monetizationPolicyVersion: number;
  minAppVersion: string;
  forceUpdate: boolean;
  maintenanceMode: boolean;
  supportEmail: string;
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
    ttsSpeed: number;
    freeChatMessagesPerDay?: number;
    premiumChatMessagesPerDay?: number;
    premiumChatMessagesPerMonth?: number;
    freeTalkDemoMinutesPerDay?: number;
    freeTalkMaxMinutesPerSession?: number;
    freeTalkMaxTurnsPerSession?: number;
    premiumTalkMinutesPerSession?: number;
    premiumTalkMinutesPerDay?: number;
    premiumTalkMinutesPerMonth?: number;
    realtimeTalkEnabled?: boolean;
    globalDailyBudgetUsd?: number;
    globalMonthlyBudgetUsd?: number;
    freeUserDailyCostCapUsd?: number;
    premiumUserDailyCostCapUsd?: number;
    premiumUserMonthlyCostCapUsd?: number;
  };
  pricing: {
    monthly: number;
    yearly: number;
    lifetime: number;
  };
  monetization: {
    freeVoiceCallsPerDay: number;
    freeVoiceTurnsPerDay: number;
    freeChatMessagesPerDay: number;
    voiceCallGemCost: number;
    voiceTurnGemCost: number;
    chatMessageGemCost: number;
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
    maxRewardedAdsPerDay: number;
    maxContentRewardedAdsPerDay?: number;
    maxChatRewardedAdsPerDay?: number;
    maxTalkRewardedAdsPerDay?: number;
    contentUnlockHours: number;
    chatMessagesPerReward?: number;
    talkMinutesPerReward?: number;
    voiceCallsPerReward: number;
    voiceTurnsPerReward: number;
    rewardedContentTypes: RewardedContentType[];
  };
}
