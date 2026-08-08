import { Request, Response } from 'express';
import {
  AIServiceError,
  analyzePronunciation,
  generateAIResponse,
  transcribeAudio,
  generateSpeech,
} from '../services/ai.service';
import { createHash, randomUUID } from 'crypto';
import mongoose from 'mongoose';
import { User, Progress, CallSession, Scenario, RealtimeSession, AIUsageEvent } from '../models';
import type { AuthRequest, ITranscriptItem } from '../types';
import { consumeAiQuota, hasActivePremium, refundAiQuota, getAiUsage, recordAiMinutes } from '../services/entitlement.service';
import { getAppConfig } from '../services/config.service';
import { getIntegrationSecret } from '../services/integration-secrets.service';
import { estimateProviderCost, selectAIProvider } from '../services/ai-provider.service';
import { checkAiSpendBudget, recordAiUsageEvent } from '../services/ai-usage.service';
import { localWeekdayIndex, localWeekKey, normalizeTimezoneOffset, recordLearningActivity } from '../services/streak.service';
import { buildVoiceCallContext, buildVoiceCallReport, type VoiceCallReport } from '../services/voice-session.service';
import { hasContentAccess } from '../services/reward.service';
import { getMistakePromptContext, getMistakes, recordMistake } from '../services/mistake-memory.service';

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
      userId,
      isPremium: hasActivePremium(user),
    },
  };
};

const activeVoiceCall = async (userId: string | undefined, sessionId: unknown) => {
  if (!userId || typeof sessionId !== 'string' || !sessionId.startsWith('call_')) return null;
  return CallSession.findOne({ userId, sessionId, status: 'started' });
};

