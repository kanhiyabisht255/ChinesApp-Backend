import {
  VOCABULARY_CATALOG_STATS,
  VOCABULARY_TOPIC_SEEDS,
  VOCABULARY_WORD_SEEDS,
} from '../src/content/vocabulary';

describe('dedicated vocabulary catalog', () => {
  it('contains substantial topic-based content', () => {
    expect(VOCABULARY_CATALOG_STATS.topics).toBeGreaterThanOrEqual(12);
    expect(VOCABULARY_CATALOG_STATS.words).toBeGreaterThanOrEqual(96);
    expect(VOCABULARY_CATALOG_STATS.freeTopics).toBeGreaterThanOrEqual(6);
  });

  it('has no repeated learning items', () => {
    const fingerprints = VOCABULARY_WORD_SEEDS.map(word => word.fingerprint);
    const slugs = VOCABULARY_WORD_SEEDS.map(word => word.slug);
    expect(new Set(fingerprints).size).toBe(fingerprints.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('gives every word pronunciation, meaning and a complete example', () => {
    VOCABULARY_WORD_SEEDS.forEach(word => {
      expect(word.chinese.trim()).not.toBe('');
      expect(word.pinyin.trim()).not.toBe('');
      expect(word.english.trim()).not.toBe('');
      expect(word.exampleChinese).toMatch(/[。！？?！]$/);
      expect(word.examplePinyin.trim()).not.toBe('');
      expect(word.exampleEnglish.trim()).not.toBe('');
      expect(Object.keys(word.translations).sort()).toEqual(['es', 'hi', 'ja']);
    });
  });

  it('keeps every word attached to a real topic', () => {
    const topicSlugs = new Set(VOCABULARY_TOPIC_SEEDS.map(topic => topic.slug));
    VOCABULARY_WORD_SEEDS.forEach(word => expect(topicSlugs.has(word.topicSlug)).toBe(true));
  });
});
