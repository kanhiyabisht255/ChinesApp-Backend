import type { ClientSession } from 'mongoose';
import { User } from '../models';

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_TIMEZONE_OFFSET = -12 * 60;
const MAX_TIMEZONE_OFFSET = 14 * 60;

export const normalizeTimezoneOffset = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(Math.max(MIN_TIMEZONE_OFFSET, Math.min(parsed, MAX_TIMEZONE_OFFSET)));
};

const localDayNumber = (date: Date, timezoneOffsetMinutes: number): number =>
  Math.floor((date.getTime() + normalizeTimezoneOffset(timezoneOffsetMinutes) * 60_000) / DAY_MS);

export const daysBetweenLocalDates = (
  previous: Date,
  current: Date,
  timezoneOffsetMinutes: number,
): number => localDayNumber(current, timezoneOffsetMinutes) - localDayNumber(previous, timezoneOffsetMinutes);

/** Monday = 0 ... Sunday = 6 in the learner's local timezone. */
export const localWeekdayIndex = (date: Date, timezoneOffsetMinutes: number): number => {
  const shifted = new Date(date.getTime() + normalizeTimezoneOffset(timezoneOffsetMinutes) * 60_000);
  return (shifted.getUTCDay() + 6) % 7;
};

export const localWeekKey = (date: Date, timezoneOffsetMinutes: number): string => {
  const shifted = new Date(date.getTime() + normalizeTimezoneOffset(timezoneOffsetMinutes) * 60_000);
  shifted.setUTCDate(shifted.getUTCDate() - ((shifted.getUTCDay() + 6) % 7));
  return shifted.toISOString().slice(0, 10);
};

export const streakAfterLearningActivity = (
  currentStreak: number,
  lastStreakDate: Date | null | undefined,
  now: Date,
  timezoneOffsetMinutes: number,
): number => {
  if (!lastStreakDate) return 1;

  const dayDifference = daysBetweenLocalDates(lastStreakDate, now, timezoneOffsetMinutes);
  if (dayDifference <= 0) return Math.max(1, currentStreak);
  if (dayDifference === 1) return Math.max(0, currentStreak) + 1;
  return 1;
};

export const visibleStreak = (
  currentStreak: number,
  lastStreakDate: Date | null | undefined,
  now: Date,
  timezoneOffsetMinutes: number,
): number => {
  if (!lastStreakDate || currentStreak <= 0) return 0;
  return daysBetweenLocalDates(lastStreakDate, now, timezoneOffsetMinutes) > 1
    ? 0
    : currentStreak;
};

export const visibleTodayMinutes = (
  todayMinutes: number,
  lastDailyProgressDate: Date | null | undefined,
  now: Date,
  timezoneOffsetMinutes: number,
): number => {
  if (!lastDailyProgressDate || todayMinutes <= 0) return 0;
  return daysBetweenLocalDates(lastDailyProgressDate, now, timezoneOffsetMinutes) === 0
    ? todayMinutes
    : 0;
};

export const recordLearningActivity = async (
  userId: string | undefined,
  timezoneOffsetMinutes: number,
  now = new Date(),
  session?: ClientSession,
  learningMinutes = 0,
): Promise<number | null> => {
  if (!userId) return null;
  const query = User.findById(userId);
  if (session) query.session(session);
  const user = await query;
  if (!user) return null;

  const streak = streakAfterLearningActivity(
    user.streak,
    user.lastStreakDate,
    now,
    timezoneOffsetMinutes,
  );
  const previousMinutes = visibleTodayMinutes(
    user.todayMinutes,
    user.lastDailyProgressDate,
    now,
    timezoneOffsetMinutes,
  );
  const todayMinutes = Math.min(
    24 * 60,
    previousMinutes + Math.max(0, Math.round(learningMinutes)),
  );

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        streak,
        lastStreakDate: now,
        todayMinutes,
        lastDailyProgressDate: now,
      },
    },
    session ? { session } : undefined,
  );
  return streak;
};