const enforceVoiceSessionAllowance = async (userId: string, activeCall: any): Promise<void> => {
  if (!activeCall) return;
  const [user, config] = await Promise.all([User.findById(userId).lean(), getAppConfig()]);
  const premium = hasActivePremium(user);
  const usage = await getAiUsage(userId, premium);
  const baseFreeDailySeconds = (config.aiConfig.freeTalkDemoMinutesPerDay || 3) * 60;
  const rewardedBonusSeconds = premium ? 0 : Math.max(0, usage.talk.dailyLimitSeconds - baseFreeDailySeconds);
  const sessionCap = premium
    ? (config.aiConfig.premiumTalkMinutesPerSession || 15) * 60
    : (config.aiConfig.freeTalkMaxMinutesPerSession || 3) * 60 + rewardedBonusSeconds;
  const elapsed = Math.floor((Date.now() - activeCall.createdAt.getTime()) / 1000);
  const remaining = Math.min(usage.talk.dailyLimitSeconds - usage.talk.usedSecondsToday, usage.talk.monthlyLimitSeconds == null ? Number.MAX_SAFE_INTEGER : usage.talk.monthlyLimitSeconds - usage.talk.usedSecondsMonth);
  if (elapsed >= sessionCap || remaining <= 0) throw new AIServiceError('AI Talk allowance reached. End this session or upgrade your plan.', 'AI_TALK_LIMIT', 429);
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
    const usage = await getAiUsage(authReq.userId!, activePremium);
    if (usage.talk.dailyLimitSeconds <= usage.talk.usedSecondsToday || (usage.talk.monthlyLimitSeconds != null && usage.talk.monthlyLimitSeconds <= usage.talk.usedSecondsMonth)) {
      res.status(429).json({ success: false, message: 'Your AI Talk allowance is used for this period. Please wait for reset or upgrade your plan.', code: 'AI_TALK_LIMIT' });
      return;
    }
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
      res.status(429).json({
        success: false,
        message: 'Today\'s AI Talk demo is used. Upgrade for a larger allowance or wait for reset.',
        code: 'AI_TALK_CALL_LIMIT',
      });
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
        audioBase64 = (await generateSpeech(aiResponse.chinese, tutor.options)).toString('base64');
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
          scenarioId: scenario?._id.toString() || null,
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
    await enforceVoiceSessionAllowance(authReq.userId!, activeCall);
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
      res.status(429).json({ success: false, message: 'Today\'s AI Talk turn allowance is used. Upgrade for a larger allowance or wait for reset.', code: 'AI_TALK_LIMIT' });
      return;
    }
    quotaConsumed = true;
    const spokenText = await transcribeAudio(
      req.file.buffer,
      { ...tutor.options, inputAudioSeconds: Math.max(1, Math.ceil(req.file.size / 16000)) },
      req.file.originalname || 'practice.m4a',
      req.file.mimetype || 'audio/mp4'
    );
    const aiResponse = await generateAIResponse(spokenText, contextMessages, { ...tutor.options, isVoiceCall: true });
    let audioBase64: string | undefined;
    try {
      audioBase64 = (await generateSpeech(aiResponse.chinese, tutor.options)).toString('base64');
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
      res.status(429).json({ success: false, message: 'Today\'s AI Talk turn allowance is used. Upgrade for a larger allowance or wait for reset.', code: 'AI_TALK_LIMIT' });
      return;
    }
    quotaConsumed = true;
    const aiResponse = await generateAIResponse(text, contextMessages, { ...tutor.options, isVoiceCall: true });
    let audioBase64: string | undefined;
    try {
      audioBase64 = (await generateSpeech(aiResponse.chinese, tutor.options)).toString('base64');
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
  await enforceVoiceSessionAllowance(authReq.userId!, call);

  let quotaConsumed = false;
  let premiumUser = false;
  try {
    const tutor = await buildTutorOptions(authReq.userId, call.scenarioId);
    premiumUser = hasActivePremium(tutor.user);
    const quota = await consumeAiQuota(authReq.userId, 'voiceTurns', premiumUser);
    if (!quota.allowed) {
      res.status(429).json({ success: false, message: 'Today\'s AI Talk turn allowance is used. Upgrade for a larger allowance or wait for reset.', code: 'AI_TALK_LIMIT' });
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
      audioBase64 = (await generateSpeech(aiResponse.chinese, tutor.options)).toString('base64');
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
      const user = await User.findById(authReq.userId).session(dbSession);
      const premium = hasActivePremium(user);
      const usage = await getAiUsage(authReq.userId!, premium);
      const config = await getAppConfig();
      const baseFreeDailySeconds = (config.aiConfig.freeTalkDemoMinutesPerDay || 3) * 60;
      const rewardedBonusSeconds = premium ? 0 : Math.max(0, usage.talk.dailyLimitSeconds - baseFreeDailySeconds);
      const sessionCap = premium
        ? (config.aiConfig.premiumTalkMinutesPerSession || 15) * 60
        : (config.aiConfig.freeTalkMaxMinutesPerSession || 3) * 60 + rewardedBonusSeconds;
      const dailyRemaining = Math.max(0, usage.talk.dailyLimitSeconds - usage.talk.usedSecondsToday);
      const monthlyRemaining = usage.talk.monthlyLimitSeconds == null
        ? Number.MAX_SAFE_INTEGER
        : Math.max(0, usage.talk.monthlyLimitSeconds - usage.talk.usedSecondsMonth);
      safeDuration = Math.min(clientDuration, elapsedSeconds + 10, sessionCap, dailyRemaining, monthlyRemaining, 7200);
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

      const updatedUser = await User.findByIdAndUpdate(
        authReq.userId,
        { $inc: { xp: xpEarned } },
        { new: true, session: dbSession }
      );
      if (!updatedUser) throw new Error('User not found');

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

  await recordAiMinutes(authReq.userId!, safeDuration);

  res.json({
    success: true,
    message: 'Call ended and progress saved',
    data: { xpEarned, duration: safeDuration, streak, todayMinutes, ...callReport },
  });
};

export const getAiUsageSummary = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const user = await User.findById(authReq.userId).lean();
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, data: await getAiUsage(authReq.userId!, hasActivePremium(user)) });
};

