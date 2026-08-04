import { Router } from 'express';
import { asyncHandler } from '../middleware/error';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import {
  completeListeningLesson,
  getListeningLesson,
  getListeningLessons,
} from '../controllers/listening.controller';

const router = Router();

router.get('/lessons', asyncHandler(optionalAuthMiddleware), asyncHandler(getListeningLessons));
router.get('/lessons/:id', asyncHandler(optionalAuthMiddleware), asyncHandler(getListeningLesson));
router.post('/lessons/:id/complete', asyncHandler(authMiddleware), asyncHandler(completeListeningLesson));

export default router;
