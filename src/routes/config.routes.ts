import { Router } from 'express';
import { getConfig, checkVersion, healthCheck } from '../controllers/config.controller';
import { asyncHandler } from '../middleware/error';

const router = Router();

router.get('/health', asyncHandler(healthCheck));
router.get('/config', asyncHandler(getConfig));
router.get('/version', asyncHandler(checkVersion));

export default router;
