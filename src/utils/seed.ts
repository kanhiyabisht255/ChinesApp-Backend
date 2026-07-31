import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Course, Lesson, Scenario } from '../models';
import { getMongoUri } from '../config/database';
import { COURSE_SEEDS, LESSON_SEEDS, SCENARIO_SEEDS } from '../content/curriculum';

dotenv.config();

/**
 * Seeds the curated curriculum without deleting production data by default.
 * Set SEED_RESET=true only when intentionally rebuilding these collections.
 */
export const seedDatabase = async (): Promise<void> => {
  await mongoose.connect(getMongoUri());
  console.log('Connected to MongoDB');

  if (process.env.SEED_RESET === 'true') {
    await Promise.all([
      Scenario.deleteMany({}),
      Course.deleteMany({}),
      Lesson.deleteMany({}),
    ]);
    console.log('SEED_RESET=true: cleared courses, lessons and scenarios');
  } else {
    // Hide legacy demo documents that do not have stable slugs, without deleting them.
    await Promise.all([
      Course.updateMany({ slug: { $exists: false } }, { $set: { isPublished: false } }),
      Lesson.updateMany({ slug: { $exists: false } }, { $set: { isPublished: false } }),
      Scenario.updateMany({ slug: { $exists: false } }, { $set: { isPublished: false } }),
    ]);
  }

  const courseIds = new Map<string, string>();
  for (const courseSeed of COURSE_SEEDS) {
    const course = await Course.findOneAndUpdate(
      { slug: courseSeed.slug },
      { $set: { ...courseSeed } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    courseIds.set(courseSeed.slug, course._id.toString());
  }

  const lessonsByCourse = new Map<string, number>();
  for (const lessonSeed of LESSON_SEEDS) {
    const courseId = courseIds.get(lessonSeed.courseSlug);
    if (!courseId) throw new Error(`Missing course for lesson ${lessonSeed.slug}`);

    const { courseSlug, ...lesson } = lessonSeed;
    await Lesson.findOneAndUpdate(
      { slug: lesson.slug },
      { $set: { ...lesson, courseId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    lessonsByCourse.set(courseSlug, (lessonsByCourse.get(courseSlug) || 0) + 1);
  }

  for (const courseSeed of COURSE_SEEDS) {
    await Course.updateOne(
      { slug: courseSeed.slug },
      { $set: { totalLessons: lessonsByCourse.get(courseSeed.slug) || 0 } }
    );
  }

  for (const scenarioSeed of SCENARIO_SEEDS) {
    await Scenario.findOneAndUpdate(
      { slug: scenarioSeed.slug },
      { $set: scenarioSeed },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  await mongoose.disconnect();
  console.log(`✅ Curriculum ready: ${COURSE_SEEDS.length} courses, ${LESSON_SEEDS.length} lessons, ${SCENARIO_SEEDS.length} scenarios`);
};

seedDatabase().catch(async (error) => {
  console.error('❌ Database seed failed:', error);
  await mongoose.disconnect().catch(() => undefined);
  process.exitCode = 1;
});
