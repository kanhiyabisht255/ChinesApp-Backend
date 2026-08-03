import { Router } from 'express';
import { asyncHandler } from '../middleware/error';
import { authMiddleware } from '../middleware/auth';
import { getPlacementTest, getTodayPlan, submitPlacementTest } from '../controllers/learning.controller';

const router = Router();

router.use(asyncHandler(authMiddleware));
router.get('/placement', asyncHandler(getPlacementTest));
router.post('/placement', asyncHandler(submitPlacementTest));
router.get('/today', asyncHandler(getTodayPlan));

export default router;
