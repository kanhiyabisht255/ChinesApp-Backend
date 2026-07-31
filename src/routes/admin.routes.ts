import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  res.json({ message: 'Admin users endpoint' });
});

router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  res.json({ message: 'Admin stats endpoint' });
});

export default router;