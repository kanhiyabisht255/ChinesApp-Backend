import { Request, Response } from 'express';
import {
  AIServiceError,
  analyzePronunciation,
  generateAIResponse,
  transcribeAudio,
  generateSpeech,
} from '../services/ai.service';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import { User, Progress, CallSession, Scenario } from '../models';
import type { AuthRequest, ITranscriptItem } from '../types';
import { consumeAiQuota, hasActivePremium, refundAiQuota } from '../services/entitlement.service';
import { localWeekdayIndex, localWeekKey, normalizeTimezoneOffset, recordLearningActivity } from '../services/streak.service';
import { buildVoiceCallContext, buildVoiceCallReport, type VoiceCallReport } from '../services/voice-session.service';
import { hasContentAccess } from '../services/reward.service';

const sendAIError = (res: Response, error: unknown, fallbackMessage: string): void => {
  if (error instanceof AIServiceError) {
    res.status(error.statusCode).json({ success: false, message: error.message, code: error.code });
    return;
  }
  res.status(500).json({ success: false, message: fallbackMessage });
};

const findScenario = async (value?: string) => {
  if (!value) return null;
  return Scenario.findOne(
    mongoose.isValidObjectId(value)
      ? { $or: [{ _id: value }, { slug: value }] }
      : { slug: value }
  );
};

const buildTutorOptions = async (userId?: string, scenarioId?: string) => {
  const [user, scenario] = await Promise.all([
    userId ? User.findById(userId) : null,
    findScenario(scenarioId),
  ]);
  return {
    user,
    scenario,
    options: {
      nativeLanguage: user?.nativeLanguage || 'en',
      hskLevel: user?.hskLevel || 1,
      learningGoal: user?.learningGoal || 'general',
      scenarioPrompt: scenario?.systemPrompt,
    },
  };
};

const activeVoiceCall = async (userId: string | undefined, sessionId: unknown) => {
  if (!userId || typeof sessionId !== 'string' || !sessionId.startsWith('call_')) return null;
  return CallSession.findOne({ userId, sessionId, status: 'started' });
};

export const startVoiceCall = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { scenarioId, scenarioTitle } = req.body;
  try {
    const user = await User.findById(authReq.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const scenario = await findScenario(scenarioId);
    if (scenarioId && !scenario) {
      res.status(404).json({ success: false, message: 'Scenario not found' });
      return;
    }
    const activePremium = hasActivePremium(user);
    const scenarioAccess = !scenario?.isPremium || activePremium || await hasContentAccess(
      authReq.userId,
      'scenario',
      scenario._id.toString(),
    );
    if (!scenarioAccess) {
      res.status(403).json({ success: false, message: 'Premium required for this scenario' });
      return;
    }
    const quota = await consumeAiQuota(authReq.userId, 'voiceCalls', activePremium);
    if (!quota.allowed) {
      res.status(429).json({ success: false, message: 'Daily free AI call limit reached. Upgrade to Premium for unlimited speaking practice.' });
      return;
    }

    try {
      const tutor = await buildTutorOptions(authReq.userId, scenarioId);
      const openingPrompt = scenario
        ? 'Start the role-play now. Greet the learner naturally in character and ask one short question.'
        : 'Start a friendly Mandarin practice call. Greet the learner and ask what they would like to talk about.';
      const aiResponse = await generateAIResponse(openingPrompt, [], { ...tutor.options, isVoiceCall: true });
      let audioBase64: string | undefined;
      try {
        audioBase64 = (await generateSpeech(aiResponse.chinese)).toString('base64');
      } catch (ttsError) {
        console.error('TTS unavailable for call opening, returning text response:', ttsError);
      }

      const sessionId = `call_${randomUUID()}`;
      await CallSession.create({
        sessionId,
        userId: authReq.userId,
        scenarioId: scenario?._id.toString(),
        scenarioTitle: scenario?.title || (typeof scenarioTitle === 'string' ? scenarioTitle.slice(0, 100) : 'Free Talk'),
        status: 'started',
        duration: 0,
        score: 0,
        feedback: 'Call in progress',
        transcript: [{
          role: 'ai',
          chinese: aiResponse.chinese,
          pinyin: aiResponse.pinyin,
          english: aiResponse.english,
          correction: aiResponse.correction,
          feedback: aiResponse.feedback,
          timestamp: Date.now(),
        }],
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      });

      res.json({
        success: true,
        data: {
          sessionId,
          scenarioId: scenario?._id.toString(),
          scenarioTitle: scenario?.title || scenarioTitle || 'Free Talk',
          message: 'Call session started',
          aiResponse,
          audioBase64,
          quota,
        },
      });
    } catch (error) {
      await refundAiQuota(authReq.userId, 'voiceCalls', activePremium).catch(refundError => {
        console.error('Failed to refund voice-call quota:', refundError);
      });
      throw error;
    }
  } catch (error) {
    console.error('Start voice call error:', error);
    sendAIError(res, error, 'Unable to start the AI call');
  }
};

