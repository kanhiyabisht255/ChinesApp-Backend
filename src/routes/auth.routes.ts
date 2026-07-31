import { Router } from 'express';
import {
  sendOTP,
  verifyOTPAndLogin,
  googleAuth,
  guestLogin,
  getMe,
} from '../controllers/auth.controller';
import { optionalAuthMiddleware } from '../middleware/auth';

const router = Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTPAndLogin);
router.post('/google', googleAuth);
router.post('/guest', guestLogin);
router.get('/me', optionalAuthMiddleware, getMe);

export default router;