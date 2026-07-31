import { Router } from 'express';
import {
  sendOTP,
  verifyOTPAndLogin,
  googleAuth,
  guestLogin,
  getMe,
} from '../controllers/auth.controller';
import { optionalAuthMiddleware, rateLimitMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';

const router = Router();

router.post('/send-otp', rateLimitMiddleware(5, 10 * 60_000), asyncHandler(sendOTP));
router.post('/verify-otp', rateLimitMiddleware(10, 10 * 60_000), asyncHandler(verifyOTPAndLogin));
router.post('/google', rateLimitMiddleware(10, 10 * 60_000), asyncHandler(googleAuth));
router.post('/guest', rateLimitMiddleware(10, 60 * 60_000), asyncHandler(guestLogin));
router.get('/me', asyncHandler(optionalAuthMiddleware), asyncHandler(getMe));

export default router;
