import { Router } from 'express';
import { asyncHandler } from '../middleware/error';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { completeReadingStory, getReadingStories, getReadingStory } from '../controllers/reading.controller';

const router = Router();

router.get('/stories', asyncHandler(optionalAuthMiddleware), asyncHandler(getReadingStories));
router.get('/stories/:id', asyncHandler(optionalAuthMiddleware), asyncHandler(getReadingStory));
router.post('/stories/:id/complete', asyncHandler(authMiddleware), asyncHandler(completeReadingStory));

export default router;
