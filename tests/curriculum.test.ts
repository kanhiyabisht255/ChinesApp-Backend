import {
  ALL_COURSE_SEEDS,
  ALL_LESSON_SEEDS,
  ALL_SCENARIO_SEEDS,
  ALL_LISTENING_LESSON_SEEDS,
  CURRICULUM_CATALOG_STATS,
} from '../src/content/catalog';

const hasUniqueSlugs = (items: Array<{ slug: string }>) =>
  new Set(items.map(item => item.slug)).size === items.length;

describe('production curriculum catalog', () => {
  it('contains a marketable amount of structured content', () => {
    expect(CURRICULUM_CATALOG_STATS.courses).toBeGreaterThanOrEqual(28);
    expect(CURRICULUM_CATALOG_STATS.lessons).toBeGreaterThanOrEqual(180);
    expect(CURRICULUM_CATALOG_STATS.exercises).toBeGreaterThanOrEqual(1000);
    expect(CURRICULUM_CATALOG_STATS.scenarios).toBeGreaterThanOrEqual(30);
    expect(CURRICULUM_CATALOG_STATS.listeningLessons).toBeGreaterThanOrEqual(18);
  });

  it('uses stable unique slugs for safe idempotent syncing', () => {
    expect(hasUniqueSlugs(ALL_COURSE_SEEDS)).toBe(true);
    expect(hasUniqueSlugs(ALL_LESSON_SEEDS)).toBe(true);
    expect(hasUniqueSlugs(ALL_SCENARIO_SEEDS)).toBe(true);
    expect(hasUniqueSlugs(ALL_LISTENING_LESSON_SEEDS)).toBe(true);
  });

  it('includes graded, non-empty listening practice for every HSK level', () => {
    for (let hskLevel = 1; hskLevel <= 6; hskLevel += 1) {
      expect(ALL_LISTENING_LESSON_SEEDS.filter(item => item.hskLevel === hskLevel).length).toBeGreaterThanOrEqual(3);
    }
    for (const item of ALL_LISTENING_LESSON_SEEDS) {
      expect(item.segments.length).toBeGreaterThanOrEqual(3);
      expect(item.questions.length).toBeGreaterThanOrEqual(3);
      expect(item.questions.every(question => question.answer.trim().length > 0)).toBe(true);
    }
  });

  it('links every lesson to a real course and includes practice content', () => {
    const courseSlugs = new Set(ALL_COURSE_SEEDS.map(course => course.slug));

    for (const lesson of ALL_LESSON_SEEDS) {
      expect(courseSlugs.has(lesson.courseSlug)).toBe(true);
      expect(lesson.vocab.length).toBeGreaterThan(0);
      expect(lesson.exercises.length).toBeGreaterThan(0);
      expect(lesson.exercises.every(exercise => exercise.answer.trim().length > 0)).toBe(true);
    }
  });

  it('gives every course lessons and keeps a useful free catalog', () => {
    const lessonsPerCourse = ALL_LESSON_SEEDS.reduce((counts, lesson) => {
      counts.set(lesson.courseSlug, (counts.get(lesson.courseSlug) || 0) + 1);
      return counts;
    }, new Map<string, number>());

    for (const course of ALL_COURSE_SEEDS) {
      expect(lessonsPerCourse.get(course.slug)).toBeGreaterThan(0);
    }

    expect(CURRICULUM_CATALOG_STATS.freeCourses).toBeGreaterThanOrEqual(8);
    expect(CURRICULUM_CATALOG_STATS.premiumCourses).toBeGreaterThan(
      CURRICULUM_CATALOG_STATS.freeCourses
    );
  });

  it('provides multilingual metadata for supported learners', () => {
    for (const course of ALL_COURSE_SEEDS) {
      expect(course.supportedLanguages).toEqual(expect.arrayContaining(['en', 'hi', 'es', 'ja']));
      expect(course.translations.hi.title).toBeTruthy();
      expect(course.translations.es.title).toBeTruthy();
      expect(course.translations.ja.title).toBeTruthy();
    }
  });
});
