import { Router } from 'express';
import {
  registerWithEmail,
  resendEmailVerification,
  verifyEmailAndLogin,
  loginWithEmail,
  googleAuth,
  getMe,
  requestPasswordReset,
  resetPassword,
} from '../controllers/auth.controller';
import { authMiddleware, rateLimitMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';

const router = Router();

router.post('/email/register', rateLimitMiddleware(5, 10 * 60_000), asyncHandler(registerWithEmail));
router.post('/email/resend', rateLimitMiddleware(5, 10 * 60_000), asyncHandler(resendEmailVerification));
router.post('/email/verify', rateLimitMiddleware(10, 10 * 60_000), asyncHandler(verifyEmailAndLogin));
router.post('/email/login', rateLimitMiddleware(10, 10 * 60_000), asyncHandler(loginWithEmail));
router.post('/google', rateLimitMiddleware(10, 10 * 60_000), asyncHandler(googleAuth));
router.post('/password/forgot', rateLimitMiddleware(5, 10 * 60_000), asyncHandler(requestPasswordReset));
router.post('/password/reset', rateLimitMiddleware(5, 10 * 60_000), asyncHandler(resetPassword));
router.get('/me', asyncHandler(authMiddleware), asyncHandler(getMe));

export default router;
