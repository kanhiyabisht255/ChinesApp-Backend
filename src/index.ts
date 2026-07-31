import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

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
import { setupVoiceSocket } from './sockets/voice.socket';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

app.set('io', io);

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
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
      payment: '/api/payment',
      health: '/api/health',
    },
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

setupVoiceSocket(io);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    
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