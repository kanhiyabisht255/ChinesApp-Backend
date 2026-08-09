import { Request, Response } from 'express';
import {
  Course,
  CallSession,
  Lesson,
  ListeningLesson,
  Progress,
  ReadingStory,
  Scenario,
  User,
  UserReadingProgress,
  UserListeningProgress,
  UserVocabularyProgress,
  VocabularyReviewSession,
  VocabularyWord,
} from '../models';
import type { AuthRequest } from '../types';
import { PLACEMENT_QUESTIONS, type PlacementLanguage } from '../content/placement';
import {
  focusTodayPlan,
  scorePlacementAnswers,
  type PlacementAnswer,
  type TodayPlanCandidate,
} from '../services/learning.service';
import {
  getRequestLanguage,
  localizeCourse,
  localizeLesson,
  localizeListeningLesson,
  localizeReadingStory,
  localizeScenario,
} from '../services/localization.service';
import { hasActivePremium } from '../services/entitlement.service';
import { localDayStart, normalizeTimezoneOffset, visibleTodayMinutes } from '../services/streak.service';

const placementLanguage = (language: string): PlacementLanguage =>
  ['en', 'hi', 'es', 'ja'].includes(language) ? language as PlacementLanguage : 'en';

export const getPlacementTest = async (req: Request, res: Response): Promise<void> => {
  const language = placementLanguage(await getRequestLanguage(req));
  res.json({
    success: true,
    data: {
      estimatedMinutes: 6,
      totalQuestions: PLACEMENT_QUESTIONS.length,
      questions: PLACEMENT_QUESTIONS.map(question => ({
        id: question.id,
        hskLevel: question.hskLevel,
        skill: question.skill,
        prompt: question.prompt[language] || question.prompt.en,
        contextChinese: question.contextChinese,
        contextPinyin: question.contextPinyin,
        options: question.options,
      })),
    },
  });
};

export const submitPlacementTest = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  if (!Array.isArray(req.body.answers)) {
    res.status(400).json({ success: false, message: 'Placement answers are required' });
    return;
  }
  const validQuestionIds = new Set(PLACEMENT_QUESTIONS.map(question => question.id));
  const submittedAnswers: unknown[] = req.body.answers;
  const answers: PlacementAnswer[] = submittedAnswers
    .filter((item: unknown): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item: Record<string, unknown>) => ({ questionId: String(item.questionId || ''), answer: String(item.answer || '') }))
    .filter((item: PlacementAnswer) => validQuestionIds.has(item.questionId));
  if (answers.length === 0) {
    res.status(400).json({ success: false, message: 'Answer at least one placement question' });
    return;
  }

  const result = scorePlacementAnswers(answers);
  const user = await User.findByIdAndUpdate(
    authReq.userId,
    {
      $set: {
        hskLevel: result.hskLevel,
        placementScore: result.percentage,
        placementCompletedAt: new Date(),
      },
    },
    { new: true },
  );
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({
    success: true,
    message: `Your recommended starting point is HSK ${result.hskLevel}`,
    data: result,
  });
};

const goalKeywords: Record<string, RegExp> = {
  travel: /travel|transport|direction|hotel|restaurant|shopping/i,
  business: /business|work|office|meeting|professional/i,
  hsk: /hsk|foundation|grammar|vocabulary|exam/i,
  culture: /culture|story|festival|history|reading/i,
};

const readingLevelsFor = (hskLevel: number): string[] => {
  if (hskLevel <= 1) return ['beginner'];
  if (hskLevel === 2) return ['beginner', 'elementary'];
  if (hskLevel <= 4) return ['elementary', 'intermediate', 'beginner'];
  return ['advanced', 'intermediate', 'elementary', 'beginner'];
};

const scenarioLevelsFor = (hskLevel: number): string[] => {
  if (hskLevel <= 1) return ['beginner'];
  if (hskLevel === 2) return ['beginner', 'elementary'];
  if (hskLevel <= 4) return ['elementary', 'intermediate', 'beginner'];
  return ['advanced', 'intermediate', 'elementary', 'beginner'];
};