export const createRealtimeToken = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const [user, config, selectedProvider] = await Promise.all([User.findById(authReq.userId).lean(), getAppConfig(), selectAIProvider('talk_realtime')]);
    const provider = selectedProvider && ['openai', 'openrouter', 'groq', 'custom'].includes(selectedProvider.type) ? selectedProvider : null;
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    if (!config.aiConfig.realtimeTalkEnabled) { res.status(503).json({ success: false, message: 'Live Realtime Talk is disabled' }); return; }
    if (!hasActivePremium(user)) { res.status(403).json({ success: false, message: 'Premium is required for Ling Live' }); return; }
    const spendBudget = await checkAiSpendBudget(authReq.userId, true);
    if (!spendBudget.allowed) { res.status(429).json({ success: false, message: 'Your AI cost allowance is used for this period.', code: 'AI_BUDGET_LIMIT' }); return; }
    const usage = await getAiUsage(authReq.userId!, true);
    if (usage.talk.dailyLimitSeconds <= usage.talk.usedSecondsToday || (usage.talk.monthlyLimitSeconds != null && usage.talk.monthlyLimitSeconds <= usage.talk.usedSecondsMonth)) { res.status(429).json({ success: false, message: 'Monthly AI Talk allowance reached', code: 'AI_TALK_LIMIT' }); return; }
    const existingSession = await RealtimeSession.findOne({ userId: authReq.userId, status: 'active', expiresAt: { $gt: new Date() } }).lean();
    if (existingSession) { res.status(409).json({ success: false, message: 'A Ling Live session is already active. End it before starting another.', code: 'AI_TALK_ACTIVE' }); return; }
    await RealtimeSession.updateMany({ userId: authReq.userId, status: 'active', expiresAt: { $lte: new Date() } }, { $set: { status: 'completed', completedAt: new Date() } });
    const apiKey = provider?.apiKey || await getIntegrationSecret('OPENAI_API_KEY');
    if (!apiKey) { res.status(503).json({ success: false, message: 'Realtime provider is not configured' }); return; }
    const model = provider?.realtimeModel || 'gpt-realtime-2.1-mini';
    const dailyRemaining = Math.max(0, usage.talk.dailyLimitSeconds - usage.talk.usedSecondsToday);
    const monthlyRemaining = usage.talk.monthlyLimitSeconds == null
      ? Number.MAX_SAFE_INTEGER
      : Math.max(0, usage.talk.monthlyLimitSeconds - usage.talk.usedSecondsMonth);
    const maxSeconds = Math.max(1, Math.min((config.aiConfig.premiumTalkMinutesPerSession || 15) * 60, dailyRemaining, monthlyRemaining));
    const scenario = await findScenario(typeof req.body?.scenarioId === 'string' ? req.body.scenarioId : undefined);
    const safetyIdentifier = createHash('sha256').update(`chinesapp:${authReq.userId}`).digest('hex');
    const baseUrl = (provider?.baseUrl || 'https://api.openai.com').replace(/\/v1\/?$/, '');
    const upstream = await fetch(`${baseUrl}/v1/realtime/client_secrets`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'OpenAI-Safety-Identifier': safetyIdentifier },
      body: JSON.stringify({ session: { type: 'realtime', model, audio: { input: { transcription: { model: 'gpt-4o-mini-transcribe', language: 'zh' } }, output: { voice: config.aiConfig.ttsVoice || 'marin' } }, instructions: `You are Ling, a warm Mandarin tutor. Speak in short HSK-level Chinese sentences. Provide gentle coaching after several turns, not after every turn.${scenario?.systemPrompt ? ` Scenario: ${scenario.systemPrompt}` : ''}` } }),
    });
    const payload = await upstream.json() as Record<string, unknown>;
    if (!upstream.ok) { res.status(502).json({ success: false, message: 'Realtime provider rejected the session' }); return; }
    const clientSecret = typeof payload.value === 'string'
      ? payload.value
      : typeof payload.client_secret === 'string'
        ? payload.client_secret
        : '';
    if (!clientSecret) { res.status(502).json({ success: false, message: 'Realtime provider did not return a session secret' }); return; }
    const sessionId = `live_${randomUUID()}`;
    const conservativeOutputSeconds = maxSeconds;
    const reservedCost = estimateProviderCost(provider, { inputAudioSeconds: maxSeconds, outputAudioSeconds: conservativeOutputSeconds });
    const ledger = await AIUsageEvent.create({
      userId: authReq.userId,
      plan: 'premium',
      feature: 'talk_realtime',
      provider: provider?.id || 'openai',
      model,
      status: 'success',
      inputAudioSeconds: maxSeconds,
      outputAudioSeconds: conservativeOutputSeconds,
      estimatedCostUsd: reservedCost,
      metadata: { reserved: true, sessionId },
    });
    await RealtimeSession.create({
      sessionId,
      userId: authReq.userId,
      provider: provider?.id || 'openai',
      model,
      maxSeconds,
      ledgerEventId: ledger._id,
      expiresAt: new Date(Date.now() + maxSeconds * 1000 + 10 * 60 * 1000),
    });
    res.json({ success: true, data: { clientSecret, expiresAt: payload.expires_at, model, endpoint: `${baseUrl}/v1/realtime/calls`, sessionId, maxSeconds } });
  } catch (error) {
    console.error('Realtime token error:', error);
    sendAIError(res, error, 'Unable to start Ling Live');
  }
};

