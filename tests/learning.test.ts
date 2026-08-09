import { PLACEMENT_QUESTIONS } from '../src/content/placement';
import { focusTodayPlan, nextVocabularyReview, scorePlacementAnswers } from '../src/services/learning.service';

describe('personalized learning services', () => {
  it('keeps the placement test balanced across HSK levels and localized', () => {
    expect(PLACEMENT_QUESTIONS).toHaveLength(12);
    for (let hskLevel = 1; hskLevel <= 6; hskLevel += 1) {
      expect(PLACEMENT_QUESTIONS.filter(question => question.hskLevel === hskLevel)).toHaveLength(2);
    }
    PLACEMENT_QUESTIONS.forEach(question => {
      expect(Object.keys(question.prompt).sort()).toEqual(['en', 'es', 'hi', 'ja']);
      expect(question.options).toContain(question.answer);
      expect(new Set(question.options).size).toBe(question.options.length);
    });
  });

  it('places a new learner at HSK 1 even after lucky advanced answers', () => {
    const answers = PLACEMENT_QUESTIONS
      .filter(question => question.hskLevel > 1)
      .map(question => ({ questionId: question.id, answer: question.answer }));
    expect(scorePlacementAnswers(answers).hskLevel).toBe(1);
  });

  it('places a fully correct learner at HSK 6', () => {
    const answers = PLACEMENT_QUESTIONS.map(question => ({ questionId: question.id, answer: question.answer }));
    const result = scorePlacementAnswers(answers);
    expect(result.correct).toBe(12);
    expect(result.percentage).toBe(100);
    expect(result.hskLevel).toBe(6);
  });

  it('schedules difficult words sooner and easy words later', () => {
    const now = new Date('2026-08-04T00:00:00.000Z');
    const again = nextVocabularyReview({ mastery: 2, intervalDays: 3, easeFactor: 2.5 }, 'again', now);
    const hard = nextVocabularyReview({ mastery: 2, intervalDays: 3, easeFactor: 2.5 }, 'hard', now);
    const good = nextVocabularyReview({ mastery: 2, intervalDays: 3, easeFactor: 2.5 }, 'good', now);
    const easy = nextVocabularyReview({ mastery: 2, intervalDays: 3, easeFactor: 2.5 }, 'easy', now);

    expect(again.nextReviewAt.getTime()).toBeLessThan(hard.nextReviewAt.getTime());
    expect(hard.nextReviewAt.getTime()).toBeLessThan(good.nextReviewAt.getTime());
    expect(good.nextReviewAt.getTime()).toBeLessThan(easy.nextReviewAt.getTime());
    expect(again.mastery).toBe(1);
    expect(easy.mastery).toBe(4);
  });

  it('focuses the daily plan on one primary task, review, and optional practice', () => {
    const result = focusTodayPlan([
      { type: 'lesson', id: 'lesson-1', isCompleted: false },
      { type: 'review', id: 'review', isCompleted: false },
      { type: 'listening', id: 'listen-1', isCompleted: false },
      { type: 'reading', id: 'read-1', isCompleted: false },
      { type: 'speaking', id: 'speak-1', isCompleted: false },
    ]);

    expect(result.tasks.map(task => task.type)).toEqual(['lesson', 'review', 'listening']);
    expect(result.tasks.map(task => task.priority)).toEqual(['primary', 'review', 'bonus']);
    expect(result.additionalTasks.map(task => task.type)).toEqual(['reading', 'speaking']);
  });

  it('keeps today’s completed focus visible and chooses an unfinished bonus', () => {
    const result = focusTodayPlan([
      { type: 'lesson', id: 'lesson-1', isCompleted: true },
      { type: 'review', id: 'review', isCompleted: true },
      { type: 'listening', id: 'listen-1', isCompleted: false },
      { type: 'reading', id: 'read-1', isCompleted: false },
    ]);

    expect(result.tasks[0]).toMatchObject({ type: 'lesson', priority: 'primary', isCompleted: true });
    expect(result.tasks[1]).toMatchObject({ type: 'review', priority: 'review', isCompleted: true });
    expect(result.tasks[2]).toMatchObject({ type: 'listening', priority: 'bonus' });
  });
});