export const getTodayPlan = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const language = await getRequestLanguage(req);
  const user = await User.findById(authReq.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  const premiumAccess = hasActivePremium(user);
  const timezoneOffset = normalizeTimezoneOffset(req.header('x-timezone-offset'));
  const completedMinutes = visibleTodayMinutes(
    user.todayMinutes,
    user.lastDailyProgressDate,
    new Date(),
    timezoneOffset,
  );
  const progress = await Progress.findOne({ userId: authReq.userId }).lean();
  const completedLessonIds = new Set((progress?.completedLessonIds || []).map(String));

  if (!user.placementCompletedAt) {
    res.json({
      success: true,
      data: {
        placementRequired: true,
        hskLevel: user.hskLevel,
        learningGoal: user.learningGoal || 'general',
        dailyGoalMinutes: user.dailyGoal,
        completedMinutes,
        estimatedMinutes: 6,
        dueReviewCount: 0,
        tasks: [{
          id: 'placement-test',
          type: 'placement',
          title: 'Find your Chinese level',
          subtitle: 'A short adaptive check creates the right learning path for you.',
          chinese: '水平测试',
          estimatedMinutes: 6,
          xpReward: 0,
          isCompleted: false,
          isLocked: false,
        }],
      },
    });
    return;
  }

  const courses = await Course.find({
    isPublished: true,
    hskLevel: { $lte: Math.max(1, user.hskLevel) },
    ...(premiumAccess ? {} : { isPremium: false, accessTier: { $ne: 'premium' } }),
  }).sort({ hskLevel: -1, order: 1 });
  const goalMatcher = goalKeywords[user.learningGoal || 'general'];
  const orderedCourses = goalMatcher
    ? [...courses].sort((a, b) => Number(goalMatcher.test(`${b.category} ${b.title}`)) - Number(goalMatcher.test(`${a.category} ${a.title}`)))
    : courses;
  const courseIds = orderedCourses.map(course => course._id.toString());
  const lessons = courseIds.length > 0
    ? await Lesson.find({
        courseId: { $in: courseIds },
        isPublished: true,
        ...(premiumAccess ? {} : { isPremium: false }),
      }).sort({ order: 1 })
    : [];
  const courseOrder = new Map(courseIds.map((id, index) => [id, index]));
  lessons.sort((a, b) => (courseOrder.get(a.courseId) ?? 9999) - (courseOrder.get(b.courseId) ?? 9999) || a.order - b.order);
  const now = new Date();
  const todayStart = localDayStart(now, timezoneOffset);
  const completedLessonToday = progress?.lastLessonCompletedAt
    && progress.lastLessonCompletedAt >= todayStart
    ? lessons.find(lesson => lesson._id.toString() === progress.lastLessonId)
    : undefined;
  const nextLesson = completedLessonToday
    || lessons.find(lesson => !completedLessonIds.has(lesson._id.toString()));
  const nextCourse = nextLesson ? orderedCourses.find(course => course._id.toString() === nextLesson.courseId) : undefined;

  const dueProgress = await UserVocabularyProgress.find({
    userId: authReq.userId,
    $or: [
      {
        isLearned: true,
        $or: [{ nextReviewAt: { $lte: now } }, { nextReviewAt: { $exists: false } }],
      },
      { isFavorite: true },
    ],
  }).select('wordId').limit(50).lean();
  const actualDueReviewCount = dueProgress.length;
  const newReviewCount = actualDueReviewCount > 0
    ? 0
    : Math.min(5, await VocabularyWord.countDocuments({
      isPublished: true,
      ...(premiumAccess ? {} : { isPremium: false }),
      _id: { $nin: await UserVocabularyProgress.find({ userId: authReq.userId }).distinct('wordId') },
    }));
  const completedReviewSession = await VocabularyReviewSession.findOne({
    userId: authReq.userId,
    completedAt: { $gte: todayStart },
  }).sort({ completedAt: -1 }).lean();
  const completedReviewCreatedAt = (completedReviewSession as unknown as { createdAt?: Date } | null)?.createdAt;
  const completedReviewWordCount = completedReviewSession && completedReviewCreatedAt
    ? await UserVocabularyProgress.countDocuments({
        userId: authReq.userId,
        wordId: { $in: completedReviewSession.wordIds },
        lastReviewedAt: { $gte: completedReviewCreatedAt },
      })
    : 0;
  const reviewWordCount = completedReviewWordCount
    || (actualDueReviewCount > 0 ? actualDueReviewCount : newReviewCount);
  const dueReviewCount = actualDueReviewCount;

  const completedReading = await UserReadingProgress.find({
    userId: authReq.userId,
    isCompleted: true,
  }).select('storyId completedAt').sort({ completedAt: -1 }).lean();
  const completedStoryIds = new Set(completedReading.map(item => item.storyId));
  const readingStories = await ReadingStory.find({
    isPublished: true,
    level: { $in: readingLevelsFor(user.hskLevel) },
    ...(premiumAccess ? {} : { isPremium: false }),
  }).sort({ order: 1 });
  const completedReadingTodayId = completedReading.find(item => item.completedAt && item.completedAt >= todayStart)?.storyId;
  const readingStory = readingStories.find(story => story._id.toString() === completedReadingTodayId)
    || readingStories.find(story => !completedStoryIds.has(story._id.toString()));

  const completedListening = await UserListeningProgress.find({
    userId: authReq.userId,
    isCompleted: true,
  }).select('lessonId completedAt').sort({ completedAt: -1 }).lean();
  const completedListeningIds = new Set(completedListening.map(item => item.lessonId));
  const listeningLessons = await ListeningLesson.find({
    isPublished: true,
    hskLevel: { $lte: Math.max(1, user.hskLevel) },
    level: { $in: readingLevelsFor(user.hskLevel) },
    ...(premiumAccess ? {} : { isPremium: false }),
  }).sort({ order: 1 });
  const completedListeningTodayId = completedListening.find(item => item.completedAt && item.completedAt >= todayStart)?.lessonId;
  const incompleteListening = listeningLessons.filter(item => !completedListeningIds.has(item._id.toString()));
  const goalListening = goalMatcher
    ? incompleteListening.find(item => goalMatcher.test(`${item.category} ${item.title} ${item.description}`))
    : undefined;
  const listeningLesson = listeningLessons.find(item => item._id.toString() === completedListeningTodayId)
    || goalListening
    || incompleteListening[0]
    || undefined;

  const scenarios = await Scenario.find({
    isPublished: true,
    difficulty: { $in: scenarioLevelsFor(user.hskLevel) },
    ...(premiumAccess ? {} : { isPremium: false }),
  }).sort({ order: 1 });
  const completedScenarioSessions = await CallSession.find({
    userId: authReq.userId,
    status: 'completed',
    duration: { $gte: 20 },
    scenarioId: { $exists: true, $ne: null },
  }).select('scenarioId createdAt').sort({ createdAt: -1 }).lean();
  const completedScenarioIds = new Set(completedScenarioSessions.map(item => String(item.scenarioId)));
  const completedScenarioTodayId = completedScenarioSessions.find(item => item.createdAt >= todayStart)?.scenarioId;
  const incompleteScenarios = scenarios.filter(scenario => !completedScenarioIds.has(scenario._id.toString()));
  const goalScenario = goalMatcher
    ? incompleteScenarios.find(scenario => goalMatcher.test(`${scenario.title} ${scenario.description}`))
    : undefined;
  const scenario = scenarios.find(item => item._id.toString() === completedScenarioTodayId)
    || goalScenario
    || incompleteScenarios[0]
    || scenarios[0];

  const candidateTasks: TodayPlanCandidate[] = [];
  if (nextLesson && nextCourse) {
    const lesson = localizeLesson(nextLesson, language);
    const course = localizeCourse(nextCourse, language);
    candidateTasks.push({
      id: `lesson-${nextLesson._id}`,
      type: 'lesson',
      contentId: nextLesson._id.toString(),
      title: lesson.title,
      subtitle: `${course.title} · HSK ${nextCourse.hskLevel}`,
      chinese: nextLesson.titleCn,
      estimatedMinutes: nextLesson.estimatedMinutes,
      xpReward: nextLesson.xpReward,
      isCompleted: Boolean(completedLessonToday),
      isLocked: false,
    });
  }
  if (reviewWordCount > 0) {
    candidateTasks.push({
      id: 'vocabulary-review',
      type: 'review',
      title: completedReviewSession
        ? 'Today’s review complete'
        : actualDueReviewCount > 0 ? 'Review due words' : 'Learn new words',
      subtitle: completedReviewSession
        ? `${reviewWordCount} ${reviewWordCount === 1 ? 'word' : 'words'} practiced today`
        : actualDueReviewCount > 0
          ? `${reviewWordCount} ${reviewWordCount === 1 ? 'word' : 'words'} ready for active recall`
          : `${reviewWordCount} new ${reviewWordCount === 1 ? 'word' : 'words'} to start your review habit`,
      chinese: '今日复习',
      estimatedMinutes: Math.max(3, Math.min(8, reviewWordCount)),
      xpReward: completedReviewSession ? 0 : Math.min(20, reviewWordCount * 2),
      isCompleted: Boolean(completedReviewSession),
      isLocked: false,
      isNew: !completedReviewSession && actualDueReviewCount === 0,
    });
  }
  if (listeningLesson) {
    const listening = localizeListeningLesson(listeningLesson, language);
    candidateTasks.push({
      id: `listening-${listeningLesson._id}`,
      type: 'listening',
      contentId: listeningLesson._id.toString(),
      title: listening.title,
      subtitle: `HSK ${listeningLesson.hskLevel} · Guided listening practice`,
      chinese: listeningLesson.titleCn,
      estimatedMinutes: listeningLesson.estimatedMinutes,
      xpReward: listeningLesson.xpReward,
      isCompleted: listeningLesson._id.toString() === completedListeningTodayId,
      isLocked: false,
    });
  }
  if (readingStory) {
    const story = localizeReadingStory(readingStory, language);
    candidateTasks.push({
      id: `reading-${readingStory._id}`,
      type: 'reading',
      contentId: readingStory._id.toString(),
      title: story.title,
      subtitle: `${readingStory.level} graded story`,
      chinese: readingStory.titleCn,
      estimatedMinutes: readingStory.estimatedMinutes,
      xpReward: 25,
      isCompleted: readingStory._id.toString() === completedReadingTodayId,
      isLocked: false,
    });
  }
  if (scenario) {
    const localizedScenario = localizeScenario(scenario, language);
    candidateTasks.push({
      id: `speaking-${scenario._id}`,
      type: 'speaking',
      contentId: scenario._id.toString(),
      title: localizedScenario.title,
      subtitle: 'Guided AI conversation practice',
      chinese: scenario.titleCn,
      estimatedMinutes: scenario.estimatedMinutes,
      xpReward: 20,
      isCompleted: scenario._id.toString() === completedScenarioTodayId,
      isLocked: false,
    });
  }

  const bonusTypeOrder = user.learningGoal === 'culture'
    ? ['reading', 'listening', 'speaking']
    : ['listening', 'speaking', 'reading'];
  const { tasks, additionalTasks } = focusTodayPlan(candidateTasks, bonusTypeOrder);

  res.json({
    success: true,
    data: {
      placementRequired: false,
      hskLevel: user.hskLevel,
      learningGoal: user.learningGoal || 'general',
      dailyGoalMinutes: user.dailyGoal,
      completedMinutes,
      estimatedMinutes: tasks.reduce(
        (sum, task) => sum + (task.isCompleted ? 0 : Number(task.estimatedMinutes || 0)),
        0,
      ),
      dueReviewCount,
      tasks,
      additionalTasks,
    },
  });
};
