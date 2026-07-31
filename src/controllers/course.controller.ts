import { Request, Response } from 'express';
import { Course, Lesson, Scenario } from '../models';
import type { AuthRequest } from '../types';

export const getCourses = async (req: Request, res: Response): Promise<void> => {
  const courses = await Course.find().sort({ order: 1 });
  res.json({ success: true, data: courses });
};

export const getCourse = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const course = await Course.findById(id);
  
  if (!course) {
    res.status(404).json({ success: false, message: 'Course not found' });
    return;
  }
  
  res.json({ success: true, data: course });
};

export const getLessons = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const lessons = await Lesson.find({ courseId }).sort({ order: 1 });
  res.json({ success: true, data: lessons });
};

export const getLesson = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const lesson = await Lesson.findById(id);
  
  if (!lesson) {
    res.status(404).json({ success: false, message: 'Lesson not found' });
    return;
  }
  
  res.json({ success: true, data: lesson });
};

export const completeLesson = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { lessonId } = req.params;
  
  const { User, Progress } = await import('../models');
  
  await User.findByIdAndUpdate(authReq.userId, {
    $inc: { xp: 20 },
  });
  
  await Progress.findOneAndUpdate(
    { userId: authReq.userId },
    {
      $inc: { wordsLearned: 5, totalSessions: 1 },
      $set: { lastUpdated: new Date() },
    },
    { upsert: true }
  );
  
  res.json({ success: true, message: 'Lesson completed', data: { xpEarned: 20 } });
};

export const getScenarios = async (req: Request, res: Response): Promise<void> => {
  const scenarios = await Scenario.find().sort({ order: 1 });
  res.json({ success: true, data: scenarios });
};

export const getScenario = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const scenario = await Scenario.findById(id);
  
  if (!scenario) {
    res.status(404).json({ success: false, message: 'Scenario not found' });
    return;
  }
  
  res.json({ success: true, data: scenario });
};