export const finishRealtimeSession = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const user = await User.findById(authReq.userId).lean();
  if (!user || !hasActivePremium(user)) { res.status(403).json({ success: false, message: 'Premium is required for Ling Live' }); return; }
  const sessionId = String(req.body?.sessionId || '');
  const activeSession = await RealtimeSession.findOneAndUpdate(
    { sessionId, userId: authReq.userId, status: 'active' },
    { $set: { status: 'completed', completedAt: new Date() } },
    { new: true },
  );
  if (!activeSession) {
    res.json({ success: true, data: await getAiUsage(authReq.userId!, true) });
    return;
  }
  const elapsed = Math.max(0, Math.floor((Date.now() - activeSession.startedAt.getTime()) / 1000));
  const clientSeconds = Math.max(0, Number(req.body?.seconds) || 0);
  const seconds = Math.max(0, Math.min(Math.max(clientSeconds, elapsed - 5), activeSession.maxSeconds));
  const selectedProvider = await selectAIProvider('talk_realtime');
  const provider = selectedProvider && ['openai', 'openrouter', 'groq', 'custom'].includes(selectedProvider.type) ? selectedProvider : null;
  const reportedOutput = Math.max(0, Number(req.body?.outputSeconds) || 0);
  const outputSeconds = Math.min(seconds, Math.max(reportedOutput, Math.floor(seconds * 0.4)));
  await recordAiMinutes(authReq.userId!, seconds);
  await AIUsageEvent.updateOne(
    { _id: activeSession.ledgerEventId },
    { $set: {
      provider: provider?.id || activeSession.provider,
      model: provider?.realtimeModel || activeSession.model || 'gpt-realtime-2.1-mini',
      inputAudioSeconds: seconds,
      outputAudioSeconds: outputSeconds,
      estimatedCostUsd: estimateProviderCost(provider, { inputAudioSeconds: seconds, outputAudioSeconds: outputSeconds }),
      metadata: { reserved: false, sessionId, serverElapsedSeconds: elapsed },
    } },
  );
  res.json({ success: true, data: await getAiUsage(authReq.userId!, true) });
};

