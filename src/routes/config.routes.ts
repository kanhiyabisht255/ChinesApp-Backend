import { Router } from 'express';
import { getConfig, checkVersion, healthCheck } from '../controllers/config.controller';

const router = Router();

router.get('/health', healthCheck);
router.get('/config', getConfig);
router.get('/version', checkVersion);

export default router;