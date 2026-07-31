import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getProgress,
  updateProgress,
  addXp,
  updateStreak,
  getGems,
  addGems,
  spendGems,
  getCallHistory,
  logout,
} from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.get('/progress', authMiddleware, getProgress);
router.put('/progress', authMiddleware, updateProgress);
router.post('/xp', authMiddleware, addXp);
router.post('/streak', authMiddleware, updateStreak);
router.get('/gems', authMiddleware, getGems);
router.post('/gems/add', authMiddleware, addGems);
router.post('/gems/spend', authMiddleware, spendGems);
router.get('/calls', authMiddleware, getCallHistory);
router.post('/logout', authMiddleware, logout);

export default router;