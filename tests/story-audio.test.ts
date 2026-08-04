import {
  buildStoryParagraphs,
  extractAudioUrl,
  extractTaskId,
  storyContentHash,
} from '../src/services/story-audio.service';

describe('admin story audio helpers', () => {
  it('extracts provider task IDs from supported response shapes', () => {
    expect(extractTaskId({ task_id: 'task_1' })).toBe('task_1');
    expect(extractTaskId({ data: { taskId: 'task_2' } })).toBe('task_2');
    expect(extractTaskId({ task: { id: 42 } })).toBe('42');
  });

  it('prefers an audio-looking HTTPS result and rejects local URLs', () => {
    expect(extractAudioUrl({ data: { preview: 'https://cdn.example.com/result.mp3' } }))
      .toBe('https://cdn.example.com/result.mp3');
    expect(extractAudioUrl({ output: 'http://127.0.0.1/private.mp3' })).toBeUndefined();
  });

  it('creates deterministic duplicate hashes after whitespace normalization', () => {
    expect(storyContentHash('你好， 世界。')).toBe(storyContentHash('你好，   世界。'));
  });

  it('splits Chinese prose into manageable paragraphs without changing text', () => {
    const text = '小明今天去公园。天气很好！他在公园里认识了一个新朋友。';
    const paragraphs = buildStoryParagraphs(text);
    expect(paragraphs.length).toBeGreaterThan(0);
    expect(paragraphs.map(item => item.chinese).join('')).toBe(text);
    expect(paragraphs.every(item => item.pinyin === '' && item.english === '')).toBe(true);
  });
});
