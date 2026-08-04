import { Router } from 'express';
import { authMiddleware, adminMiddleware, rateLimitMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import {
  generateAudioStory,
  getGeneratedAudioStories,
  updateGeneratedAudioStory,
} from '../controllers/admin-story-audio.controller';
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
  getAllVocabularyTopics,
  createVocabularyTopic,
  updateVocabularyTopic,
  deleteVocabularyTopic,
  getVocabularyTopicWords,
  createVocabularyWord,
  updateVocabularyWord,
  deleteVocabularyWord,
  getCurriculumStats,
  syncPackagedCurriculum,
  getAllScenarios,
  createScenario,
  updateScenario,
  deleteScenario,
  getAllListeningLessons,
  createListeningLesson,
  updateListeningLesson,
  deleteListeningLesson,
  getConfig,
  updateConfig,
  getIntegrations,
  updateIntegrations,
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
router.get('/vocabulary/topics', asyncHandler(getAllVocabularyTopics));
router.post('/vocabulary/topics', asyncHandler(createVocabularyTopic));
router.put('/vocabulary/topics/:id', asyncHandler(updateVocabularyTopic));
router.delete('/vocabulary/topics/:id', asyncHandler(deleteVocabularyTopic));
router.get('/vocabulary/topics/:topicId/words', asyncHandler(getVocabularyTopicWords));
router.post('/vocabulary/topics/:topicId/words', asyncHandler(createVocabularyWord));
router.put('/vocabulary/words/:id', asyncHandler(updateVocabularyWord));
router.delete('/vocabulary/words/:id', asyncHandler(deleteVocabularyWord));
router.get('/curriculum/stats', asyncHandler(getCurriculumStats));
router.post('/curriculum/sync', asyncHandler(syncPackagedCurriculum));

router.get('/scenarios', asyncHandler(getAllScenarios));
router.post('/scenarios', asyncHandler(createScenario));
router.put('/scenarios/:id', asyncHandler(updateScenario));
router.delete('/scenarios/:id', asyncHandler(deleteScenario));

router.get('/listening', asyncHandler(getAllListeningLessons));
router.post('/listening', asyncHandler(createListeningLesson));
router.put('/listening/:id', asyncHandler(updateListeningLesson));
router.delete('/listening/:id', asyncHandler(deleteListeningLesson));

router.get('/audio-stories', asyncHandler(getGeneratedAudioStories));
router.post('/audio-stories/generate', rateLimitMiddleware(5, 60_000), asyncHandler(generateAudioStory));
router.patch('/audio-stories/:id', asyncHandler(updateGeneratedAudioStory));

router.get('/config', asyncHandler(getConfig));
router.put('/config', asyncHandler(updateConfig));
router.get('/integrations', asyncHandler(getIntegrations));
router.put('/integrations', asyncHandler(updateIntegrations));

export default router;
