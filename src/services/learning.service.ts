import { PLACEMENT_QUESTIONS } from '../content/placement';

export type PlacementAnswer = { questionId: string; answer: string };
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export const scorePlacementAnswers = (answers: PlacementAnswer[]) => {
  const answerMap = new Map(answers.map(item => [item.questionId, String(item.answer || '').trim()]));
  const results = PLACEMENT_QUESTIONS.map(question => ({
    questionId: question.id,
    hskLevel: question.hskLevel,
    correct: answerMap.get(question.id) === question.answer,
  }));
  const correct = results.filter(result => result.correct).length;
  const foundationalCorrect = results.filter(result => result.hskLevel === 1 && result.correct).length;
  const rawLevel = Math.min(6, Math.max(1, Math.ceil(correct / 2)));
  const hskLevel = foundationalCorrect < 2 ? 1 : rawLevel;
  const percentage = Math.round((correct / PLACEMENT_QUESTIONS.length) * 100);
  const breakdown = Array.from({ length: 6 }, (_, index) => {
    const level = index + 1;
    const levelResults = results.filter(result => result.hskLevel === level);
    return {
      hskLevel: level,
      correct: levelResults.filter(result => result.correct).length,
      total: levelResults.length,
    };
  });
  return { correct, total: PLACEMENT_QUESTIONS.length, percentage, hskLevel, breakdown };
};
export interface VocabularyScheduleState {
  mastery?: number;
  intervalDays?: number;
  easeFactor?: number;
}

export const nextVocabularyReview = (
  state: VocabularyScheduleState,
  rating: ReviewRating,
  now = new Date(),
) => {
  const currentMastery = Math.max(0, Math.min(5, Math.round(Number(state.mastery) || 0)));
  const currentInterval = Math.max(0, Number(state.intervalDays) || 0);
  const currentEase = Math.max(1.3, Math.min(3.5, Number(state.easeFactor) || 2.5));
  let mastery = currentMastery;
  let intervalDays = currentInterval;
  let easeFactor = currentEase;
  let delayMs: number;

  switch (rating) {
    case 'again':
      mastery = Math.max(0, currentMastery - 1);
      intervalDays = 0;
      easeFactor = Math.max(1.3, currentEase - 0.2);
      delayMs = 10 * 60 * 1000;
      break;
    case 'hard':
      mastery = Math.max(1, currentMastery);
      intervalDays = Math.max(1, Math.round(Math.max(1, currentInterval) * 1.4));
      easeFactor = Math.max(1.3, currentEase - 0.08);
      delayMs = intervalDays * 24 * 60 * 60 * 1000;
      break;
    case 'easy':
      mastery = Math.min(5, currentMastery + 2);
      easeFactor = Math.min(3.5, currentEase + 0.15);
      intervalDays = currentInterval === 0 ? 4 : Math.max(4, Math.round(currentInterval * (easeFactor + 0.3)));
      delayMs = intervalDays * 24 * 60 * 60 * 1000;
      break;
    default:
      mastery = Math.min(5, currentMastery + 1);
      intervalDays = currentInterval === 0 ? 1 : Math.max(2, Math.round(currentInterval * currentEase));
      delayMs = intervalDays * 24 * 60 * 60 * 1000;
  }

  return {
    mastery,
    intervalDays,
    easeFactor: Math.round(easeFactor * 100) / 100,
    nextReviewAt: new Date(now.getTime() + delayMs),
    isLearned: mastery >= 1,
  };
};
