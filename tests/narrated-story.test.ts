import {
  applyStoryTimings,
  parseStorySegments,
  storyContentHash,
  storyTitleKey,
} from '../src/services/narrated-story.service';

const segments = [
  { chinese: '今天是星期六。', pinyin: 'Jīntiān shì xīngqīliù.', english: 'Today is Saturday.' },
  { chinese: '小明去公园散步。', pinyin: 'Xiǎomíng qù gōngyuán sànbù.', english: 'Xiaoming walks in the park.' },
];

describe('narrated story validation', () => {
  test('normalizes titles so visual duplicates share one key', () => {
    expect(storyTitleKey(' A New-Friend ')).toBe(storyTitleKey('a new friend'));
    expect(storyTitleKey('新 朋友')).toBe(storyTitleKey('新朋友'));
  });

  test('hashes normalized Chinese content independently of spacing', () => {
    expect(storyContentHash(segments)).toBe(storyContentHash([
      { chinese: ' 今天 是 星期六。 ' },
      { chinese: '小明去公园散步。' },
    ]));
  });

  test('hashes the same transcript independently of sentence splitting', () => {
    expect(storyContentHash(segments)).toBe(storyContentHash([
      { chinese: '今天是星期六。小明去公园散步。' },
    ]));
  });

  test('generates contiguous estimated timings that cover the audio', () => {
    const parsed = parseStorySegments(segments);
    const result = applyStoryTimings(parsed, 12_000);
    expect(result.timingMode).toBe('estimated');
    expect(result.segments[0].startMs).toBe(0);
    expect(result.segments[0].endMs).toBe(result.segments[1].startMs);
    expect(result.segments[1].endMs).toBe(12_000);
  });

  test('keeps valid manual sentence timings', () => {
    const parsed = parseStorySegments([
      { ...segments[0], startMs: 0, endMs: 4_000 },
      { ...segments[1], startMs: 4_000, endMs: 11_500 },
    ]);
    const result = applyStoryTimings(parsed, 12_000);
    expect(result.timingMode).toBe('manual');
    expect(result.segments[1].startMs).toBe(4_000);
  });

  test('rejects incomplete transcript rows before upload', () => {
    expect(() => parseStorySegments([{ chinese: '你好', pinyin: '', english: 'Hello' }])).toThrow(
      'Segment 1 requires Chinese, Pinyin and English text',
    );
  });
});
