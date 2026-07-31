import mongoose, { Schema, Document } from 'mongoose';

interface IUserDoc extends Document, Omit<import('../types').IUser, '_id'> {}
interface IProgressDoc extends Document, Omit<import('../types').IProgress, '_id'> {}
interface ICallSessionDoc extends Document, Omit<import('../types').ICallSession, '_id'> {}
interface IChatMessageDoc extends Document, Omit<import('../types').IChatMessage, '_id'> {}
interface ICourseDoc extends Document, Omit<import('../types').ICourse, '_id'> {}
interface ILessonDoc extends Document, Omit<import('../types').ILesson, '_id'> {}
interface IScenarioDoc extends Document, Omit<import('../types').IScenario, '_id'> {}
interface ISubscriptionDoc extends Document, Omit<import('../types').ISubscription, '_id'> {}
interface IGemTransactionDoc extends Document, Omit<import('../types').IGemTransaction, '_id'> {}

const transcriptItemSchema = new Schema({
  role: { type: String, enum: ['user', 'ai'], required: true },
  chinese: { type: String, required: true },
  pinyin: { type: String, required: true },
  english: { type: String, required: true },
  timestamp: { type: Number, required: true },
}, { _id: false });

const dialogueItemSchema = new Schema({
  speaker: { type: String, enum: ['ai', 'user'], required: true },
  chinese: { type: String, required: true },
  pinyin: { type: String, required: true },
  english: { type: String, required: true },
  translations: { type: Map, of: String, default: {} },
}, { _id: false });

const exampleSentenceSchema = new Schema({
  chinese: { type: String, required: true },
  pinyin: { type: String, required: true },
  english: { type: String, required: true },
  translations: { type: Map, of: String, default: {} },
}, { _id: false });

const exerciseSchema = new Schema({
  type: {
    type: String,
    enum: ['multiple_choice', 'reorder', 'listen_select', 'speak', 'translate', 'trace'],
    required: true,
  },
  prompt: { type: String, required: true },
  promptChinese: { type: String },
  options: [{ type: String }],
  answer: { type: String, required: true },
  explanation: { type: String },
  translations: { type: Map, of: String, default: {} },
}, { _id: false });

const vocabItemSchema = new Schema({
  chinese: { type: String, required: true },
  pinyin: { type: String, required: true },
  english: { type: String, required: true },
  partOfSpeech: { type: String, default: '' },
  examples: [{ type: String }],
  translations: { type: Map, of: String, default: {} },
}, { _id: false });

const grammarPointSchema = new Schema({
  title: { type: String, required: true },
  explanation: { type: String, required: true },
  example: { type: String, required: true },
  examplePinyin: { type: String, default: '' },
  exampleTranslation: { type: String, default: '' },
  translations: { type: Map, of: String, default: {} },
}, { _id: false });

