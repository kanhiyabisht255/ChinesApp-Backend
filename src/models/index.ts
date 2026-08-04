import mongoose, { Schema, Document } from 'mongoose';

interface IUserDoc extends Document, Omit<import('../types').IUser, '_id'> {}
interface IProgressDoc extends Document, Omit<import('../types').IProgress, '_id'> {}
interface ICallSessionDoc extends Document, Omit<import('../types').ICallSession, '_id'> {}
interface IChatMessageDoc extends Document, Omit<import('../types').IChatMessage, '_id'> {}
interface ICourseDoc extends Document, Omit<import('../types').ICourse, '_id'> {}
interface ILessonDoc extends Document, Omit<import('../types').ILesson, '_id'> {}
interface IVocabularyTopicDoc extends Document, Omit<import('../types').IVocabularyTopic, '_id'> {}
interface IVocabularyWordDoc extends Document, Omit<import('../types').IVocabularyWord, '_id'> {}
interface IUserVocabularyProgressDoc extends Document, Omit<import('../types').IUserVocabularyProgress, '_id'> {}
interface IUserReadingProgressDoc extends Document, Omit<import('../types').IUserReadingProgress, '_id'> {}
interface IUserListeningProgressDoc extends Document, Omit<import('../types').IUserListeningProgress, '_id'> {}
interface IScenarioDoc extends Document, Omit<import('../types').IScenario, '_id'> {}
interface IReadingStoryDoc extends Document, Omit<import('../types').IReadingStory, '_id'> {}
interface IListeningLessonDoc extends Document, Omit<import('../types').IListeningLesson, '_id'> {}
interface ISubscriptionDoc extends Document, Omit<import('../types').ISubscription, '_id'> {}
interface IGemTransactionDoc extends Document, Omit<import('../types').IGemTransaction, '_id'> {}

const transcriptItemSchema = new Schema({
  role: { type: String, enum: ['user', 'ai'], required: true },
  chinese: { type: String, required: true },
  pinyin: { type: String, required: true },
  english: { type: String, required: true },
  timestamp: { type: Number, required: true },
  correction: { type: String },
  feedback: { type: String },
  pronunciationScore: { type: Number, min: 0, max: 100 },
}, { _id: false });

const dialogueItemSchema = new Schema({
  speaker: { type: String, enum: ['ai', 'user'], required: true },
  chinese: { type: String, required: true },
  pinyin: { type: String, required: true },
  english: { type: String, required: true },
  translations: { type: Map, of: String, default: {} },
}, { _id: false });

const sentenceChunkSchema = new Schema({
  chinese: { type: String, required: true },
  pinyin: { type: String, required: true },
  meaning: { type: String, required: true },
  translations: { type: Map, of: String, default: {} },
}, { _id: false });

const substitutionSentenceSchema = new Schema({
  chinese: { type: String, required: true },
  pinyin: { type: String, required: true },
  english: { type: String, required: true },
  translations: { type: Map, of: String, default: {} },
}, { _id: false });

const exampleSentenceSchema = new Schema({
  chinese: { type: String, required: true },
  pinyin: { type: String, required: true },
  english: { type: String, required: true },
  literalMeaning: { type: String, default: '' },
  breakdown: [sentenceChunkSchema],
  pattern: { type: String, default: '' },
  grammarNote: { type: String, default: '' },
  usageNote: { type: String, default: '' },
  substitutions: [substitutionSentenceSchema],
  translations: { type: Map, of: String, default: {} },
  explanationTranslations: { type: Map, of: Map, default: {} },
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
  optionTranslations: { type: Map, of: [String], default: {} },
  answerTranslations: { type: Map, of: String, default: {} },
  explanationTranslations: { type: Map, of: String, default: {} },
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
  lastDailyProgressDate: { type: Date },
  hskLevel: { type: Number, default: 1 },
  nativeLanguage: { type: String, default: 'en' },
  learningGoal: { type: String, enum: ['general', 'travel', 'business', 'hsk', 'culture'], default: 'general' },
  placementCompletedAt: { type: Date },
  placementScore: { type: Number, min: 0, max: 100 },
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
  weeklyXpWeek: { type: String },
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
  correction: { type: String },
  feedback: { type: String },
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
  source: { type: String, enum: ['packaged', 'admin'], default: 'admin', index: true },
  contentVersion: { type: String, default: '1' },
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
  source: { type: String, enum: ['packaged', 'admin'], default: 'admin', index: true },
  contentVersion: { type: String, default: '1' },
  objectives: [{ type: String }],
  vocab: [vocabItemSchema],
  grammarPoints: [grammarPointSchema],
  sentences: [exampleSentenceSchema],
  exercises: [exerciseSchema],
  translations: { type: Map, of: Map, default: {} },
}, { timestamps: true });

