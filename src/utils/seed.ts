import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { getMongoUri } from '../config/database';
import { syncCurriculum } from '../services/curriculum.service';

dotenv.config();

/** Synchronizes packaged curriculum without deleting admin-created content. */
export const seedDatabase = async (): Promise<void> => {
  await mongoose.connect(getMongoUri());
  console.log('Connected to MongoDB');

  const stats = await syncCurriculum();

  await mongoose.disconnect();
  console.log(`✅ Curriculum ready: ${stats.courses} courses, ${stats.lessons} lessons, ${stats.exercises} exercises, ${stats.scenarios} scenarios, ${stats.readingStories} reading stories, ${stats.vocabulary.topics} vocabulary topics, ${stats.vocabulary.words} unique words`);
};

seedDatabase().catch(async (error) => {
  console.error('❌ Database seed failed:', error);
  await mongoose.disconnect().catch(() => undefined);
  process.exitCode = 1;
});
