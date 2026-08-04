import { Router } from 'express';
import { authMiddleware, rateLimitMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { claimReward, prepareReward } from '../controllers/reward.controller';

const router = Router();
router.use(rateLimitMiddleware(15, 60_000));
router.post('/prepare', asyncHandler(authMiddleware), asyncHandler(prepareReward));
router.post('/claim', asyncHandler(authMiddleware), asyncHandler(claimReward));

export default router;