export const getChatMessages = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  
  const { ChatMessage } = await import('../models');
  const messages = await ChatMessage.find({ userId: authReq.userId })
    .sort({ createdAt: -1 })
    .limit(100);
  
  res.json({ success: true, data: messages.reverse() });
};

export const synthesizeChatSpeech = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const messageId = typeof req.body?.messageId === 'string' ? req.body.messageId.trim() : '';
  if (!mongoose.isValidObjectId(messageId)) {
    res.status(400).json({ success: false, message: 'A valid AI chat message is required' });
    return;
  }
  const tutor = await buildTutorOptions(authReq.userId);
  if (!hasActivePremium(tutor.user)) {
    res.status(403).json({ success: false, message: 'Premium is required for server-quality tutor voice', code: 'PREMIUM_REQUIRED' });
    return;
  }
  try {
    const { AIUsageEvent, ChatMessage } = await import('../models');
    const message = await ChatMessage.findOne({ _id: messageId, userId: authReq.userId, role: 'ai' }).lean();
    if (!message?.content) {
      res.status(404).json({ success: false, message: 'AI chat message not found' });
      return;
    }
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const generatedToday = await AIUsageEvent.countDocuments({ userId: authReq.userId, feature: 'talk_tts', createdAt: { $gte: today } });
    if (generatedToday >= 100) {
      res.status(429).json({ success: false, message: 'Daily Premium voice allowance reached', code: 'AI_TTS_LIMIT' });
      return;
    }
    const audio = await generateSpeech(message.content.slice(0, 1200), { ...tutor.options, isPremium: true });
    res.json({ success: true, data: { audioBase64: audio.toString('base64'), mimeType: 'audio/mpeg' } });
  } catch (error) {
    sendAIError(res, error, 'Tutor audio is temporarily unavailable');
  }
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
    const mistakeContext = await getMistakePromptContext(authReq.userId!, 5);
    premiumUser = hasActivePremium(tutor.user);
    const quota = await consumeAiQuota(authReq.userId, 'chatMessages', premiumUser);
    if (!quota.allowed) {
      res.status(429).json({ success: false, message: 'Today\'s AI Chat allowance is used. Upgrade for a larger monthly allowance or wait for reset.', code: 'AI_CHAT_LIMIT' });
      return;
    }
    quotaConsumed = true;
    const recentMessages = await ChatMessage.find({ userId: authReq.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    const context = recentMessages.reverse().map(item => item.content);
    const aiResponse = await generateAIResponse(message.trim(), context, {
      ...tutor.options,
      scenarioPrompt: [tutor.options.scenarioPrompt, mistakeContext].filter(Boolean).join('\n'),
    });

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
    if (aiResponse.correction) await recordMistake(authReq.userId!, message.trim(), aiResponse.correction, aiResponse.feedback);

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

export const getChatReport = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { ChatMessage } = await import('../models');
  const messages = await ChatMessage.find({ userId: authReq.userId }).sort({ createdAt: -1 }).limit(60).lean();
  const storedMistakes = await getMistakes(authReq.userId!, 10);
  const corrections = storedMistakes.slice(0, 3).map(item => `${item.original} -> ${item.correction}`);
  const words = messages.flatMap(message => String(message.content || '').match(/[\u4e00-\u9fff]{2,6}/g) || []).filter((word, index, all) => all.indexOf(word) === index).slice(0, 5);
  res.json({ success: true, data: { corrections, mistakes: storedMistakes, newWords: words, grammarWeakness: corrections.length ? 'Review the corrections above and reuse each sentence.' : 'Keep practicing complete Chinese sentences.', nextPractice: corrections.length ? 'Try a role-play using your corrected sentences.' : 'Practice a restaurant or travel conversation next.' } });
};

export const getMistakeMemory = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  res.json({ success: true, data: await getMistakes(authReq.userId!, Number(req.query.limit) || 20) });
};
