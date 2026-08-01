import { SCENARIO_SEEDS } from './curriculum';
import { TOPIC_BLUEPRINTS } from './topic-blueprints';

const SCENARIO_TOPIC: Record<string, string> = {
  'meeting-someone': 'introducing-yourself',
  'ordering-drinks': 'drinks-and-beverages',
  restaurant: 'ordering-food',
  'fruit-market': 'fruits-and-vegetables',
  'asking-directions': 'directions',
  'hotel-checkin': 'hotel-checkin',
  airport: 'airport-and-flight',
  doctor: 'doctor-visit',
  'making-friends': 'making-friends',
  'work-meeting': 'business-meetings',
  'job-interview': 'job-interviews',
  'opinion-debate': 'agreeing-disagreeing',
};

const topicMap = new Map(TOPIC_BLUEPRINTS.map(topic => [topic.courseSlug, topic]));

export const QUALITY_SCENARIO_SEEDS = SCENARIO_SEEDS.map(scenario => {
  const courseSlug = SCENARIO_TOPIC[scenario.slug];
  const topic = topicMap.get(courseSlug);
  if (!topic) throw new Error(`Missing scenario topic for ${scenario.slug}: ${courseSlug}`);

  return {
    ...scenario,
    learningGoals: [
      `Open a realistic ${scenario.title.toLowerCase()} exchange`,
      `Respond with expressions from ${courseSlug.replace(/-/g, ' ')}`,
      'Receive one concise correction and try the line again',
    ],
    systemPrompt: [
      `Role-play the scenario “${scenario.title}” with a Mandarin learner.`,
      `Begin from this situation: ${topic.primary.english}`,
      `A natural reply is: ${topic.response.english}`,
      'Do not force the sample script; accept reasonable alternatives.',
      `Match vocabulary and speed to the learner's HSK level, keep each turn under two sentences,`,
      'and after the learner replies give at most one useful correction before continuing in character.',
    ].join(' '),
    dialogues: [
      {
        speaker: 'ai' as const,
        chinese: topic.primary.chinese,
        pinyin: topic.primary.pinyin,
        english: topic.primary.english,
        translations: topic.primary.localized,
      },
      {
        speaker: 'user' as const,
        chinese: topic.response.chinese,
        pinyin: topic.response.pinyin,
        english: topic.response.english,
        translations: topic.response.localized,
      },
    ],
  };
});
