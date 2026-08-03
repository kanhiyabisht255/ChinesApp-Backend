import { VocabularyTopic, VocabularyWord } from '../models';
import {
  VOCABULARY_CATALOG_STATS,
  VOCABULARY_TOPIC_SEEDS,
  VOCABULARY_VERSION,
  VOCABULARY_WORD_SEEDS,
} from '../content/vocabulary';

export const syncVocabulary = async () => {
  await Promise.all([
    VocabularyWord.deleteMany({
      source: 'packaged',
      slug: { $nin: VOCABULARY_WORD_SEEDS.map(word => word.slug) },
    }),
    VocabularyTopic.deleteMany({
      source: 'packaged',
      slug: { $nin: VOCABULARY_TOPIC_SEEDS.map(topic => topic.slug) },
    }),
  ]);

  if (VOCABULARY_TOPIC_SEEDS.length > 0) {
    await VocabularyTopic.bulkWrite(
      VOCABULARY_TOPIC_SEEDS.map(topic => ({
        updateOne: {
          filter: { slug: topic.slug },
          update: {
            $set: {
              ...topic,
              source: 'packaged',
              contentVersion: VOCABULARY_VERSION,
            },
          },
          upsert: true,
        },
      })) as never,
      { ordered: false },
    );
  }

  const storedTopics = await VocabularyTopic.find({
    slug: { $in: VOCABULARY_TOPIC_SEEDS.map(topic => topic.slug) },
  }).select('_id slug');
  const topicIds = new Map(storedTopics.map(topic => [topic.slug, topic._id.toString()]));

  if (VOCABULARY_WORD_SEEDS.length > 0) {
    await VocabularyWord.bulkWrite(
      VOCABULARY_WORD_SEEDS.map(wordSeed => {
        const topicId = topicIds.get(wordSeed.topicSlug);
        if (!topicId) throw new Error(`Missing vocabulary topic ${wordSeed.topicSlug}`);
        const { topicSlug: _topicSlug, ...word } = wordSeed;
        return {
          updateOne: {
            filter: { slug: word.slug },
            update: {
              $set: {
                ...word,
                topicId,
                source: 'packaged',
                contentVersion: VOCABULARY_VERSION,
              },
            },
            upsert: true,
          },
        };
      }) as never,
      { ordered: false },
    );
  }

  return VOCABULARY_CATALOG_STATS;
};

export const getVocabularyStats = async () => {
  const [topics, words, publishedTopics, publishedWords] = await Promise.all([
    VocabularyTopic.countDocuments({ source: 'packaged' }),
    VocabularyWord.countDocuments({ source: 'packaged' }),
    VocabularyTopic.countDocuments({ source: 'packaged', isPublished: true }),
    VocabularyWord.countDocuments({ source: 'packaged', isPublished: true }),
  ]);
  return {
    catalog: VOCABULARY_CATALOG_STATS,
    database: {
      topics,
      words,
      publishedTopics,
      publishedWords,
      isCurrent:
        topics === VOCABULARY_CATALOG_STATS.topics &&
        words === VOCABULARY_CATALOG_STATS.words,
    },
  };
};
