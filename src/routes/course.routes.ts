import { Router } from 'express';
import {
  getCourses,
  getCourse,
  getLessons,
  getLesson,
  getSkillCollections,
  completeLesson,
  getScenarios,
  getScenario,
} from '../controllers/course.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';

const router = Router();

router.get('/courses', asyncHandler(optionalAuthMiddleware), asyncHandler(getCourses));
router.get('/courses/:id', asyncHandler(optionalAuthMiddleware), asyncHandler(getCourse));
router.get('/courses/:courseId/lessons', asyncHandler(optionalAuthMiddleware), asyncHandler(getLessons));
router.get('/lessons/:id', asyncHandler(optionalAuthMiddleware), asyncHandler(getLesson));
router.post('/lessons/:lessonId/complete', asyncHandler(authMiddleware), asyncHandler(completeLesson));
router.get('/skills/:skill', asyncHandler(optionalAuthMiddleware), asyncHandler(getSkillCollections));

router.get('/scenarios', asyncHandler(optionalAuthMiddleware), asyncHandler(getScenarios));
router.get('/scenarios/:id', asyncHandler(optionalAuthMiddleware), asyncHandler(getScenario));

export default router;
