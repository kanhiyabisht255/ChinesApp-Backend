import { Router } from 'express';
import {
  createPremiumOrder,
  verifyPayment,
  createGemOrder,
  getPlans,
  getGemPacks,
} from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';

const router = Router();

router.get('/plans', asyncHandler(getPlans));
router.get('/gem-packs', asyncHandler(getGemPacks));

router.post('/premium/order', asyncHandler(authMiddleware), asyncHandler(createPremiumOrder));
router.post('/gems/order', asyncHandler(authMiddleware), asyncHandler(createGemOrder));
router.post('/verify', asyncHandler(authMiddleware), asyncHandler(verifyPayment));

export default router;
