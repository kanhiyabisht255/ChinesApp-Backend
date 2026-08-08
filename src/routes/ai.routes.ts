import { Router } from 'express';
import multer from 'multer';
import {
  startVoiceCall,
  processVoiceAudio,
  processVoiceText,
  processVoiceAction,
  endVoiceCall,
  getChatMessages,
  sendChatMessage,
  clearChat,
  getChatReport,
  getMistakeMemory,
  getAiUsageSummary,
  createRealtimeToken,
  finishRealtimeSession,
} from '../controllers/ai.controller';
import { authMiddleware, rateLimitMiddleware } from '../middleware/auth';
import { getAppConfig } from '../services/config.service';
import { asyncHandler } from '../middleware/error';
import type { Request, Response, NextFunction } from 'express';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});

router.use(rateLimitMiddleware(30, 60_000));

const requireFeature = (feature: 'voiceCallEnabled' | 'chatEnabled') =>
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    const config = await getAppConfig();
    if (!config.features[feature]) {
      res.status(503).json({ success: false, message: 'This AI feature is temporarily unavailable' });
      return;
    }
    next();
  };

const feature = (name: 'voiceCallEnabled' | 'chatEnabled') => asyncHandler(requireFeature(name));
const auth = asyncHandler(authMiddleware);

router.post('/voice/start', auth, feature('voiceCallEnabled'), asyncHandler(startVoiceCall));
router.post('/voice/audio', auth, feature('voiceCallEnabled'), upload.single('audio'), asyncHandler(processVoiceAudio));
router.post('/voice/text', auth, feature('voiceCallEnabled'), asyncHandler(processVoiceText));
router.post('/voice/action', auth, feature('voiceCallEnabled'), asyncHandler(processVoiceAction));
router.post('/voice/end', auth, feature('voiceCallEnabled'), asyncHandler(endVoiceCall));
router.get('/usage', auth, asyncHandler(getAiUsageSummary));
router.post('/realtime/token', auth, feature('voiceCallEnabled'), asyncHandler(createRealtimeToken));
router.post('/realtime/finish', auth, feature('voiceCallEnabled'), asyncHandler(finishRealtimeSession));

router.get('/chat', auth, feature('chatEnabled'), asyncHandler(getChatMessages));
router.post('/chat', auth, feature('chatEnabled'), asyncHandler(sendChatMessage));
router.delete('/chat', auth, feature('chatEnabled'), asyncHandler(clearChat));
router.get('/chat/report', auth, feature('chatEnabled'), asyncHandler(getChatReport));
router.get('/mistakes', auth, asyncHandler(getMistakeMemory));

export default router;
