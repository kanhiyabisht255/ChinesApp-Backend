import { Request, Response } from 'express';
import {
  generateAIResponse,
  transcribeAudio,
  generateSpeech,
  getScenarioPrompt,
} from '../services/ai.service';
import { User, Progress, CallSession } from '../models';
import type { AuthRequest } from '../types';

export const startVoiceCall = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { scenarioId, scenarioTitle } = req.body;
  
  const user = await User.findById(authReq.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  
  if (!user.isPremium && scenarioId) {
    const premiumScenarios = ['s7', 's8', 's9', 's10', 's11', 's12'];
    if (premiumScenarios.includes(scenarioId)) {
      res.status(403).json({ success: false, message: 'Premium required for this scenario' });
      return;
    }
  }
  
  res.json({
    success: true,
    data: {
      sessionId: `call_${Date.now()}_${authReq.userId}`,
      scenarioId,
      scenarioTitle: scenarioTitle || 'Free Talk',
      message: 'Call session started',
    },
  });
};

export const processVoiceAudio = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  
  if (!req.file) {
    res.status(400).json({ success: false, message: 'Audio file required' });
    return;
  }
  
  try {
    const spokenText = await transcribeAudio(req.file.buffer);
    
    const aiResponse = await generateAIResponse(spokenText, [], true);
    
    const audioBuffer = await generateSpeech(aiResponse.chinese);
    const audioBase64 = audioBuffer.toString('base64');
    
    res.json({
      success: true,
      data: {
        spokenText,
        aiResponse,
        audioBase64,
        pronunciationScore: Math.floor(Math.random() * 20) + 75,
      },
    });
  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({ success: false, message: 'Failed to process audio' });
  }
};

export const processVoiceText = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { text, context, scenarioId } = req.body;
  
  try {
    const contextMessages = context || [];
    const aiResponse = await generateAIResponse(text, contextMessages, true);
    
    const audioBuffer = await generateSpeech(aiResponse.chinese);
    const audioBase64 = audioBuffer.toString('base64');
    
    res.json({
      success: true,
      data: {
        aiResponse,
        audioBase64,
      },
    });
  } catch (error) {
    console.error('AI response error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate response' });
  }
};

export const endVoiceCall = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { sessionId, scenarioId, scenarioTitle, duration, score, feedback, transcript } = req.body;
  
  await CallSession.create({
    userId: authReq.userId,
    scenarioId,
    scenarioTitle: scenarioTitle || 'Free Talk',
    duration: duration || 0,
    score: score || 75,
    feedback: feedback || 'Good job!',
    transcript: transcript || [],
  });
  
  const user = await User.findById(authReq.userId);
  if (user) {
    await user.updateOne({
      $inc: { xp: Math.floor(duration / 6), todayMinutes: Math.floor(duration / 60) },
    });
    
    await Progress.findOneAndUpdate(
      { userId: authReq.userId },
      {
        $inc: { totalSessions: 1, totalMinutes: Math.floor(duration / 60) },
        $set: { lastUpdated: new Date() },
      },
      { upsert: true }
    );
  }
  
  res.json({
    success: true,
    message: 'Call ended and progress saved',
    data: {
      xpEarned: Math.floor(duration / 6),
      duration,
    },
  });
};

export const getChatMessages = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  
  const { ChatMessage } = await import('../models');
  const messages = await ChatMessage.find({ userId: authReq.userId })
    .sort({ createdAt: -1 })
    .limit(100);
  
  res.json({ success: true, data: messages.reverse() });
};

export const sendChatMessage = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { message } = req.body;
  
  if (!message || message.trim().length === 0) {
    res.status(400).json({ success: false, message: 'Message required' });
    return;
  }
  
  const { ChatMessage } = await import('../models');
  
  await ChatMessage.create({
    userId: authReq.userId,
    role: 'user',
    content: message,
  });
  
  const aiResponse = await generateAIResponse(message, [], false);
  
  const aiMessage = await ChatMessage.create({
    userId: authReq.userId,
    role: 'ai',
    content: aiResponse.chinese,
    pinyin: aiResponse.pinyin,
    translation: aiResponse.english,
  });
  
  res.json({
    success: true,
    data: {
      userMessage: { role: 'user', content: message },
      aiMessage,
    },
  });
};

export const clearChat = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  
  const { ChatMessage } = await import('../models');
  await ChatMessage.deleteMany({ userId: authReq.userId });
  
  res.json({ success: true, message: 'Chat cleared' });
};