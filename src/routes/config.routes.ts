import { Router } from 'express';
import { getConfig, checkVersion, healthCheck } from '../controllers/config.controller';
import { asyncHandler } from '../middleware/error';
import { optionalAuthMiddleware, rateLimitMiddleware } from '../middleware/auth';
import { recordAnalyticsEvents } from '../controllers/analytics.controller';

const router = Router();

router.get('/health', asyncHandler(healthCheck));
router.get('/config', asyncHandler(getConfig));
router.get('/version', asyncHandler(checkVersion));
router.post('/analytics/events', rateLimitMiddleware(30, 60_000), optionalAuthMiddleware, asyncHandler(recordAnalyticsEvents));

export default router;
