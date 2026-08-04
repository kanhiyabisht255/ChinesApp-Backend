import { buildVoiceCallContext, buildVoiceCallReport } from '../src/services/voice-session.service';
import type { ITranscriptItem } from '../src/types';

const turn = (value: Partial<ITranscriptItem> & Pick<ITranscriptItem, 'role' | 'chinese'>): ITranscriptItem => ({
  pinyin: '',
  english: '',
  timestamp: Date.now(),
  ...value,
});

describe('voice session learning report', () => {
  it('uses server-recorded phrase scores and corrections', () => {
    const transcript = [
      turn({ role: 'ai', chinese: '你今天想做什么？' }),
      turn({ role: 'user', chinese: '我想去公园。', pronunciationScore: 80 }),
      turn({ role: 'ai', chinese: '很好！', correction: 'Use 想去 instead of 想到 for this destination.' }),
      turn({ role: 'user', chinese: '我下午去。', pronunciationScore: 90 }),
    ];
    const report = buildVoiceCallReport(transcript, 125, 10);

    expect(report.score).toBe(85);
    expect(report.speakingTurns).toBe(2);
    expect(report.strengths).toContain('You maintained focused speaking practice for at least two minutes.');
    expect(report.focusAreas[0]).toContain('想去');
  });

  it('does not invent pronunciation quality when no guided score exists', () => {
    const transcript = [
      turn({ role: 'ai', chinese: '你好！' }),
      turn({ role: 'user', chinese: '你好！' }),
    ];
    const report = buildVoiceCallReport(transcript, 35, 0);

    expect(report.score).toBe(0);
    expect(report.speakingTurns).toBe(1);
    expect(report.focusAreas).toContain('Next time, aim for at least three complete answers.');
  });

  it('builds bounded role-aware context', () => {
    const transcript = Array.from({ length: 15 }, (_, index) =>
      turn({ role: index % 2 === 0 ? 'ai' : 'user', chinese: `line ${index}` })
    );
    const context = buildVoiceCallContext(transcript);

    expect(context).toHaveLength(12);
    expect(context[0]).toBe('Learner: line 3');
    expect(context.at(-1)).toBe('Ling: line 14');
  });
});
