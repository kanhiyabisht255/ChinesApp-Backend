import { Router } from 'express';
import { lookupWord } from '../controllers/dictionary.controller';
import { asyncHandler } from '../middleware/error';
import { optionalAuthMiddleware } from '../middleware/auth';

const router = Router();

router.get('/lookup', asyncHandler(optionalAuthMiddleware), asyncHandler(lookupWord));

export default router;
