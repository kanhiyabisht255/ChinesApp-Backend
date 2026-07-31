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
  res.json({ success: true, data: lessons.map(lesson => localizeLesson(lesson, language)) });
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
    data: { xpEarned, alreadyCompleted },
  });
};

export const getScenarios = async (req: Request, res: Response): Promise<void> => {
  const language = await getRequestLanguage(req);
  const scenarios = await Scenario.find({ isPublished: true }).sort({ order: 1 });
  res.json({ success: true, data: scenarios.map(scenario => localizeScenario(scenario, language)) });
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
