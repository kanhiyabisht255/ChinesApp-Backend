import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getMongoUri } from '../config/database';
import { Course, Lesson } from '../models';
import { ALL_COURSE_SEEDS } from '../content/catalog';

dotenv.config();

const deleteOrphanedCourses = async (): Promise<void> => {
  await mongoose.connect(getMongoUri());
  console.log('Connected to MongoDB');

  const validSlugs = new Set(ALL_COURSE_SEEDS.map(c => c.slug));
  console.log(`Valid course slugs: ${validSlugs.size}`);

  const allCourses = await Course.find({});
  console.log(`Total courses in DB: ${allCourses.length}`);

  const orphaned = allCourses.filter(c => !validSlugs.has(c.slug));
  console.log(`Orphaned courses to delete: ${orphaned.length}`);

  for (const course of orphaned) {
    const deletedLessons = await Lesson.deleteMany({ courseId: course._id.toString() });
    console.log(`  Deleted "${course.title}" (slug: ${course.slug}) and ${deletedLessons.deletedCount} lessons`);
    await Course.findByIdAndDelete(course._id);
  }

  const remaining = await Course.countDocuments();
  console.log(`Remaining courses: ${remaining}`);
  await mongoose.disconnect();
  console.log('✅ Orphaned courses deleted');
};

deleteOrphanedCourses().catch(async (error) => {
  console.error('❌ Delete failed:', error);
  await mongoose.disconnect().catch(() => undefined);
  process.exitCode = 1;
});