const vocabularyTopicSchema = new Schema<IVocabularyTopicDoc>({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  titleCn: { type: String, required: true },
  pinyin: { type: String, required: true },
  description: { type: String, required: true },
  hskLevel: { type: Number, required: true, min: 1, max: 6, index: true },
  level: {
    type: String,
    enum: ['starter', 'beginner', 'intermediate', 'advanced'],
    default: 'starter',
  },
  icon: { type: String, default: 'menu_book' },
  color: { type: String, default: '#4A9FFF' },
  isPremium: { type: Boolean, default: false },
  order: { type: Number, default: 0, index: true },
  isPublished: { type: Boolean, default: true, index: true },
  source: { type: String, enum: ['packaged', 'admin'], default: 'admin', index: true },
  contentVersion: { type: String, default: '1' },
  translations: { type: Map, of: Map, default: {} },
}, { timestamps: true });

const vocabularyWordSchema = new Schema<IVocabularyWordDoc>({
  slug: { type: String, required: true, unique: true, index: true },
  // Prevents the same learning item from silently appearing in multiple topic packs.
  fingerprint: { type: String, required: true, unique: true, index: true },
  topicId: { type: String, required: true, index: true },
  chinese: { type: String, required: true, trim: true },
  pinyin: { type: String, required: true, trim: true },
  english: { type: String, required: true, trim: true },
  partOfSpeech: { type: String, default: '' },
  classifier: { type: String, default: '' },
  usageNote: { type: String, default: '' },
  exampleChinese: { type: String, required: true },
  examplePinyin: { type: String, required: true },
  exampleEnglish: { type: String, required: true },
  translations: { type: Map, of: Map, default: {} },
  order: { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true, index: true },
  source: { type: String, enum: ['packaged', 'admin'], default: 'admin', index: true },
  contentVersion: { type: String, default: '1' },
}, { timestamps: true });
vocabularyWordSchema.index({ topicId: 1, order: 1 });

const userVocabularyProgressSchema = new Schema<IUserVocabularyProgressDoc>({
  userId: { type: String, required: true, index: true },
  wordId: { type: String, required: true, index: true },
  isLearned: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  mastery: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 },
  lastReviewedAt: { type: Date },
  nextReviewAt: { type: Date, index: true },
  intervalDays: { type: Number, default: 0, min: 0 },
  easeFactor: { type: Number, default: 2.5, min: 1.3, max: 3.5 },
}, { timestamps: true });
userVocabularyProgressSchema.index({ userId: 1, wordId: 1 }, { unique: true });
userVocabularyProgressSchema.index({ userId: 1, nextReviewAt: 1 });

const userReadingProgressSchema = new Schema<IUserReadingProgressDoc>({
  userId: { type: String, required: true, index: true },
  storyId: { type: String, required: true, index: true },
  isCompleted: { type: Boolean, default: false, index: true },
  bestScore: { type: Number, default: 0, min: 0, max: 100 },
  attempts: { type: Number, default: 0, min: 0 },
  lastReadAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });
userReadingProgressSchema.index({ userId: 1, storyId: 1 }, { unique: true });

const userListeningProgressSchema = new Schema<IUserListeningProgressDoc>({
  userId: { type: String, required: true, index: true },
  lessonId: { type: String, required: true, index: true },
  isCompleted: { type: Boolean, default: false, index: true },
  bestScore: { type: Number, default: 0, min: 0, max: 100 },
  attempts: { type: Number, default: 0, min: 0 },
  totalListens: { type: Number, default: 0, min: 0 },
  lastListenedAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });
userListeningProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

const vocabularyReviewSessionSchema = new Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  wordIds: [{ type: String, required: true }],
  completedAt: { type: Date },
  expiresAt: { type: Date, required: true, expires: 0 },
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
  source: { type: String, enum: ['packaged', 'admin'], default: 'admin', index: true },
  contentVersion: { type: String, default: '1' },
  translations: { type: Map, of: Map, default: {} },
}, { timestamps: true });

const readingParagraphSchema = new Schema({
  chinese: { type: String, required: true },
  pinyin: { type: String, required: true },
  english: { type: String, required: true },
  translations: { type: Map, of: String, default: {} },
}, { _id: false });

const readingWordSchema = new Schema({
  chinese: { type: String, required: true },
  pinyin: { type: String, required: true },
  english: { type: String, required: true },
  partOfSpeech: { type: String, default: '' },
  exampleChinese: { type: String, required: true },
  examplePinyin: { type: String, required: true },
  exampleEnglish: { type: String, required: true },
  translations: { type: Map, of: String, default: {} },
}, { _id: false });

const readingQuestionSchema = new Schema({
  prompt: { type: String, required: true },
  options: [{ type: String }],
  answer: { type: String, required: true },
  explanation: { type: String, required: true },
  translations: { type: Map, of: String, default: {} },
}, { _id: false });

const readingStorySchema = new Schema<IReadingStoryDoc>({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  titleCn: { type: String, required: true },
  pinyin: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true, index: true },
  level: { type: String, enum: ['beginner', 'elementary', 'intermediate', 'advanced'], required: true, index: true },
  icon: { type: String, default: 'auto_stories' },
  color: { type: String, default: '#7F43FE' },
  isPremium: { type: Boolean, default: false },
  estimatedMinutes: { type: Number, default: 5 },
  order: { type: Number, default: 0, index: true },
  paragraphs: [readingParagraphSchema],
  vocabulary: [readingWordSchema],
  questions: [readingQuestionSchema],
  isPublished: { type: Boolean, default: true, index: true },
  source: { type: String, enum: ['packaged', 'admin'], default: 'admin', index: true },
  contentVersion: { type: String, default: '1' },
  translations: { type: Map, of: Map, default: {} },
}, { timestamps: true });

