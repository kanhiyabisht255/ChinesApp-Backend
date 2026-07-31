import { COURSE_SEEDS, LESSON_SEEDS, SCENARIO_SEEDS } from './curriculum';
import {
  EXPANDED_COURSE_SEEDS,
  EXPANDED_LESSON_SEEDS,
  EXPANDED_SCENARIO_SEEDS,
} from './expanded-curriculum';

export const CURRICULUM_VERSION = '2026.08.1';

export const ALL_COURSE_SEEDS = [...COURSE_SEEDS, ...EXPANDED_COURSE_SEEDS];
export const ALL_LESSON_SEEDS = [...LESSON_SEEDS, ...EXPANDED_LESSON_SEEDS];
export const ALL_SCENARIO_SEEDS = [...SCENARIO_SEEDS, ...EXPANDED_SCENARIO_SEEDS];

export const CURRICULUM_CATALOG_STATS = {
  version: CURRICULUM_VERSION,
  courses: ALL_COURSE_SEEDS.length,
  lessons: ALL_LESSON_SEEDS.length,
  scenarios: ALL_SCENARIO_SEEDS.length,
  exercises: ALL_LESSON_SEEDS.reduce((total, lesson) => total + lesson.exercises.length, 0),
  freeCourses: ALL_COURSE_SEEDS.filter(course => !course.isPremium).length,
  premiumCourses: ALL_COURSE_SEEDS.filter(course => course.isPremium).length,
  supportedLanguages: ['en', 'hi', 'es', 'ja'],
} as const;

