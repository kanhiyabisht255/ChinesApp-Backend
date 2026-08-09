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
import { contentAccess, hasContentAccess } from '../services/reward.service';
import { localWeekdayIndex, localWeekKey, normalizeTimezoneOffset, recordLearningActivity } from '../services/streak.service';

const idOrSlugQuery = (value: string): Record<string, unknown> =>
  mongoose.isValidObjectId(value)
    ? { $or: [{ _id: value }, { slug: value }] }
    : { slug: value };

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
  const userId = (req as AuthRequest).userId;
  const [courses, progress] = await Promise.all([
    Course.find({ isPublished: true }).sort({ order: 1 }),
    userId ? Progress.findOne({ userId }).select('completedLessonIds').lean() : null,
  ]);
  const completedIds = new Set(progress?.completedLessonIds || []);
  const completedLessons = completedIds.size > 0
    ? await Lesson.find({ _id: { $in: [...completedIds] }, isPublished: true }).select('_id courseId').lean()
    : [];
  const completedByCourse = new Map<string, number>();
  completedLessons.forEach(lesson => {
    completedByCourse.set(lesson.courseId, (completedByCourse.get(lesson.courseId) || 0) + 1);
  });

  res.json({
    success: true,
    data: courses.map(course => ({
      ...localizeCourse(course, language),
      completedLessons: completedByCourse.get(course._id.toString()) || 0,
    })),
  });
};

export const getCourse = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const language = await getRequestLanguage(req);
  const course = await Course.findOne({ ...idOrSlugQuery(id), isPublished: true });
  
  if (!course) {
    res.status(404).json({ success: false, message: 'Course not found' });
    return;
  }
  
  const userId = (req as AuthRequest).userId;
  const progress = userId
    ? await Progress.findOne({ userId }).select('completedLessonIds').lean()
    : null;
  const completedLessons = progress?.completedLessonIds?.length
    ? await Lesson.countDocuments({
        _id: { $in: progress.completedLessonIds },
        courseId: course._id.toString(),
        isPublished: true,
      })
    : 0;
  res.json({
    success: true,
    data: { ...localizeCourse(course, language), completedLessons },
  });
};

