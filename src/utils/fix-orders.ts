import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getMongoUri } from '../config/database';
import { Course, Lesson, Scenario } from '../models';

dotenv.config();

const fixOrders = async (): Promise<void> => {
  await mongoose.connect(getMongoUri());
  console.log('Connected to MongoDB');

  const courses = await Course.find().sort({ order: 1, createdAt: 1 });
  console.log(`Found ${courses.length} courses`);

  let courseCount = 0;
  for (let i = 0; i < courses.length; i++) {
    const newOrder = i + 1;
    if (courses[i].order !== newOrder) {
      await Course.findByIdAndUpdate(courses[i]._id, { $set: { order: newOrder } });
      courseCount++;
      console.log(`  Course "${courses[i].title}" order: ${courses[i].order} -> ${newOrder}`);
    }
  }
  console.log(`Fixed ${courseCount} course order values`);

  const lessons = await Lesson.find().sort({ courseId: 1, order: 1, createdAt: 1 });
  console.log(`Found ${lessons.length} lessons`);

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
  console.log(`Fixed ${lessonCount} lesson order values`);

  const scenarios = await Scenario.find().sort({ order: 1, createdAt: 1 });
  console.log(`Found ${scenarios.length} scenarios`);

  let scenarioCount = 0;
  for (let i = 0; i < scenarios.length; i++) {
    const newOrder = i + 1;
    if (scenarios[i].order !== newOrder) {
      await Scenario.findByIdAndUpdate(scenarios[i]._id, { $set: { order: newOrder } });
      scenarioCount++;
      console.log(`  Scenario "${scenarios[i].title}" order: ${scenarios[i].order} -> ${newOrder}`);
    }
  }
  console.log(`Fixed ${scenarioCount} scenario order values`);

  await mongoose.disconnect();
  console.log('✅ Order fix complete');
};

fixOrders().catch(async (error) => {
  console.error('❌ Order fix failed:', error);
  await mongoose.disconnect().catch(() => undefined);
  process.exitCode = 1;
});