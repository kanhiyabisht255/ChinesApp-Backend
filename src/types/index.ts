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
  googleId?: string;
  isAdmin?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
  lastUpdated: Date;
}

export interface ICallSession {
  _id: string;
  userId: string;
  scenarioId?: string;
  scenarioTitle: string;
  duration: number;
  score: number;
  feedback: string;
  transcript: ITranscriptItem[];
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
  title: string;
  titleCn: string;
  hskLevel: number;
  description: string;
  totalLessons: number;
  color: string;
  icon: string;
  isPremium: boolean;
  order: number;
  createdAt: Date;
}

export interface ILesson {
  _id: string;
  courseId: string;
  title: string;
  titleCn: string;
  pinyin: string;
  description: string;
  order: number;
  vocab: IVocabItem[];
  createdAt: Date;
}

export interface IVocabItem {
  chinese: string;
  pinyin: string;
  english: string;
  partOfSpeech: string;
  examples?: string[];
}

export interface IScenario {
  _id: string;
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
  createdAt: Date;
}

export interface IDialogueItem {
  speaker: 'ai' | 'user';
  chinese: string;
  pinyin: string;
  english: string;
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
  };
  pricing: {
    monthly: number;
    yearly: number;
    lifetime: number;
  };
}