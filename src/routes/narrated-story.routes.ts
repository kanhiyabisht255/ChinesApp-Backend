import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware, rateLimitMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import {
  getNarratedStories,
  getNarratedStory,
  saveNarratedStoryProgress,
} from '../controllers/narrated-story.controller';

const router = Router();
router.use(rateLimitMiddleware(60, 60_000));
router.get('/', asyncHandler(optionalAuthMiddleware), asyncHandler(getNarratedStories));
router.get('/:id', asyncHandler(optionalAuthMiddleware), asyncHandler(getNarratedStory));
router.put('/:id/progress', asyncHandler(authMiddleware), asyncHandler(saveNarratedStoryProgress));

export default router;
