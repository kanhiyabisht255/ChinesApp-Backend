import { Router } from 'express';
import { asyncHandler } from '../middleware/error';
import { optionalAuthMiddleware } from '../middleware/auth';
import { getReadingStories, getReadingStory } from '../controllers/reading.controller';

const router = Router();

router.get('/stories', asyncHandler(optionalAuthMiddleware), asyncHandler(getReadingStories));
router.get('/stories/:id', asyncHandler(optionalAuthMiddleware), asyncHandler(getReadingStory));

export default router;
