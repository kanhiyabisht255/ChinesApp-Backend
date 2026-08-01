import {
  daysBetweenLocalDates,
  normalizeTimezoneOffset,
  streakAfterLearningActivity,
  visibleStreak,
} from '../src/services/streak.service';

describe('daily learning streak', () => {
  test('starts at one after the first learning activity', () => {
    expect(streakAfterLearningActivity(0, undefined, new Date('2026-08-02T10:00:00Z'), 0)).toBe(1);
  });

  test('increments only once on consecutive local days', () => {
    const yesterday = new Date('2026-08-01T10:00:00Z');
    expect(streakAfterLearningActivity(4, yesterday, new Date('2026-08-02T09:00:00Z'), 0)).toBe(5);
    expect(streakAfterLearningActivity(5, new Date('2026-08-02T09:00:00Z'), new Date('2026-08-02T20:00:00Z'), 0)).toBe(5);
  });

  test('resets to one when a learning day was missed', () => {
    expect(streakAfterLearningActivity(12, new Date('2026-07-30T10:00:00Z'), new Date('2026-08-02T10:00:00Z'), 0)).toBe(1);
  });

  test('shows zero after the streak has expired', () => {
    expect(visibleStreak(7, new Date('2026-07-30T10:00:00Z'), new Date('2026-08-02T10:00:00Z'), 0)).toBe(0);
    expect(visibleStreak(7, new Date('2026-08-01T10:00:00Z'), new Date('2026-08-02T10:00:00Z'), 0)).toBe(7);
  });

  test('uses the learner timezone instead of the Railway server timezone', () => {
    const previous = new Date('2026-08-01T18:20:00Z');
    const current = new Date('2026-08-01T18:40:00Z');
    expect(daysBetweenLocalDates(previous, current, 330)).toBe(1);
    expect(daysBetweenLocalDates(previous, current, 0)).toBe(0);
  });

  test('clamps invalid timezone offsets', () => {
    expect(normalizeTimezoneOffset('not-a-number')).toBe(0);
    expect(normalizeTimezoneOffset(2_000)).toBe(840);
    expect(normalizeTimezoneOffset(-2_000)).toBe(-720);
  });
});
