import OpenAI from 'openai';
import type { AIVoiceResponse } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CHINESE_SYSTEM_PROMPT = `You are Ling (灵), a friendly and encouraging AI Chinese language tutor. Your role is to:

1. Help users practice speaking Chinese
2. Correct their pronunciation and grammar gently
3. Provide pinyin for all Chinese text
4. Give English translations
5. Be patient and encouraging

Rules:
- Keep responses concise (1-3 sentences)
- Always provide Chinese, Pinyin, and English
- For corrections, explain what was wrong and give the correct form
- Be friendly and use emojis occasionally
- Adjust difficulty based on user's level

When the user speaks in English, respond in simple Chinese with pinyin and translation.
When the user speaks in Chinese, respond in Chinese with corrections if needed.

Format your responses as:
Chinese: [Chinese text]
Pinyin: [Pinyin]
English: [English translation]
Correction: [If needed, otherwise skip]`;

export const generateAIResponse = async (
  userMessage: string,
  context: string[] = [],
  isVoiceCall: boolean = false
): Promise<{ chinese: string; pinyin: string; english: string }> => {
  try {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: CHINESE_SYSTEM_PROMPT },
      ...context.map((msg, i) => ({
        role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg,
      })),
      { role: 'user', content: userMessage },
    ];
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: isVoiceCall ? 100 : 200,
      temperature: 0.7,
    });
    
    const responseText = completion.choices[0]?.message?.content || '你好！有什么可以帮你的？';
    
    return parseAIResponse(responseText);
  } catch (error) {
    console.error('OpenAI Error:', error);
    return {
      chinese: '你好！我是灵，你的中文老师。',
      pinyin: 'Nǐ hǎo! Wǒ shì Líng, nǐ de Zhōng wén lǎo shī.',
      english: 'Hello! I am Ling, your Chinese teacher.',
    };
  }
};

const parseAIResponse = (text: string): { chinese: string; pinyin: string; english: string } => {
  const chineseMatch = text.match(/Chinese:\s*(.+)/i);
  const pinyinMatch = text.match(/Pinyin:\s*(.+)/i);
  const englishMatch = text.match(/English:\s*(.+)/i);
  
  if (chineseMatch && pinyinMatch && englishMatch) {
    return {
      chinese: chineseMatch[1].trim(),
      pinyin: pinyinMatch[1].trim(),
      english: englishMatch[1].trim(),
    };
  }
  
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length >= 1) {
    return {
      chinese: lines[0],
      pinyin: lines[1] || '',
      english: lines[2] || text,
    };
  }
  
  return {
    chinese: text,
    pinyin: '',
    english: text,
  };
};

export const transcribeAudio = async (audioBuffer: Buffer): Promise<string> => {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], 'audio.webm', { type: 'audio/webm' }),
      model: 'whisper-1',
      language: 'zh',
      response_format: 'text',
    });
    
    return transcription;
  } catch (error) {
    console.error('Whisper Error:', error);
    throw new Error('Failed to transcribe audio');
  }
};

export const generateSpeech = async (text: string): Promise<Buffer> => {
  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: text,
      response_format: 'mp3',
    });
    
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('TTS Error:', error);
    throw new Error('Failed to generate speech');
  }
};

export const analyzePronunciation = (
  expectedChinese: string,
  spokenText: string
): { score: number; feedback: string } => {
  const expectedChars = expectedChinese.replace(/[^\u4e00-\u9fff]/g, '');
  const spokenChars = spokenText.replace(/[^\u4e00-\u9fff]/g, '');
  
  if (expectedChars === spokenChars) {
    return { score: 95, feedback: 'Perfect pronunciation! 非常好！' };
  }
  
  const commonChars = expectedChars.split('').filter(c => spokenChars.includes(c));
  const similarity = commonChars.length / Math.max(expectedChars.length, 1);
  const score = Math.round(similarity * 100);
  
  let feedback = 'Good effort! ';
  if (score >= 80) {
    feedback += 'Almost perfect. Keep practicing! 继续加油！';
  } else if (score >= 60) {
    feedback += 'Nice try! Focus on tones. 注意声调！';
  } else {
    feedback += 'Keep practicing! Listen carefully. 多听多说！';
  }
  
  return { score, feedback };
};

export const getScenarioPrompt = (scenarioTitle: string, difficulty: string): string => {
  return `You are helping the user practice the scenario: "${scenarioTitle}".
Difficulty level: ${difficulty}

Start by greeting them in Chinese relevant to this scenario.
Guide the conversation naturally.
Be patient and encouraging.
Provide corrections when needed.
Keep responses short and natural for a conversation.`;
};