const userSchema = new Schema<IUserDoc>({
  phone: { type: String, required: true, unique: true, sparse: true },
  name: { type: String, required: true, default: 'Learner' },
  email: { type: String, sparse: true },
  avatar: { type: String },
  isPremium: { type: Boolean, default: false },
  premiumExpiry: { type: Date },
  gems: { type: Number, default: 50 },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastStreakDate: { type: Date },
  dailyGoal: { type: Number, default: 10 },
  todayMinutes: { type: Number, default: 0 },
  hskLevel: { type: Number, default: 1 },
  nativeLanguage: { type: String, default: 'en' },
  learningGoal: { type: String, enum: ['general', 'travel', 'business', 'hsk', 'culture'], default: 'general' },
  googleId: { type: String, sparse: true },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

const progressSchema = new Schema<IProgressDoc>({
  userId: { type: String, required: true, unique: true },
  speaking: { type: Number, default: 0 },
  tones: { type: Number, default: 0 },
  vocabulary: { type: Number, default: 0 },
  grammar: { type: Number, default: 0 },
  listening: { type: Number, default: 0 },
  reading: { type: Number, default: 0 },
  overall: { type: Number, default: 0 },
  weeklyXp: [{ type: Number }],
  totalSessions: { type: Number, default: 0 },
  totalMinutes: { type: Number, default: 0 },
  wordsLearned: { type: Number, default: 0 },
  completedLessonIds: [{ type: String }],
  lastLessonId: { type: String },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

const callSessionSchema = new Schema<ICallSessionDoc>({
  sessionId: { type: String, unique: true, sparse: true, index: true },
  userId: { type: String, required: true, index: true },
  scenarioId: { type: String },
  scenarioTitle: { type: String, required: true },
  status: { type: String, enum: ['started', 'completed'], default: 'completed', index: true },
  duration: { type: Number, required: true },
  score: { type: Number, required: true },
  feedback: { type: String, required: true },
  transcript: [transcriptItemSchema],
  expiresAt: { type: Date, expires: 0 },
}, { timestamps: true });

const chatMessageSchema = new Schema<IChatMessageDoc>({
  userId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'ai'], required: true },
  content: { type: String, required: true },
  pinyin: { type: String },
  translation: { type: String },
}, { timestamps: true });

const courseSchema = new Schema<ICourseDoc>({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  titleCn: { type: String, required: true },
  hskLevel: { type: Number, required: true },
  description: { type: String, required: true },
  totalLessons: { type: Number, default: 0 },
  color: { type: String, default: '#7F43FE' },
  icon: { type: String, default: 'school' },
  isPremium: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  level: { type: String, enum: ['starter', 'beginner', 'intermediate', 'advanced', 'fluent'], default: 'starter' },
  category: { type: String, default: 'foundations' },
  accessTier: { type: String, enum: ['free', 'premium'], default: 'free' },
  outcomes: [{ type: String }],
  supportedLanguages: [{ type: String }],
  isPublished: { type: Boolean, default: true },
  translations: { type: Map, of: Map, default: {} },
}, { timestamps: true });

const lessonSchema = new Schema<ILessonDoc>({
  slug: { type: String, required: true, unique: true, index: true },
  courseId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  titleCn: { type: String, required: true },
  pinyin: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, default: 0 },
  type: {
    type: String,
    enum: ['pronunciation', 'vocabulary', 'dialogue', 'grammar', 'listening', 'reading', 'story', 'character', 'quiz'],
    default: 'vocabulary',
  },
  estimatedMinutes: { type: Number, default: 8 },
  xpReward: { type: Number, default: 20 },
  isPremium: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  objectives: [{ type: String }],
  vocab: [vocabItemSchema],
  grammarPoints: [grammarPointSchema],
  sentences: [exampleSentenceSchema],
  exercises: [exerciseSchema],
  translations: { type: Map, of: Map, default: {} },
}, { timestamps: true });

const scenarioSchema = new Schema<IScenarioDoc>({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  titleCn: { type: String, required: true },
  pinyin: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'chat' },
  difficulty: { type: String, enum: ['beginner', 'elementary', 'intermediate', 'advanced'], default: 'beginner' },
  color: { type: String, default: '#7F43FE' },
  isPremium: { type: Boolean, default: false },
  dialogues: [dialogueItemSchema],
  order: { type: Number, default: 0 },
  estimatedMinutes: { type: Number, default: 5 },
  learningGoals: [{ type: String }],
  systemPrompt: { type: String },
  isPublished: { type: Boolean, default: true },
  translations: { type: Map, of: Map, default: {} },
}, { timestamps: true });

const subscriptionSchema = new Schema<ISubscriptionDoc>({
  userId: { type: String, required: true, index: true },
  planId: { type: String, required: true },
  status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  paymentId: { type: String, required: true, unique: true, index: true },
  amount: { type: Number, required: true },
}, { timestamps: true });

const gemTransactionSchema = new Schema<IGemTransactionDoc>({
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: ['purchase', 'spend', 'reward'], required: true },
  amount: { type: Number, required: true },
  balance: { type: Number, required: true },
  description: { type: String },
  paymentId: { type: String, unique: true, sparse: true, index: true },
}, { timestamps: true });

const appSettingSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

const aiUsageSchema = new Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true },
  voiceCalls: { type: Number, default: 0 },
  voiceTurns: { type: Number, default: 0 },
  chatMessages: { type: Number, default: 0 },
}, { timestamps: true });
aiUsageSchema.index({ userId: 1, date: 1 }, { unique: true });

const otpCodeSchema = new Schema({
  phone: { type: String, required: true, unique: true, index: true },
  otpHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, expires: 0 },
}, { timestamps: true });

export const User = mongoose.model<IUserDoc>('User', userSchema);
export const Progress = mongoose.model<IProgressDoc>('Progress', progressSchema);
export const CallSession = mongoose.model<ICallSessionDoc>('CallSession', callSessionSchema);
export const ChatMessage = mongoose.model<IChatMessageDoc>('ChatMessage', chatMessageSchema);
export const Course = mongoose.model<ICourseDoc>('Course', courseSchema);
export const Lesson = mongoose.model<ILessonDoc>('Lesson', lessonSchema);
export const Scenario = mongoose.model<IScenarioDoc>('Scenario', scenarioSchema);
export const Subscription = mongoose.model<ISubscriptionDoc>('Subscription', subscriptionSchema);
export const GemTransaction = mongoose.model<IGemTransactionDoc>('GemTransaction', gemTransactionSchema);
export const AppSetting = mongoose.model('AppSetting', appSettingSchema);
export const AIUsage = mongoose.model('AIUsage', aiUsageSchema);
export const OTPCode = mongoose.model('OTPCode', otpCodeSchema);
