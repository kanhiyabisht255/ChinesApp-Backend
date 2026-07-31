import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Course, Lesson, Scenario } from '../models';
import { getMongoUri } from '../config/database';

dotenv.config();

const SCENARIOS_DATA = [
  { id: 's1', title: 'Ordering Food', titleCn: '点餐', pinyin: 'diǎn cān', description: 'Order food at a restaurant', icon: 'restaurant', difficulty: 'beginner', color: '#FFB340', isPremium: false, order: 1 },
  { id: 's2', title: 'Asking Directions', titleCn: '问路', pinyin: 'wèn lù', description: 'Ask for and give directions', icon: 'explore', difficulty: 'beginner', color: '#4A9FFF', isPremium: false, order: 2 },
  { id: 's3', title: 'Shopping', titleCn: '购物', pinyin: 'gòu wù', description: 'Buy items and bargain', icon: 'shopping_bag', difficulty: 'beginner', color: '#FF6BAA', isPremium: false, order: 3 },
  { id: 's4', title: 'At the Airport', titleCn: '在机场', pinyin: 'zài jī chǎng', description: 'Check-in and navigate airport', icon: 'flight', difficulty: 'elementary', color: '#3DDC84', isPremium: false, order: 4 },
  { id: 's5', title: 'Hotel Check-in', titleCn: '酒店入住', pinyin: 'jiǔ diàn rù zhù', description: 'Check into a hotel room', icon: 'hotel', difficulty: 'elementary', color: '#7F43FE', isPremium: false, order: 5 },
  { id: 's6', title: 'Making Friends', titleCn: '交朋友', pinyin: 'jiāo péng yǒu', description: 'Introduce yourself socially', icon: 'people', difficulty: 'elementary', color: '#3DDCC4', isPremium: false, order: 6 },
  { id: 's7', title: 'Doctor Visit', titleCn: '看医生', pinyin: 'kàn yī shēng', description: 'Describe symptoms to a doctor', icon: 'medical_services', difficulty: 'intermediate', color: '#FF5C5C', isPremium: true, order: 7 },
  { id: 's8', title: 'Job Interview', titleCn: '面试', pinyin: 'miàn shì', description: 'Practice a job interview', icon: 'work', difficulty: 'advanced', color: '#FF8C42', isPremium: true, order: 8 },
];

const COURSES_DATA = [
  { id: 'c1', title: 'Greetings & Basics', titleCn: '问候与基础', hskLevel: 1, description: 'Learn to greet people and introduce yourself', icon: 'waving_hand', color: '#3DDC84', isPremium: false, order: 1 },
  { id: 'c2', title: 'Numbers & Time', titleCn: '数字与时间', hskLevel: 1, description: 'Count, tell time, and talk about dates', icon: 'schedule', color: '#4A9FFF', isPremium: false, order: 2 },
  { id: 'c3', title: 'Family & Friends', titleCn: '家人与朋友', hskLevel: 2, description: 'Talk about your family and relationships', icon: 'family_restroom', color: '#7F43FE', isPremium: false, order: 3 },
  { id: 'c4', title: 'Food & Drink', titleCn: '饮食', hskLevel: 2, description: 'Order food and discuss meals', icon: 'restaurant', color: '#FFB340', isPremium: false, order: 4 },
  { id: 'c5', title: 'Travel & Transport', titleCn: '旅行与交通', hskLevel: 3, description: 'Navigate travel and transportation', icon: 'flight', color: '#3DDCC4', isPremium: true, order: 5 },
  { id: 'c6', title: 'Work & Business', titleCn: '工作与商务', hskLevel: 4, description: 'Professional Chinese for workplace', icon: 'work', color: '#FF6BAA', isPremium: true, order: 6 },
];

