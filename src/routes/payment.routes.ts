import { Router } from 'express';
import {
  createPremiumOrder,
  verifyPayment,
  createGemOrder,
  getPlans,
  getGemPacks,
  handleRazorpayWebhook,
  handleStripeWebhook,
} from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/plans', getPlans);
router.get('/gem-packs', getGemPacks);

router.post('/premium/order', authMiddleware, createPremiumOrder);
router.post('/gems/order', authMiddleware, createGemOrder);
router.post('/verify', authMiddleware, verifyPayment);

router.post('/webhook/razorpay', handleRazorpayWebhook);
router.post('/webhook/stripe', handleStripeWebhook);

export default router;