import mongoose, { Schema, Document, Model } from 'mongoose';

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
}, { _id: false });

const vocabItemSchema = new Schema({
  chinese: { type: String, required: true },
  pinyin: { type: String, required: true },
  english: { type: String, required: true },
  partOfSpeech: { type: String, default: '' },
  examples: [{ type: String }],
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
  googleId: { type: String, sparse: true },
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
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

const callSessionSchema = new Schema<ICallSessionDoc>({
  userId: { type: String, required: true, index: true },
  scenarioId: { type: String },
  scenarioTitle: { type: String, required: true },
  duration: { type: Number, required: true },
  score: { type: Number, required: true },
  feedback: { type: String, required: true },
  transcript: [transcriptItemSchema],
}, { timestamps: true });

const chatMessageSchema = new Schema<IChatMessageDoc>({
  userId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'ai'], required: true },
  content: { type: String, required: true },
  pinyin: { type: String },
  translation: { type: String },
}, { timestamps: true });

const courseSchema = new Schema<ICourseDoc>({
  title: { type: String, required: true },
  titleCn: { type: String, required: true },
  hskLevel: { type: Number, required: true },
  description: { type: String, required: true },
  totalLessons: { type: Number, default: 0 },
  color: { type: String, default: '#7F43FE' },
  icon: { type: String, default: 'school' },
  isPremium: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const lessonSchema = new Schema<ILessonDoc>({
  courseId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  titleCn: { type: String, required: true },
  pinyin: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, default: 0 },
  vocab: [vocabItemSchema],
}, { timestamps: true });

const scenarioSchema = new Schema<IScenarioDoc>({
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
}, { timestamps: true });

const subscriptionSchema = new Schema<ISubscriptionDoc>({
  userId: { type: String, required: true, index: true },
  planId: { type: String, required: true },
  status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  paymentId: { type: String, required: true },
  amount: { type: Number, required: true },
}, { timestamps: true });

const gemTransactionSchema = new Schema<IGemTransactionDoc>({
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: ['purchase', 'spend', 'reward'], required: true },
  amount: { type: Number, required: true },
  balance: { type: Number, required: true },
  description: { type: String },
  paymentId: { type: String },
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