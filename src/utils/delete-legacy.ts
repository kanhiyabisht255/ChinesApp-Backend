import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getMongoUri } from '../config/database';
import { Course, Lesson, Scenario } from '../models';

dotenv.config();

const deleteLegacyContent = async (): Promise<void> => {
  await mongoose.connect(getMongoUri());
  console.log('Connected to MongoDB');

  const courses = await Course.find({ source: { $ne: 'packaged' } });
  console.log(`Found ${courses.length} legacy courses to delete`);
  for (const course of courses) {
    const deletedLessons = await Lesson.deleteMany({ courseId: course._id.toString() });
    console.log(`  Deleted course "${course.title}" and ${deletedLessons.deletedCount} lessons`);
    await Course.findByIdAndDelete(course._id);
  }

  const lessons = await Lesson.find({ source: { $ne: 'packaged' } });
  console.log(`Found ${lessons.length} legacy lessons without course`);
  await Lesson.deleteMany({ source: { $ne: 'packaged' } });

  const scenarios = await Scenario.find({ source: { $ne: 'packaged' } });
  console.log(`Found ${scenarios.length} legacy scenarios to delete`);
  for (const scenario of scenarios) {
    console.log(`  Deleted scenario "${scenario.title}"`);
  }
  await Scenario.deleteMany({ source: { $ne: 'packaged' } });

  await mongoose.disconnect();
  console.log('✅ Legacy content deleted');
};

deleteLegacyContent().catch(async (error) => {
  console.error('❌ Delete failed:', error);
  await mongoose.disconnect().catch(() => undefined);
  process.exitCode = 1;
});