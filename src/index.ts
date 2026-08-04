import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { connectDB } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/error';
import { checkMaintenance, rateLimitMiddleware } from './middleware/auth';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import aiRoutes from './routes/ai.routes';
import courseRoutes from './routes/course.routes';
import paymentRoutes from './routes/payment.routes';
import configRoutes from './routes/config.routes';
import adminRoutes from './routes/admin.routes';
import toneRoutes from './routes/tone.routes';
import dictionaryRoutes from './routes/dictionary.routes';
import vocabularyRoutes from './routes/vocabulary.routes';
import readingRoutes from './routes/reading.routes';
import learningRoutes from './routes/learning.routes';
import listeningRoutes from './routes/listening.routes';
import { setupVoiceSocket } from './sockets/voice.socket';
import { validateEnvironment } from './config/environment';
import { syncVocabulary } from './services/vocabulary.service';
import { syncListeningLessons, syncReadingStories } from './services/curriculum.service';

const app = express();
app.set('trust proxy', 1);
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(origin => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);
const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, '');
  if (allowedOrigins.includes(normalized)) return true;
  return process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized);
};
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : process.env.NODE_ENV !== 'production',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

app.set('io', io);

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) callback(null, true);
    else callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(checkMaintenance);
app.use('/api/', rateLimitMiddleware(100));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', courseRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api', configRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tones', toneRoutes);
app.use('/api/dictionary', dictionaryRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/reading', readingRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/listening', listeningRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'ChinesApp Backend API',
    version: process.env.APP_VERSION || '1.0.0',
    endpoints: {
      auth: '/api/auth',
      user: '/api/user',
      voice: '/api/ai/voice',
      chat: '/api/ai/chat',
      courses: '/api/courses',
      scenarios: '/api/scenarios',
      reading: '/api/reading/stories',
      listening: '/api/listening/lessons',
      todayPlan: '/api/learning/today',
      payment: '/api/payment',
      tones: '/api/tones',
      dictionary: '/api/dictionary/lookup?q=中国',
      vocabulary: '/api/vocabulary/topics',
      health: '/api/health',
    },
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

setupVoiceSocket(io);

const startServer = async (): Promise<void> => {
  try {
    validateEnvironment();
    await connectDB();
    if (process.env.AUTO_SYNC_VOCABULARY !== 'false') {
      const vocabulary = await syncVocabulary();
      console.log(`📖 Vocabulary ready: ${vocabulary.topics} topics, ${vocabulary.words} unique words`);
    }
    const reading = await syncReadingStories();
    console.log(`📚 Reading library ready: ${reading.stories} stories`);
    const listening = await syncListeningLessons();
    console.log(`🎧 Listening library ready: ${listening.listeningLessons} lessons`);
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}`);
      console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  const { disconnectDB } = await import('./config/database');
  await disconnectDB();
  httpServer.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down...');
  const { disconnectDB } = await import('./config/database');
  await disconnectDB();
  httpServer.close();
  process.exit(0);
});

startServer();

export { app, io };