export const getLessons = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const language = await getRequestLanguage(req);
  const course = await Course.findOne(idOrSlugQuery(courseId)).select('_id');
  const resolvedCourseId = course?._id.toString() || courseId;
  const lessons = await Lesson.find({ courseId: resolvedCourseId, isPublished: true }).sort({ order: 1 });
  const access = await contentAccess(
    (req as AuthRequest).userId,
    'lesson',
    lessons.map(lesson => lesson._id.toString()),
  );
  res.json({
    success: true,
    data: lessons.map(lesson => {
      const localized = localizeLesson(lesson, language);
      const unlocked = access.premium || access.unlockedIds.has(lesson._id.toString());
      return lesson.isPremium && !unlocked ? redactPremiumLesson(localized) : { ...localized, isLocked: false };
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
  
  if (lesson.isPremium && !(await hasContentAccess((req as AuthRequest).userId, 'lesson', lesson._id.toString()))) {
    res.status(403).json({ success: false, message: 'Premium subscription required for this lesson' });
    return;
  }

  res.json({ success: true, data: localizeLesson(lesson, language) });
};

export const getSkillCollections = async (req: Request, res: Response): Promise<void> => {
  const skill = req.params.skill;
  if (skill === 'vocabulary') {
    res.status(410).json({
      success: false,
      message: 'Vocabulary now uses dedicated topic content at /api/vocabulary/topics',
    });
    return;
  }
  if (skill !== 'grammar') {
    res.status(400).json({ success: false, message: 'Skill must be grammar' });
    return;
  }

  const language = await getRequestLanguage(req);
  const lessonType = 'grammar';
  const [courses, lessons] = await Promise.all([
    Course.find({ isPublished: true }).sort({ order: 1 }),
    Lesson.find({ isPublished: true, type: lessonType }).sort({ order: 1 }),
  ]);
  const access = await contentAccess(
    (req as AuthRequest).userId,
    'lesson',
    lessons.map(lesson => lesson._id.toString()),
  );

  const lessonByCourse = new Map<string, (typeof lessons)[number]>();
  lessons.forEach(lesson => {
    if (!lessonByCourse.has(lesson.courseId)) lessonByCourse.set(lesson.courseId, lesson);
  });

  const collections = courses.flatMap(course => {
    const lesson = lessonByCourse.get(course._id.toString());
    if (!lesson) return [];

    const localizedCourse = localizeCourse(course, language);
    const localizedLesson = localizeLesson(lesson, language);
    const grammarPoints = localizedLesson.grammarPoints || [];
    const preview = grammarPoints[0];
    const localizedGrammarSentence = localizedLesson.sentences
      ?.find((sentence: Record<string, any>) => sentence.chinese === preview?.example);
    const isLocked = lesson.isPremium && !access.premium && !access.unlockedIds.has(lesson._id.toString());

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
      previewChinese: preview?.example || '',
      previewPinyin: preview?.examplePinyin || '',
      previewTranslation: localizedGrammarSentence?.english || preview?.exampleTranslation || '',
      explanation: preview?.explanation || '',
      itemCount: grammarPoints.length,
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

  if (lesson.isPremium && !(await hasContentAccess(authReq.userId, 'lesson', lesson._id.toString()))) {
    res.status(403).json({ success: false, message: 'Premium subscription required for this lesson' });
    return;
  }

  const lessonKey = lesson._id.toString();
  const progress = await Progress.findOne({ userId: authReq.userId });
  const alreadyCompleted = progress?.completedLessonIds?.includes(lessonKey) || false;
  const xpEarned = alreadyCompleted ? 0 : lesson.xpReward;
  const timezoneOffset = normalizeTimezoneOffset(req.header('x-timezone-offset'));
  const streak = await recordLearningActivity(
    authReq.userId,
    timezoneOffset,
    new Date(),
    undefined,
    lesson.estimatedMinutes,
  );

  if (streak === null) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  if (xpEarned > 0) {
    await User.findByIdAndUpdate(authReq.userId, { $inc: { xp: xpEarned } });
  }

  const existing = progress?.toObject() as Record<string, any> | undefined;
  const progressSet: Record<string, unknown> = {
    lastLessonId: lessonKey,
    lastUpdated: new Date(),
  };
  if (!alreadyCompleted) {
    progressSet.lastLessonCompletedAt = new Date();
    const skillNames = ['speaking', 'tones', 'vocabulary', 'grammar', 'listening', 'reading'] as const;
    const practicedSkills = new Set<(typeof skillNames)[number]>();
    if ((lesson.vocab || []).length > 0) practicedSkills.add('vocabulary');
    if ((lesson.grammarPoints || []).length > 0) practicedSkills.add('grammar');
    if ((lesson.sentences || []).length > 0) practicedSkills.add('reading');
    if ((lesson.exercises || []).some(item => item.type === 'speak')) practicedSkills.add('speaking');
    if ((lesson.exercises || []).some(item => item.type === 'listen_select')) practicedSkills.add('listening');
    if (lesson.type === 'pronunciation') {
      practicedSkills.add('speaking');
      practicedSkills.add('tones');
      practicedSkills.add('listening');
    }
    if (lesson.type === 'dialogue') {
      practicedSkills.add('speaking');
      practicedSkills.add('listening');
    }
    if (lesson.type === 'listening') practicedSkills.add('listening');
    if (lesson.type === 'grammar') practicedSkills.add('grammar');
    if (lesson.type === 'reading' || lesson.type === 'story' || lesson.type === 'character') practicedSkills.add('reading');

    const scores: Record<(typeof skillNames)[number], number> = {
      speaking: Number(existing?.speaking || 0),
      tones: Number(existing?.tones || 0),
      vocabulary: Number(existing?.vocabulary || 0),
      grammar: Number(existing?.grammar || 0),
      listening: Number(existing?.listening || 0),
      reading: Number(existing?.reading || 0),
    };
    practicedSkills.forEach(skill => {
      scores[skill] = Math.min(100, scores[skill] + (lesson.type === 'quiz' ? 3 : 2));
    });
    skillNames.forEach(skill => { progressSet[skill] = scores[skill]; });
    progressSet.overall = Math.round(skillNames.reduce((sum, skill) => sum + scores[skill], 0) / skillNames.length);

    const weekKey = localWeekKey(new Date(), timezoneOffset);
    const weeklyXp = Array.from(
      { length: 7 },
      (_, index) => existing?.weeklyXpWeek === weekKey ? Number(existing?.weeklyXp?.[index] || 0) : 0,
    );
    const weekday = localWeekdayIndex(new Date(), timezoneOffset);
    weeklyXp[weekday] += xpEarned;
    progressSet.weeklyXp = weeklyXp;
    progressSet.weeklyXpWeek = weekKey;
  }

  await Progress.findOneAndUpdate(
    { userId: authReq.userId },
    {
      ...(alreadyCompleted ? {} : {
        $inc: { wordsLearned: (lesson.vocab || []).length, totalSessions: 1, totalMinutes: lesson.estimatedMinutes },
        $addToSet: { completedLessonIds: lessonKey },
      }),
      $set: progressSet,
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
  const access = await contentAccess(
    (req as AuthRequest).userId,
    'scenario',
    scenarios.map(scenario => scenario._id.toString()),
  );
  res.json({
    success: true,
    data: scenarios.map(scenario => {
      const localized = localizeScenario(scenario, language);
      const unlocked = access.premium || access.unlockedIds.has(scenario._id.toString());
      return scenario.isPremium && !unlocked ? redactPremiumScenario(localized) : { ...localized, isLocked: false };
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
  
  if (scenario.isPremium && !(await hasContentAccess((req as AuthRequest).userId, 'scenario', scenario._id.toString()))) {
    res.status(403).json({ success: false, message: 'Premium subscription required for this scenario' });
    return;
  }

  res.json({ success: true, data: localizeScenario(scenario, language) });
};
