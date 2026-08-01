import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getMongoUri } from '../config/database';
import { Course, Lesson, Scenario } from '../models';

dotenv.config();

const reorder = async (): Promise<void> => {
  await mongoose.connect(getMongoUri());
  console.log('Connected to MongoDB');

  const courses = await Course.find({ isPublished: true }).sort({ hskLevel: 1, order: 1 });
  console.log(`Found ${courses.length} courses to reorder by HSK level`);

  let count = 0;
  for (let i = 0; i < courses.length; i++) {
    const newOrder = i + 1;
    if (courses[i].order !== newOrder) {
      await Course.findByIdAndUpdate(courses[i]._id, { $set: { order: newOrder } });
      count++;
      console.log(`  ${courses[i].title} (HSK${courses[i].hskLevel}): ${courses[i].order} -> ${newOrder}`);
    }
  }
  console.log(`Reordered ${count} courses`);

  const lessons = await Lesson.find({ isPublished: true }).sort({ courseId: 1, order: 1 });
  console.log(`Found ${lessons.length} lessons to reorder`);
  let lessonCount = 0;
  let currentCourseId: string | null = null;
  let lessonIndex = 0;
  for (const lesson of lessons) {
    if (lesson.courseId !== currentCourseId) {
      currentCourseId = lesson.courseId;
      lessonIndex = 0;
    }
    lessonIndex++;
    if (lesson.order !== lessonIndex) {
      await Lesson.findByIdAndUpdate(lesson._id, { $set: { order: lessonIndex } });
      lessonCount++;
    }
  }
  console.log(`Reordered ${lessonCount} lessons`);

  const scenarios = await Scenario.find({ isPublished: true }).sort({ order: 1 });
  console.log(`Found ${scenarios.length} scenarios`);
  let scenarioCount = 0;
  for (let i = 0; i < scenarios.length; i++) {
    const newOrder = i + 1;
    if (scenarios[i].order !== newOrder) {
      await Scenario.findByIdAndUpdate(scenarios[i]._id, { $set: { order: newOrder } });
      scenarioCount++;
    }
  }
  console.log(`Reordered ${scenarioCount} scenarios`);

  await mongoose.disconnect();
  console.log('✅ Reorder complete');
};

reorder().catch(async (error) => {
  console.error('❌ Reorder failed:', error);
  await mongoose.disconnect().catch(() => undefined);
  process.exitCode = 1;
});