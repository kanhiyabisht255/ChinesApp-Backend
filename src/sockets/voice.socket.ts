import { Server, Socket } from 'socket.io';
import { generateAIResponse, generateSpeech } from '../services/ai.service';

interface VoiceSession {
  userId: string;
  scenarioId?: string;
  context: string[];
  startTime: number;
}

const sessions: Map<string, VoiceSession> = new Map();

export const setupVoiceSocket = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    socket.on('start-call', (data: { userId: string; scenarioId?: string }) => {
      sessions.set(socket.id, {
        userId: data.userId,
        scenarioId: data.scenarioId,
        context: [],
        startTime: Date.now(),
      });
      
      socket.emit('call-started', {
        message: '你好！我是灵，你的中文老师。我们开始吧！',
        sessionId: socket.id,
      });
    });
    
    socket.on('voice-text', async (data: { text: string }) => {
      const session = sessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'No active session' });
        return;
      }
      
      try {
        const aiResponse = await generateAIResponse(
          data.text,
          session.context,
          true
        );
        
        session.context.push(data.text);
        session.context.push(aiResponse.chinese);
        
        const audioBuffer = await generateSpeech(aiResponse.chinese);
        
        socket.emit('ai-response', {
          chinese: aiResponse.chinese,
          pinyin: aiResponse.pinyin,
          english: aiResponse.english,
          audio: audioBuffer.toString('base64'),
        });
      } catch (error) {
        console.error('Voice processing error:', error);
        socket.emit('error', { message: 'Processing failed' });
      }
    });
    
    socket.on('end-call', () => {
      const session = sessions.get(socket.id);
      if (session) {
        const duration = Math.floor((Date.now() - session.startTime) / 1000);
        
        socket.emit('call-ended', {
          duration,
          message: 'Call ended successfully',
        });
        
        sessions.delete(socket.id);
      }
    });
    
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      sessions.delete(socket.id);
    });
  });
};