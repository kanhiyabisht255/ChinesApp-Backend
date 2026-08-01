import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Course, Lesson, Progress, Scenario, User } from '../models';
import type { AuthRequest } from '../types';
import {
  getRequestLanguage,
  localizeCourse,
  localizeLesson,
  localizeScenario,
} from '../services/localization.service';
import { hasActivePremium } from '../services/entitlement.service';
import { normalizeTimezoneOffset, recordLearningActivity } from '../services/streak.service';

const idOrSlugQuery = (value: string): Record<string, unknown> =>
  mongoose.isValidObjectId(value)
    ? { $or: [{ _id: value }, { slug: value }] }
    : { slug: value };

const hasPremiumAccess = async (req: Request): Promise<boolean> => {
  const userId = (req as AuthRequest).userId;
  if (!userId) return false;
  const user = await User.findById(userId).select('isPremium premiumExpiry').lean();
  if (!user) return false;
  return hasActivePremium(user);
};

const redactPremiumLesson = (lesson: Record<string, any>): Record<string, any> => ({
  ...lesson,
  objectives: [],
  vocab: [],
  grammarPoints: [],
  sentences: [],
  exercises: [],
  isLocked: true,
});

const redactPremiumScenario = (scenario: Record<string, any>): Record<string, any> => ({
  ...scenario,
  dialogues: [],
  systemPrompt: undefined,
  isLocked: true,
});

export const getCourses = async (req: Request, res: Response): Promise<void> => {
  const language = await getRequestLanguage(req);
  const courses = await Course.find({ isPublished: true }).sort({ order: 1 });
  res.json({ success: true, data: courses.map(course => localizeCourse(course, language)) });
};

export const getCourse = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const language = await getRequestLanguage(req);
  const course = await Course.findOne({ ...idOrSlugQuery(id), isPublished: true });
  
  if (!course) {
    res.status(404).json({ success: false, message: 'Course not found' });
    return;
  }
  
  res.json({ success: true, data: localizeCourse(course, language) });
};

export const getLessons = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const language = await getRequestLanguage(req);
  const course = await Course.findOne(idOrSlugQuery(courseId)).select('_id');
  const resolvedCourseId = course?._id.toString() || courseId;
  const lessons = await Lesson.find({ courseId: resolvedCourseId, isPublished: true }).sort({ order: 1 });
  const premiumAccess = await hasPremiumAccess(req);
  res.json({
    success: true,
    data: lessons.map(lesson => {
      const localized = localizeLesson(lesson, language);
      return lesson.isPremium && !premiumAccess ? redactPremiumLesson(localized) : localized;
    }),
  });
};

export const getLesson = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const language = await getRequestLanguage(req);
  const lesson = await Lesson.findOne({ ...idOrSlugQuery(id), isPublished: true });
  
  if (!lesson) {
    res.status(404).json({ success: false, message: 'Lesson not found' });
    return;
  }
  
  if (lesson.isPremium && !(await hasPremiumAccess(req))) {
    res.status(403).json({ success: false, message: 'Premium subscription required for this lesson' });
    return;
  }

  res.json({ success: true, data: localizeLesson(lesson, language) });
};