const LESSONS_DATA = [
  { courseId: 'c1', lessons: [
    { title: 'Hello', titleCn: '你好', pinyin: 'nǐ hǎo', description: 'Basic greeting', order: 1, vocab: [{ chinese: '你好', pinyin: 'nǐ hǎo', english: 'Hello', partOfSpeech: 'phrase' }] },
    { title: 'Thank You', titleCn: '谢谢', pinyin: 'xiè xie', description: 'Express gratitude', order: 2, vocab: [{ chinese: '谢谢', pinyin: 'xiè xie', english: 'Thank you', partOfSpeech: 'phrase' }] },
    { title: 'Goodbye', titleCn: '再见', pinyin: 'zài jiàn', description: 'Say farewell', order: 3, vocab: [{ chinese: '再见', pinyin: 'zài jiàn', english: 'Goodbye', partOfSpeech: 'phrase' }] },
    { title: 'My Name Is', titleCn: '我叫...', pinyin: 'wǒ jiào...', description: 'Introduce yourself', order: 4, vocab: [{ chinese: '我叫', pinyin: 'wǒ jiào', english: 'My name is', partOfSpeech: 'phrase' }, { chinese: '我', pinyin: 'wǒ', english: 'I/me', partOfSpeech: 'pronoun' }] },
    { title: 'Nice to Meet You', titleCn: '很高兴认识你', pinyin: 'hěn gāo xìng rèn shí nǐ', description: 'Polite meeting expression', order: 5, vocab: [{ chinese: '认识', pinyin: 'rèn shí', english: 'to know/meet', partOfSpeech: 'verb' }] },
    { title: 'Where are you from?', titleCn: '你是哪国人?', pinyin: 'nǐ shì nǎ guó rén?', description: 'Ask about nationality', order: 6, vocab: [{ chinese: '国', pinyin: 'guó', english: 'country', partOfSpeech: 'noun' }, { chinese: '人', pinyin: 'rén', english: 'person', partOfSpeech: 'noun' }] },
    { title: 'I am from India', titleCn: '我来自印度', pinyin: 'wǒ lái zì Yìn dù', description: 'Tell your origin', order: 7, vocab: [{ chinese: '来自', pinyin: 'lái zì', english: 'come from', partOfSpeech: 'verb' }, { chinese: '印度', pinyin: 'Yìn dù', english: 'India', partOfSpeech: 'noun' }] },
    { title: 'Please', titleCn: '请', pinyin: 'qǐng', description: 'Polite request word', order: 8, vocab: [{ chinese: '请', pinyin: 'qǐng', english: 'please', partOfSpeech: 'particle' }] },
  ]},
  { courseId: 'c2', lessons: [
    { title: 'One', titleCn: '一', pinyin: 'yī', description: 'The number one', order: 1, vocab: [{ chinese: '一', pinyin: 'yī', english: 'One', partOfSpeech: 'number' }] },
    { title: 'Two', titleCn: '二', pinyin: 'èr', description: 'The number two', order: 2, vocab: [{ chinese: '二', pinyin: 'èr', english: 'Two', partOfSpeech: 'number' }] },
    { title: 'Three', titleCn: '三', pinyin: 'sān', description: 'The number three', order: 3, vocab: [{ chinese: '三', pinyin: 'sān', english: 'Three', partOfSpeech: 'number' }] },
    { title: 'Ten', titleCn: '十', pinyin: 'shí', description: 'The number ten', order: 4, vocab: [{ chinese: '十', pinyin: 'shí', english: 'Ten', partOfSpeech: 'number' }] },
    { title: 'What time is it?', titleCn: '现在几点?', pinyin: 'xiàn zài jǐ diǎn?', description: 'Ask for the current time', order: 5, vocab: [{ chinese: '现在', pinyin: 'xiàn zài', english: 'now', partOfSpeech: 'adverb' }, { chinese: '时间', pinyin: 'shí jiān', english: 'time', partOfSpeech: 'noun' }] },
    { title: 'Today', titleCn: '今天', pinyin: 'jīn tiān', description: 'The current day', order: 6, vocab: [{ chinese: '今天', pinyin: 'jīn tiān', english: 'Today', partOfSpeech: 'noun' }] },
    { title: 'Tomorrow', titleCn: '明天', pinyin: 'míng tiān', description: 'The next day', order: 7, vocab: [{ chinese: '明天', pinyin: 'míng tiān', english: 'Tomorrow', partOfSpeech: 'noun' }] },
    { title: 'Monday', titleCn: '星期一', pinyin: 'xīng qī yī', description: 'First day of the week', order: 8, vocab: [{ chinese: '星期', pinyin: 'xīng qī', english: 'week', partOfSpeech: 'noun' }] },
    { title: 'Month', titleCn: '月', pinyin: 'yuè', description: 'Unit for months', order: 9, vocab: [{ chinese: '月', pinyin: 'yuè', english: 'Month/Moon', partOfSpeech: 'noun' }] },
    { title: 'Year', titleCn: '年', pinyin: 'nián', description: 'Unit for years', order: 10, vocab: [{ chinese: '年', pinyin: 'nián', english: 'Year', partOfSpeech: 'noun' }] },
  ]},
];

export const seedDatabase = async (): Promise<void> => {
  await mongoose.connect(getMongoUri());
  console.log('Connected to MongoDB');
  
  await Scenario.deleteMany({});
  await Course.deleteMany({});
  await Lesson.deleteMany({});
  
  console.log('Cleared existing data');
  
  for (const scenario of SCENARIOS_DATA) {
    await Scenario.create({
      ...scenario,
      dialogues: [],
    });
  }
  console.log(`Inserted ${SCENARIOS_DATA.length} scenarios`);
  
  for (const course of COURSES_DATA) {
    await Course.create({
      ...course,
      totalLessons: 0,
    });
  }
  console.log(`Inserted ${COURSES_DATA.length} courses`);
  
  for (const courseLessons of LESSONS_DATA) {
    const course = await Course.findOne({ order: courseLessons.courseId === 'c1' ? 1 : 2 });
    if (course) {
      for (const lesson of courseLessons.lessons) {
        await Lesson.create({
          courseId: course._id.toString(),
          ...lesson,
        });
      }
      await Course.findByIdAndUpdate(course._id, { totalLessons: courseLessons.lessons.length });
    }
  }
  console.log('Inserted lessons');
  
  await mongoose.disconnect();
  console.log('✅ Database seeded successfully!');
};

seedDatabase().catch(console.error);
