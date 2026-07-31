import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getProgress,
  updateProgress,
  updateStreak,
  getGems,
  spendGems,
  getCallHistory,
  logout,
} from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';

const router = Router();

router.get('/profile', asyncHandler(authMiddleware), asyncHandler(getProfile));
router.put('/profile', asyncHandler(authMiddleware), asyncHandler(updateProfile));
router.get('/progress', asyncHandler(authMiddleware), asyncHandler(getProgress));
router.put('/progress', asyncHandler(authMiddleware), asyncHandler(updateProgress));
router.post('/streak', asyncHandler(authMiddleware), asyncHandler(updateStreak));
router.get('/gems', asyncHandler(authMiddleware), asyncHandler(getGems));
router.post('/gems/spend', asyncHandler(authMiddleware), asyncHandler(spendGems));
router.get('/calls', asyncHandler(authMiddleware), asyncHandler(getCallHistory));
router.post('/logout', asyncHandler(authMiddleware), asyncHandler(logout));

export default router;
