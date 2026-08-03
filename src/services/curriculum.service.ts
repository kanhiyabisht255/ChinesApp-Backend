import { Course, Lesson, Scenario } from '../models';
import {
  ALL_COURSE_SEEDS,
  ALL_LESSON_SEEDS,
  ALL_SCENARIO_SEEDS,
  CURRICULUM_CATALOG_STATS,
  CURRICULUM_VERSION,
} from '../content/catalog';
import { getVocabularyStats, syncVocabulary } from './vocabulary.service';

type SyncOptions = {
  hideLegacy?: boolean;
};

export const syncCurriculum = async (options: SyncOptions = {}) => {
  const hideLegacy = options.hideLegacy ?? true;

  // Packaged content is version-controlled. Remove only packaged records that no longer
  // exist in the catalog; admin-created content is preserved (and optionally hidden).
  await Promise.all([
    Lesson.deleteMany({
      source: 'packaged',
      slug: { $nin: ALL_LESSON_SEEDS.map(lesson => lesson.slug) },
    }),
    Scenario.deleteMany({
      source: 'packaged',
      slug: { $nin: ALL_SCENARIO_SEEDS.map(scenario => scenario.slug) },
    }),
    Course.deleteMany({
      source: 'packaged',
      slug: { $nin: ALL_COURSE_SEEDS.map(course => course.slug) },
    }),
  ]);

  if (hideLegacy) {
    await Promise.all([
      Course.updateMany({ source: { $ne: 'packaged' } }, { $set: { isPublished: false } }),
      Lesson.updateMany({ source: { $ne: 'packaged' } }, { $set: { isPublished: false } }),
      Scenario.updateMany({ source: { $ne: 'packaged' } }, { $set: { isPublished: false } }),
    ]);
  }

  const sortedCourseSeeds = [...ALL_COURSE_SEEDS]
    .sort((a, b) => a.hskLevel - b.hskLevel || a.order - b.order)
    .map((course, index) => ({ ...course, order: index + 1 }));

  const courseOperations = sortedCourseSeeds.map(course => ({
      updateOne: {
        filter: { slug: course.slug },
        update: {
          $set: {
            ...course,
            source: 'packaged',
            contentVersion: CURRICULUM_VERSION,
          },
        },
        upsert: true,
      },
    }));
  await Course.bulkWrite(courseOperations as never, { ordered: false });

  const storedCourses = await Course.find({
    slug: { $in: sortedCourseSeeds.map(course => course.slug) },
  }).select('_id slug');
  const courseIds = new Map(storedCourses.map(course => [course.slug, course._id.toString()]));

  const lessonOperations = ALL_LESSON_SEEDS.map(lessonSeed => {
      const courseId = courseIds.get(lessonSeed.courseSlug);
      if (!courseId) throw new Error(`Missing course for lesson ${lessonSeed.slug}`);
      const { courseSlug: _courseSlug, ...lesson } = lessonSeed;
      return {
        updateOne: {
          filter: { slug: lesson.slug },
          update: {
            $set: {
              ...lesson,
              courseId,
              source: 'packaged',
              contentVersion: CURRICULUM_VERSION,
            },
          },
          upsert: true,
        },
      };
    });
  await Lesson.bulkWrite(lessonOperations as never, { ordered: false });

  const lessonsByCourse = ALL_LESSON_SEEDS.reduce((counts, lesson) => {
    counts.set(lesson.courseSlug, (counts.get(lesson.courseSlug) || 0) + 1);
    return counts;
  }, new Map<string, number>());

  await Course.bulkWrite(
    sortedCourseSeeds.map(course => ({
      updateOne: {
        filter: { slug: course.slug },
        update: { $set: { totalLessons: lessonsByCourse.get(course.slug) || 0 } },
      },
    })),
    { ordered: false }
  );

  const scenarioOperations = ALL_SCENARIO_SEEDS.map(scenario => ({
      updateOne: {
        filter: { slug: scenario.slug },
        update: {
          $set: {
            ...scenario,
            source: 'packaged',
            contentVersion: CURRICULUM_VERSION,
          },
        },
        upsert: true,
      },
    }));
  await Scenario.bulkWrite(scenarioOperations as never, { ordered: false });

  const vocabulary = await syncVocabulary();

  return { ...CURRICULUM_CATALOG_STATS, vocabulary };
};

export const getCurriculumStats = async () => {
  const [courses, lessons, scenarios, publishedCourses, publishedLessons, publishedScenarios] =
    await Promise.all([
      Course.countDocuments({ source: 'packaged' }),
      Lesson.countDocuments({ source: 'packaged' }),
      Scenario.countDocuments({ source: 'packaged' }),
      Course.countDocuments({ source: 'packaged', isPublished: true }),
      Lesson.countDocuments({ source: 'packaged', isPublished: true }),
      Scenario.countDocuments({ source: 'packaged', isPublished: true }),
    ]);

  const vocabulary = await getVocabularyStats();
  return {
    catalog: CURRICULUM_CATALOG_STATS,
    vocabulary,
    database: {
      courses,
      lessons,
      scenarios,
      publishedCourses,
      publishedLessons,
      publishedScenarios,
      isCurrent:
        courses === CURRICULUM_CATALOG_STATS.courses &&
        lessons === CURRICULUM_CATALOG_STATS.lessons &&
        scenarios === CURRICULUM_CATALOG_STATS.scenarios,
    },
  };
};
