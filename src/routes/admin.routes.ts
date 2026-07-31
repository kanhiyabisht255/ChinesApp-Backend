import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import {
  adminLogin,
  getDashboardStats,
  getRevenueChart,
  getUsersChart,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserProgress,
  getUserCalls,
  getAllPayments,
  getPaymentStats,
  getAllSubscriptions,
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getAllScenarios,
  createScenario,
  updateScenario,
  deleteScenario,
  getConfig,
  updateConfig,
} from '../controllers/admin.controller';

const router = Router();

router.post('/login', adminLogin);

router.use(authMiddleware, adminMiddleware);

router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/revenue', getRevenueChart);
router.get('/dashboard/users', getUsersChart);

router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/users/:id/progress', getUserProgress);
router.get('/users/:id/calls', getUserCalls);

router.get('/payments', getAllPayments);
router.get('/payments/stats', getPaymentStats);

router.get('/subscriptions', getAllSubscriptions);

router.get('/courses', getAllCourses);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

router.get('/scenarios', getAllScenarios);
router.post('/scenarios', createScenario);
router.put('/scenarios/:id', updateScenario);
router.delete('/scenarios/:id', deleteScenario);

router.get('/config', getConfig);
router.put('/config', updateConfig);

export default router;