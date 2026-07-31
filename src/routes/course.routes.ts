import { Router } from 'express';
import {
  getCourses,
  getCourse,
  getLessons,
  getLesson,
  completeLesson,
  getScenarios,
  getScenario,
} from '../controllers/course.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/courses', getCourses);
router.get('/courses/:id', getCourse);
router.get('/courses/:courseId/lessons', getLessons);
router.get('/lessons/:id', getLesson);
router.post('/lessons/:lessonId/complete', authMiddleware, completeLesson);

router.get('/scenarios', getScenarios);
router.get('/scenarios/:id', getScenario);

export default router;