export const processVoiceAudio = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  
  if (!req.file) {
    res.status(400).json({ success: false, message: 'Audio file required' });
    return;
  }
  
  let quotaConsumed = false;
  let premiumUser = false;
  try {
    const { expectedChinese, scenarioId, sessionId } = req.body;
    const activeCall = await activeVoiceCall(authReq.userId, sessionId);
    if (sessionId && !activeCall) {
      res.status(409).json({ success: false, message: 'Voice session is not active. Start a new call.' });
      return;
    }
    let contextMessages: string[] = [];
    if (typeof req.body.context === 'string') {
      try {
        const parsed = JSON.parse(req.body.context);
        if (Array.isArray(parsed)) contextMessages = parsed.filter(item => typeof item === 'string').slice(-12);
      } catch {
        contextMessages = [];
      }
    }
    const sessionScenarioId = activeCall?.scenarioId || scenarioId;
    if (activeCall?.transcript?.length) {
      contextMessages = buildVoiceCallContext(activeCall.transcript);
    }
    const tutor = await buildTutorOptions(authReq.userId, sessionScenarioId);
    premiumUser = hasActivePremium(tutor.user);
    const quota = await consumeAiQuota(authReq.userId, 'voiceTurns', premiumUser);
    if (!quota.allowed) {
      res.status(429).json({ success: false, message: 'Daily free speaking-turn limit reached. Upgrade to Premium for unlimited AI practice.' });
      return;
    }
    quotaConsumed = true;
    const spokenText = await transcribeAudio(
      req.file.buffer,
      tutor.options,
      req.file.originalname || 'practice.m4a',
      req.file.mimetype || 'audio/mp4'
    );
    const aiResponse = await generateAIResponse(spokenText, contextMessages, { ...tutor.options, isVoiceCall: true });
    let audioBase64: string | undefined;
    try {
      audioBase64 = (await generateSpeech(aiResponse.chinese)).toString('base64');
    } catch (ttsError) {
      console.error('TTS unavailable, returning text response:', ttsError);
    }
    const pronunciation = expectedChinese
      ? analyzePronunciation(expectedChinese, spokenText)
      : undefined;
    if (activeCall) {
      await CallSession.updateOne(
        { _id: activeCall._id, status: 'started' },
        {
          $push: {
            transcript: {
              $each: [
                {
                  role: 'user',
                  chinese: spokenText,
                  pinyin: '',
                  english: '',
                  pronunciationScore: pronunciation?.score,
                  feedback: pronunciation?.feedback,
                  timestamp: Date.now(),
                },
                {
                  role: 'ai',
                  chinese: aiResponse.chinese,
                  pinyin: aiResponse.pinyin,
                  english: aiResponse.english,
                  correction: aiResponse.correction,
                  feedback: aiResponse.feedback,
                  timestamp: Date.now(),
                },
              ],
            },
          },
        },
      );
    }
    
    res.json({
      success: true,
      data: {
        spokenText,
        aiResponse,
        audioBase64,
        pronunciationScore: pronunciation?.score,
        pronunciationFeedback: pronunciation?.feedback,
        quota,
      },
    });
  } catch (error) {
    console.error('Voice processing error:', error);
    if (quotaConsumed) {
      await refundAiQuota(authReq.userId, 'voiceTurns', premiumUser).catch(refundError => {
        console.error('Failed to refund voice-turn quota:', refundError);
      });
    }
    sendAIError(res, error, 'Failed to process audio');
  }
};

