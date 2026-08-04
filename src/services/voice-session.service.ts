import type { ITranscriptItem } from '../types';

export interface VoiceCallReport {
  score: number;
  speakingTurns: number;
  strengths: string[];
  focusAreas: string[];
  feedback: string;
}

export const buildVoiceCallContext = (transcript: ITranscriptItem[]): string[] =>
  transcript.slice(-12).map(item =>
    `${item.role === 'user' ? 'Learner' : 'Ling'}: ${item.chinese}`
  );

export const buildVoiceCallReport = (
  transcript: ITranscriptItem[],
  durationSeconds: number,
  fallbackScore: number,
): VoiceCallReport => {
  const learnerTurns = transcript.filter(item => item.role === 'user' && item.chinese.trim());
  const phraseScores = learnerTurns
    .map(item => Number(item.pronunciationScore))
    .filter(score => Number.isFinite(score) && score >= 0 && score <= 100);
  const score = phraseScores.length > 0
    ? Math.round(phraseScores.reduce((sum, value) => sum + value, 0) / phraseScores.length)
    : Math.max(0, Math.min(Math.round(fallbackScore), 100));
  const corrections = [...new Set(
    transcript
      .filter(item => item.role === 'ai')
      .map(item => item.correction?.trim())
      .filter((item): item is string => Boolean(item)),
  )].slice(0, 2);

  const strengths: string[] = [];
  if (learnerTurns.length >= 4) strengths.push('You sustained a multi-turn Mandarin conversation.');
  else if (learnerTurns.length >= 1) strengths.push('You responded in Mandarin and completed real speaking turns.');
  if (phraseScores.length > 0 && score >= 80) strengths.push('Your guided phrases were recognized clearly.');
  if (durationSeconds >= 120) strengths.push('You maintained focused speaking practice for at least two minutes.');
  if (strengths.length === 0) strengths.push('You started an active speaking session with Ling.');

  const focusAreas: string[] = corrections.map(item => `Review: ${item}`);
  if (phraseScores.length > 0 && score < 80) {
    focusAreas.push('Replay guided phrases and keep each syllable distinct.');
  }
  if (learnerTurns.length < 3) {
    focusAreas.push('Next time, aim for at least three complete answers.');
  }
  if (focusAreas.length === 0) {
    focusAreas.push('Build longer answers by adding one reason or detail.');
  }

  const scoreText = phraseScores.length > 0 ? ` Guided phrase match: ${score}%.` : '';
  return {
    score,
    speakingTurns: learnerTurns.length,
    strengths: strengths.slice(0, 3),
    focusAreas: focusAreas.slice(0, 3),
    feedback: `You completed ${learnerTurns.length} speaking turn${learnerTurns.length === 1 ? '' : 's'}.${scoreText} ${focusAreas[0]}`.trim(),
  };
};