export const getSkillCollections = async (req: Request, res: Response): Promise<void> => {
  const skill = req.params.skill;
  if (skill !== 'vocabulary' && skill !== 'grammar') {
    res.status(400).json({ success: false, message: 'Skill must be vocabulary or grammar' });
    return;
  }

  const language = await getRequestLanguage(req);
  const premiumAccess = await hasPremiumAccess(req);
  const lessonType = skill === 'vocabulary' ? 'vocabulary' : 'grammar';
  const [courses, lessons] = await Promise.all([
    Course.find({ isPublished: true }).sort({ order: 1 }),
    Lesson.find({ isPublished: true, type: lessonType }).sort({ order: 1 }),
  ]);

  const lessonByCourse = new Map<string, (typeof lessons)[number]>();
  lessons.forEach(lesson => {
    if (!lessonByCourse.has(lesson.courseId)) lessonByCourse.set(lesson.courseId, lesson);
  });

  const collections = courses.flatMap(course => {
    const lesson = lessonByCourse.get(course._id.toString());
    if (!lesson) return [];

    const localizedCourse = localizeCourse(course, language);
    const localizedLesson = localizeLesson(lesson, language);
    const vocabulary = localizedLesson.vocab || [];
    const grammarPoints = localizedLesson.grammarPoints || [];
    const preview = skill === 'vocabulary' ? vocabulary[0] : grammarPoints[0];
    const localizedGrammarSentence = skill === 'grammar'
      ? localizedLesson.sentences?.find((sentence: Record<string, any>) => sentence.chinese === preview?.example)
      : undefined;
    const isLocked = lesson.isPremium && !premiumAccess;

    return [{
      id: `${course.slug}-${skill}`,
      skill,
      courseId: course._id.toString(),
      courseTitle: localizedCourse.title,
      courseTitleCn: course.titleCn,
      hskLevel: course.hskLevel,
      lessonId: lesson._id.toString(),
      lessonTitle: localizedLesson.title,
      lessonTitleCn: lesson.titleCn,
      description: localizedLesson.description,
      previewChinese: skill === 'vocabulary' ? preview?.chinese || '' : preview?.example || '',
      previewPinyin: skill === 'vocabulary' ? preview?.pinyin || '' : preview?.examplePinyin || '',
      previewTranslation: skill === 'vocabulary'
        ? preview?.english || ''
        : localizedGrammarSentence?.english || preview?.exampleTranslation || '',
      explanation: skill === 'grammar' ? preview?.explanation || '' : '',
      itemCount: skill === 'vocabulary' ? vocabulary.length : grammarPoints.length,
      estimatedMinutes: lesson.estimatedMinutes,
      isPremium: lesson.isPremium,
      isLocked,
      color: course.color,
      order: course.order,
    }];
  });

  res.json({ success: true, data: collections });
};

export const completeLesson = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { lessonId } = req.params;
  const lesson = await Lesson.findOne(idOrSlugQuery(lessonId));

  if (!lesson) {
    res.status(404).json({ success: false, message: 'Lesson not found' });
    return;
  }

  if (lesson.isPremium && !(await hasPremiumAccess(req))) {
    res.status(403).json({ success: false, message: 'Premium subscription required for this lesson' });
    return;
  }

  const lessonKey = lesson._id.toString();
  const progress = await Progress.findOne({ userId: authReq.userId });
  const alreadyCompleted = progress?.completedLessonIds?.includes(lessonKey) || false;
  const xpEarned = alreadyCompleted ? 0 : lesson.xpReward;
  const timezoneOffset = normalizeTimezoneOffset(req.header('x-timezone-offset'));
  const streak = await recordLearningActivity(authReq.userId, timezoneOffset);

  if (streak === null) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  if (xpEarned > 0) {
    await User.findByIdAndUpdate(authReq.userId, { $inc: { xp: xpEarned } });
  }

  await Progress.findOneAndUpdate(
    { userId: authReq.userId },
    {
      ...(alreadyCompleted ? {} : {
        $inc: { wordsLearned: lesson.vocab.length, totalSessions: 1 },
        $addToSet: { completedLessonIds: lessonKey },
      }),
      $set: { lastLessonId: lessonKey, lastUpdated: new Date() },
    },
    { upsert: true }
  );

  res.json({
    success: true,
    message: alreadyCompleted ? 'Lesson was already completed' : 'Lesson completed',
    data: { xpEarned, alreadyCompleted, streak },
  });
};

export const getScenarios = async (req: Request, res: Response): Promise<void> => {
  const language = await getRequestLanguage(req);
  const scenarios = await Scenario.find({ isPublished: true }).sort({ order: 1 });
  const premiumAccess = await hasPremiumAccess(req);
  res.json({
    success: true,
    data: scenarios.map(scenario => {
      const localized = localizeScenario(scenario, language);
      return scenario.isPremium && !premiumAccess ? redactPremiumScenario(localized) : localized;
    }),
  });
};

export const getScenario = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const language = await getRequestLanguage(req);
  const scenario = await Scenario.findOne({ ...idOrSlugQuery(id), isPublished: true });
  
  if (!scenario) {
    res.status(404).json({ success: false, message: 'Scenario not found' });
    return;
  }
  
  if (scenario.isPremium && !(await hasPremiumAccess(req))) {
    res.status(403).json({ success: false, message: 'Premium subscription required for this scenario' });
    return;
  }

  res.json({ success: true, data: localizeScenario(scenario, language) });
};