export const processVoiceText = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { text, context, scenarioId } = req.body;
  
  let quotaConsumed = false;
  let premiumUser = false;
  try {
    if (typeof text !== 'string' || !text.trim() || text.length > 2000) {
      res.status(400).json({ success: false, message: 'Text must be between 1 and 2000 characters' });
      return;
    }
    const contextMessages = Array.isArray(context)
      ? context.filter(item => typeof item === 'string').slice(-12)
      : [];
    const tutor = await buildTutorOptions(authReq.userId, scenarioId);
    premiumUser = hasActivePremium(tutor.user);
    const quota = await consumeAiQuota(authReq.userId, 'voiceTurns', premiumUser);
    if (!quota.allowed) {
      res.status(429).json({ success: false, message: 'Daily free speaking-turn limit reached. Upgrade to Premium for unlimited AI practice.' });
      return;
    }
    quotaConsumed = true;
    const aiResponse = await generateAIResponse(text, contextMessages, { ...tutor.options, isVoiceCall: true });
    let audioBase64: string | undefined;
    try {
      audioBase64 = (await generateSpeech(aiResponse.chinese)).toString('base64');
    } catch (ttsError) {
      console.error('TTS unavailable, returning text response:', ttsError);
    }
    
    res.json({
      success: true,
      data: {
        aiResponse,
        audioBase64,
        quota,
      },
    });
  } catch (error) {
    console.error('AI response error:', error);
    if (quotaConsumed) {
      await refundAiQuota(authReq.userId, 'voiceTurns', premiumUser).catch(refundError => {
        console.error('Failed to refund voice-turn quota:', refundError);
      });
    }
    sendAIError(res, error, 'Failed to generate response');
  }
};

export const processVoiceAction = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const action = req.body.action;
  const sessionId = req.body.sessionId;
  if (!['hint', 'simpler'].includes(action)) {
    res.status(400).json({ success: false, message: 'Tutor action must be hint or simpler' });
    return;
  }
  const call = await activeVoiceCall(authReq.userId, sessionId);
  if (!call) {
    res.status(409).json({ success: false, message: 'Voice session is not active. Start a new call.' });
    return;
  }

  let quotaConsumed = false;
  let premiumUser = false;
  try {
    const tutor = await buildTutorOptions(authReq.userId, call.scenarioId);
    premiumUser = hasActivePremium(tutor.user);
    const quota = await consumeAiQuota(authReq.userId, 'voiceTurns', premiumUser);
    if (!quota.allowed) {
      res.status(429).json({ success: false, message: 'Daily free speaking-turn limit reached. Upgrade to Premium for unlimited AI practice.' });
      return;
    }
    quotaConsumed = true;
    const context = buildVoiceCallContext(call.transcript);
    const prompt = action === 'hint'
      ? 'Tutor control: Give the learner ONE short, natural Chinese sentence they can say next. Make it directly answer your latest question and fit their HSK level. This is a hint, not your next role-play turn.'
      : 'Tutor control: Restate your latest question using much simpler Chinese while keeping the same meaning. Use shorter words and one short sentence.';
    const aiResponse = await generateAIResponse(prompt, context, { ...tutor.options, isVoiceCall: true });
    let audioBase64: string | undefined;
    try {
      audioBase64 = (await generateSpeech(aiResponse.chinese)).toString('base64');
    } catch (ttsError) {
      console.error('TTS unavailable for tutor action, returning text response:', ttsError);
    }
    res.json({
      success: true,
      data: { tutorAction: action, aiResponse, audioBase64, quota },
    });
  } catch (error) {
    if (quotaConsumed) {
      await refundAiQuota(authReq.userId, 'voiceTurns', premiumUser).catch(refundError => {
        console.error('Failed to refund tutor-action quota:', refundError);
      });
    }
    console.error('Tutor action error:', error);
    sendAIError(res, error, 'Unable to provide tutor help');
  }
};

