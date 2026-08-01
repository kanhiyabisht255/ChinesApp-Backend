import { lookupDictionary, numberedPinyinToMarks } from '../src/services/dictionary.service';

describe('CC-CEDICT dictionary service', () => {
  test.each([
    ['zhong1 guo2', 'zhōng guó'],
    ['ni3 hao3', 'nǐ hǎo'],
    ['lü4', 'lǜ'],
    ['ma5', 'ma'],
  ])('converts numbered pinyin %s to tone marks', (numbered, marked) => {
    expect(numberedPinyinToMarks(numbered)).toBe(marked);
  });

  it('returns normalized dictionary data for a Chinese word', async () => {
    const result = await lookupDictionary('中国');

    expect(result.exactMatch).toBe(true);
    expect(result.entries).toEqual(expect.arrayContaining([
      expect.objectContaining({
        simplified: '中国',
        traditional: '中國',
        pinyinMarked: 'Zhōng guó',
      }),
    ]));
    expect(result.attribution.license).toContain('Attribution-ShareAlike');
  });

  it('breaks an unmatched phrase into useful dictionary segments', async () => {
    const result = await lookupDictionary('我最喜欢');

    expect(result.segments.map(segment => segment.text).join('')).toContain('喜欢');
  });
});
