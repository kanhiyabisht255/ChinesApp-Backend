import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import {
  getVocabularyTopic,
  getVocabularyTopics,
  getVocabularyWord,
  updateVocabularyProgress,
} from '../controllers/vocabulary.controller';

const router = Router();

router.get('/topics', asyncHandler(optionalAuthMiddleware), asyncHandler(getVocabularyTopics));
router.get('/topics/:id', asyncHandler(optionalAuthMiddleware), asyncHandler(getVocabularyTopic));
router.get('/words/:id', asyncHandler(optionalAuthMiddleware), asyncHandler(getVocabularyWord));
router.put('/words/:id/progress', asyncHandler(authMiddleware), asyncHandler(updateVocabularyProgress));

export default router;