const listeningSegmentSchema = new Schema({
  speaker: { type: String, enum: ['narrator', 'speakerA', 'speakerB'], required: true },
  speakerName: { type: String, required: true },
  chinese: { type: String, required: true },
  pinyin: { type: String, required: true },
  english: { type: String, required: true },
  translations: { type: Map, of: String, default: {} },
}, { _id: false });

const listeningFocusWordSchema = new Schema({
  chinese: { type: String, required: true },
  pinyin: { type: String, required: true },
  english: { type: String, required: true },
  translations: { type: Map, of: String, default: {} },
}, { _id: false });

const listeningQuestionSchema = new Schema({
  type: { type: String, enum: ['gist', 'detail', 'dictation', 'sequence'], required: true },
  prompt: { type: String, required: true },
  options: [{ type: String }],
  answer: { type: String, required: true },
  explanation: { type: String, required: true },
  replaySegmentIndex: { type: Number, min: 0 },
  translations: { type: Map, of: String, default: {} },
  optionTranslations: { type: Map, of: [String], default: {} },
  explanationTranslations: { type: Map, of: String, default: {} },
}, { _id: false });

const listeningLessonSchema = new Schema<IListeningLessonDoc>({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  titleCn: { type: String, required: true },
  pinyin: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true, index: true },
  level: { type: String, enum: ['beginner', 'elementary', 'intermediate', 'advanced'], required: true, index: true },
  hskLevel: { type: Number, required: true, min: 1, max: 6, index: true },
  icon: { type: String, default: 'headphones' },
  color: { type: String, default: '#8B5CF6' },
  isPremium: { type: Boolean, default: false },
  estimatedMinutes: { type: Number, default: 6, min: 1, max: 30 },
  xpReward: { type: Number, default: 25, min: 0, max: 100 },
  order: { type: Number, default: 0, index: true },
  preListenTip: { type: String, required: true },
  segments: [listeningSegmentSchema],
  focusWords: [listeningFocusWordSchema],
  questions: [listeningQuestionSchema],
  isPublished: { type: Boolean, default: true, index: true },
  source: { type: String, enum: ['packaged', 'admin'], default: 'admin', index: true },
  contentVersion: { type: String, default: '1' },
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

const rewardGrantSchema = new Schema({
  rewardId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  rewardType: { type: String, enum: ['content', 'voiceCall', 'voiceTurn'], required: true },
  contentType: { type: String, enum: ['lesson', 'reading', 'listening', 'vocabulary', 'scenario'] },
  contentId: { type: String, index: true },
  status: { type: String, enum: ['pending', 'claimed'], default: 'pending', index: true },
  grantAmount: { type: Number, default: 1, min: 1 },
  claimedAt: { type: Date, index: true },
  expiresAt: { type: Date, required: true, expires: 0 },
}, { timestamps: true });
rewardGrantSchema.index({ userId: 1, contentType: 1, contentId: 1, status: 1, expiresAt: 1 });

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
export const VocabularyTopic = mongoose.model<IVocabularyTopicDoc>('VocabularyTopic', vocabularyTopicSchema);
export const VocabularyWord = mongoose.model<IVocabularyWordDoc>('VocabularyWord', vocabularyWordSchema);
export const UserVocabularyProgress = mongoose.model<IUserVocabularyProgressDoc>(
  'UserVocabularyProgress',
  userVocabularyProgressSchema,
);
export const UserReadingProgress = mongoose.model<IUserReadingProgressDoc>(
  'UserReadingProgress',
  userReadingProgressSchema,
);
export const UserListeningProgress = mongoose.model<IUserListeningProgressDoc>(
  'UserListeningProgress',
  userListeningProgressSchema,
);
export const VocabularyReviewSession = mongoose.model('VocabularyReviewSession', vocabularyReviewSessionSchema);
export const Scenario = mongoose.model<IScenarioDoc>('Scenario', scenarioSchema);
export const ReadingStory = mongoose.model<IReadingStoryDoc>('ReadingStory', readingStorySchema);
export const ListeningLesson = mongoose.model<IListeningLessonDoc>('ListeningLesson', listeningLessonSchema);
export const Subscription = mongoose.model<ISubscriptionDoc>('Subscription', subscriptionSchema);
export const GemTransaction = mongoose.model<IGemTransactionDoc>('GemTransaction', gemTransactionSchema);
export const AppSetting = mongoose.model('AppSetting', appSettingSchema);
export const AIUsage = mongoose.model('AIUsage', aiUsageSchema);
export const RewardGrant = mongoose.model('RewardGrant', rewardGrantSchema);
export const OTPCode = mongoose.model('OTPCode', otpCodeSchema);
