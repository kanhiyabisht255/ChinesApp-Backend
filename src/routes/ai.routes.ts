import { Router } from 'express';
import multer from 'multer';
import {
  startVoiceCall,
  processVoiceAudio,
  processVoiceText,
  endVoiceCall,
  getChatMessages,
  sendChatMessage,
  clearChat,
} from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/voice/start', authMiddleware, startVoiceCall);
router.post('/voice/audio', authMiddleware, upload.single('audio'), processVoiceAudio);
router.post('/voice/text', authMiddleware, processVoiceText);
router.post('/voice/end', authMiddleware, endVoiceCall);

router.get('/chat', authMiddleware, getChatMessages);
router.post('/chat', authMiddleware, sendChatMessage);
router.delete('/chat', authMiddleware, clearChat);

export default router;