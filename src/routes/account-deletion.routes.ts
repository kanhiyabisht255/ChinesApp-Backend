import { Router } from 'express';
import {
  confirmAccountDeletion,
  requestAccountDeletion,
} from '../controllers/account-deletion.controller';
import { rateLimitMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';

const router = Router();

router.post('/request', rateLimitMiddleware(3, 15 * 60_000), asyncHandler(requestAccountDeletion));
router.post('/confirm', rateLimitMiddleware(10, 15 * 60_000), asyncHandler(confirmAccountDeletion));

export default router;
