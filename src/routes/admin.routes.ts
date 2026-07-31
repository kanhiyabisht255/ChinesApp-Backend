import { Router } from 'express';
import { authMiddleware, adminMiddleware, rateLimitMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
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
  getCourseLessons,
  createCourseLesson,
  updateCourseLesson,
  deleteCourseLesson,
  getAllScenarios,
  createScenario,
  updateScenario,
  deleteScenario,
  getConfig,
  updateConfig,
} from '../controllers/admin.controller';

const router = Router();

router.post('/login', rateLimitMiddleware(5, 15 * 60_000), asyncHandler(adminLogin));

router.use(asyncHandler(authMiddleware), asyncHandler(adminMiddleware));

router.get('/dashboard/stats', asyncHandler(getDashboardStats));
router.get('/dashboard/revenue', asyncHandler(getRevenueChart));
router.get('/dashboard/users', asyncHandler(getUsersChart));

router.get('/users', asyncHandler(getAllUsers));
router.get('/users/:id', asyncHandler(getUser));
router.put('/users/:id', asyncHandler(updateUser));
router.delete('/users/:id', asyncHandler(deleteUser));
router.get('/users/:id/progress', asyncHandler(getUserProgress));
router.get('/users/:id/calls', asyncHandler(getUserCalls));

router.get('/payments', asyncHandler(getAllPayments));
router.get('/payments/stats', asyncHandler(getPaymentStats));

router.get('/subscriptions', asyncHandler(getAllSubscriptions));

router.get('/courses', asyncHandler(getAllCourses));
router.post('/courses', asyncHandler(createCourse));
router.put('/courses/:id', asyncHandler(updateCourse));
router.delete('/courses/:id', asyncHandler(deleteCourse));
router.get('/courses/:courseId/lessons', asyncHandler(getCourseLessons));
router.post('/courses/:courseId/lessons', asyncHandler(createCourseLesson));
router.put('/lessons/:id', asyncHandler(updateCourseLesson));
router.delete('/lessons/:id', asyncHandler(deleteCourseLesson));

router.get('/scenarios', asyncHandler(getAllScenarios));
router.post('/scenarios', asyncHandler(createScenario));
router.put('/scenarios/:id', asyncHandler(updateScenario));
router.delete('/scenarios/:id', asyncHandler(deleteScenario));

router.get('/config', asyncHandler(getConfig));
router.put('/config', asyncHandler(updateConfig));

export default router;