export const endVoiceCall = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { sessionId, duration, score, transcript } = req.body;
  if (typeof sessionId !== 'string' || !sessionId.startsWith('call_')) {
    res.status(400).json({ success: false, message: 'Valid call session ID required' });
    return;
  }
  const clientDuration = Number.isFinite(Number(duration)) ? Math.max(0, Math.min(Number(duration), 7200)) : 0;
  const safeScore = Number.isFinite(Number(score)) ? Math.max(0, Math.min(Number(score), 100)) : 0;
  const safeTranscript: ITranscriptItem[] = Array.isArray(transcript)
    ? transcript.slice(0, 100).map((item): ITranscriptItem => ({
        role: item?.role === 'user' ? 'user' : 'ai',
        chinese: String(item?.chinese || '').slice(0, 2000),
        pinyin: String(item?.pinyin || '').slice(0, 2000),
        english: String(item?.english || '').slice(0, 2000),
        timestamp: Number.isFinite(Number(item?.timestamp)) ? Number(item.timestamp) : Date.now(),
      })).filter(item => item.chinese)
    : [];
  const dbSession = await mongoose.startSession();
  let completed = false;
  let safeDuration = 0;
  let xpEarned = 0;
  let streak: number | null = null;
  let todayMinutes = 0;
  let callReport: VoiceCallReport = buildVoiceCallReport([], 0, safeScore);
  const timezoneOffset = normalizeTimezoneOffset(req.header('x-timezone-offset'));
  try {
    await dbSession.withTransaction(async () => {
      const activeCall = await CallSession.findOne({
        userId: authReq.userId,
        sessionId,
        status: 'started',
      }).session(dbSession);
      if (!activeCall) return;

      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - activeCall.createdAt.getTime()) / 1000));
      safeDuration = Math.min(clientDuration, elapsedSeconds + 10, 7200);
      const serverTranscript = activeCall.transcript?.length > 0
        ? activeCall.transcript.map(item => ({
            role: item.role,
            chinese: item.chinese,
            pinyin: item.pinyin,
            english: item.english,
            timestamp: item.timestamp,
            correction: item.correction,
            feedback: item.feedback,
            pronunciationScore: item.pronunciationScore,
          }))
        : safeTranscript;
      const hasLearnerTurn = serverTranscript.some(item => item.role === 'user');
      const hasMeaningfulPractice = hasLearnerTurn && safeDuration >= 20;
      callReport = buildVoiceCallReport(serverTranscript, safeDuration, safeScore);
      xpEarned = hasMeaningfulPractice ? Math.min(50, Math.floor(safeDuration / 6)) : 0;
      const minutesEarned = hasMeaningfulPractice
        ? Math.max(1, Math.floor(safeDuration / 60))
        : 0;
      const call = await CallSession.findOneAndUpdate(
        { _id: activeCall._id, status: 'started' },
        {
          $set: {
            status: 'completed',
            duration: safeDuration,
            score: hasLearnerTurn ? callReport.score : 0,
            feedback: callReport.feedback,
            transcript: serverTranscript,
          },
          $unset: { expiresAt: 1 },
        },
        { new: true, session: dbSession }
      );
      if (!call) return;

      const user = await User.findByIdAndUpdate(
        authReq.userId,
        { $inc: { xp: xpEarned } },
        { new: true, session: dbSession }
      );
      if (!user) throw new Error('User not found');

      if (hasMeaningfulPractice) {
        streak = await recordLearningActivity(
          authReq.userId,
          timezoneOffset,
          new Date(),
          dbSession,
          minutesEarned,
        );
        const refreshedUser = await User.findById(authReq.userId).session(dbSession);
        todayMinutes = refreshedUser?.todayMinutes || 0;
      }

      const currentProgress = await Progress.findOne({ userId: authReq.userId }).session(dbSession);
      const progressSet: Record<string, unknown> = { lastUpdated: new Date() };
      if (hasMeaningfulPractice) {
        const previousSpeaking = Number(currentProgress?.speaking || 0);
        const previousListening = Number(currentProgress?.listening || 0);
        const speaking = previousSpeaking === 0
          ? Math.round(callReport.score)
          : Math.round(previousSpeaking * 0.75 + callReport.score * 0.25);
        const listeningSample = Math.min(100, callReport.score + 5);
        const listening = previousListening === 0
          ? Math.round(listeningSample)
          : Math.round(previousListening * 0.85 + listeningSample * 0.15);
        const scores = {
          speaking,
          tones: Number(currentProgress?.tones || 0),
          vocabulary: Number(currentProgress?.vocabulary || 0),
          grammar: Number(currentProgress?.grammar || 0),
          listening,
          reading: Number(currentProgress?.reading || 0),
        };
        progressSet.speaking = speaking;
        progressSet.listening = listening;
        progressSet.overall = Math.round(Object.values(scores).reduce((sum, value) => sum + value, 0) / 6);
        const weekKey = localWeekKey(new Date(), timezoneOffset);
        const weeklyXp = Array.from(
          { length: 7 },
          (_, index) => currentProgress?.weeklyXpWeek === weekKey ? Number(currentProgress?.weeklyXp?.[index] || 0) : 0,
        );
        weeklyXp[localWeekdayIndex(new Date(), timezoneOffset)] += xpEarned;
        progressSet.weeklyXp = weeklyXp;
        progressSet.weeklyXpWeek = weekKey;
      }

      await Progress.findOneAndUpdate(
        { userId: authReq.userId },
        {
          $inc: { totalSessions: hasMeaningfulPractice ? 1 : 0, totalMinutes: minutesEarned },
          $set: progressSet,
        },
        { upsert: true, session: dbSession }
      );
      completed = true;
    });
  } finally {
    await dbSession.endSession();
  }

  if (!completed) {
    res.status(409).json({ success: false, message: 'Call session was not found or was already completed' });
    return;
  }

  res.json({
    success: true,
    message: 'Call ended and progress saved',
    data: { xpEarned, duration: safeDuration, streak, todayMinutes, ...callReport },
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
  
  if (typeof message !== 'string' || message.trim().length === 0 || message.length > 2000) {
    res.status(400).json({ success: false, message: 'Message must be between 1 and 2000 characters' });
    return;
  }

  const { ChatMessage } = await import('../models');
  let quotaConsumed = false;
  let premiumUser = false;
  try {
    const tutor = await buildTutorOptions(authReq.userId);
    premiumUser = hasActivePremium(tutor.user);
    const quota = await consumeAiQuota(authReq.userId, 'chatMessages', premiumUser);
    if (!quota.allowed) {
      res.status(429).json({ success: false, message: 'Daily free AI chat limit reached. Upgrade to Premium for unlimited tutoring.' });
      return;
    }
    quotaConsumed = true;
    const recentMessages = await ChatMessage.find({ userId: authReq.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    const context = recentMessages.reverse().map(item => item.content);
    const aiResponse = await generateAIResponse(message.trim(), context, tutor.options);

    await ChatMessage.create({
      userId: authReq.userId,
      role: 'user',
      content: message.trim(),
    });

    const aiMessage = await ChatMessage.create({
      userId: authReq.userId,
      role: 'ai',
      content: aiResponse.chinese,
      pinyin: aiResponse.pinyin,
      translation: aiResponse.english,
      correction: aiResponse.correction,
      feedback: aiResponse.feedback,
    });

    res.json({
      success: true,
      data: {
        userMessage: { role: 'user', content: message.trim() },
        aiMessage,
        quota,
      },
    });
  } catch (error) {
    console.error('AI chat error:', error);
    if (quotaConsumed) {
      await refundAiQuota(authReq.userId, 'chatMessages', premiumUser).catch(refundError => {
        console.error('Failed to refund chat quota:', refundError);
      });
    }
    sendAIError(res, error, 'Failed to generate tutor response');
  }
};

export const clearChat = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  
  const { ChatMessage } = await import('../models');
  await ChatMessage.deleteMany({ userId: authReq.userId });
  
  res.json({ success: true, message: 'Chat cleared' });
};
