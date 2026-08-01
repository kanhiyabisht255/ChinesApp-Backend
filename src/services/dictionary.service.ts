import { createHash } from 'crypto';
import { readFile } from 'fs/promises';
import path from 'path';
import { gunzip } from 'zlib';
import { promisify } from 'util';

const DICTIONARY_PACKAGE_VERSION = '1.1.1';
const SHARD_COUNT = 64;
const MAX_BUCKET_CACHE = 12;
const MAX_RESULT_CACHE = 1_000;
const MAX_SEGMENT_LENGTH = 8;
const gunzipAsync = promisify(gunzip);

type CompactClassifier = [traditional: string, simplified: string, pinyin: string];
type CompactVariant = [traditional: string, simplified: string, pinyin: string];
type CompactEntry = [
  traditional: string,
  simplified: string,
  pinyin: string,
  definitions: string[],
  classifiers: CompactClassifier[],
  variants: CompactVariant[],
  isVariant: 0 | 1,
];
type DictionaryBucket = Record<string, CompactEntry[]>;

export interface DictionaryClassifierResult {
  traditional: string;
  simplified: string;
  pinyinNumbered: string;
  pinyinMarked: string;
}

export interface DictionaryEntryResult {
  traditional: string;
  simplified: string;
  pinyinNumbered: string;
  pinyinMarked: string;
  definitions: string[];
  classifiers: DictionaryClassifierResult[];
  variants: Array<{
    traditional: string;
    simplified: string;
    pinyinNumbered: string;
    pinyinMarked: string;
  }>;
  isVariant: boolean;
}

export interface DictionarySegmentResult {
  text: string;
  entries: DictionaryEntryResult[];
}

export interface DictionaryLookupResult {
  query: string;
  exactMatch: boolean;
  entries: DictionaryEntryResult[];
  segments: DictionarySegmentResult[];
  attribution: typeof DICTIONARY_ATTRIBUTION;
}

export const DICTIONARY_ATTRIBUTION = {
  name: 'CC-CEDICT',
  description: 'Community-maintained Chinese-English dictionary data',
  sourceUrl: 'https://www.mdbg.net/chinese/dictionary?page=cc-cedict',
  license: 'Creative Commons Attribution-ShareAlike 4.0 International',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  library: 'cc-cedict',
  libraryVersion: DICTIONARY_PACKAGE_VERSION,
} as const;

const resultCache = new Map<string, DictionaryLookupResult>();
const bucketCache = new Map<number, DictionaryBucket>();

const TONE_MARKS: Record<string, string[]> = {
  a: ['a', 'ā', 'á', 'ǎ', 'à'],
  e: ['e', 'ē', 'é', 'ě', 'è'],
  i: ['i', 'ī', 'í', 'ǐ', 'ì'],
  o: ['o', 'ō', 'ó', 'ǒ', 'ò'],
  u: ['u', 'ū', 'ú', 'ǔ', 'ù'],
  ü: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
};

const markSyllable = (rawSyllable: string, toneValue: string): string => {
  const tone = Number(toneValue);
  const syllable = rawSyllable.replace(/u:/gi, match => match[0] === 'U' ? 'Ü' : 'ü')
    .replace(/v/gi, match => match === 'V' ? 'Ü' : 'ü');
  if (tone <= 0 || tone >= 5) return syllable;

  const lower = syllable.toLowerCase();
  let vowelIndex = lower.indexOf('a');
  if (vowelIndex < 0) vowelIndex = lower.indexOf('e');
  if (vowelIndex < 0 && lower.includes('ou')) vowelIndex = lower.indexOf('o');
  if (vowelIndex < 0) {
    for (let index = lower.length - 1; index >= 0; index -= 1) {
      if ('aeiouü'.includes(lower[index])) {
        vowelIndex = index;
        break;
      }
    }
  }
  if (vowelIndex < 0) return syllable;

  const originalVowel = syllable[vowelIndex];
  const marked = TONE_MARKS[originalVowel.toLowerCase()]?.[tone] || originalVowel;
  const displayVowel = originalVowel === originalVowel.toUpperCase()
    ? marked.toUpperCase()
    : marked;
  return `${syllable.slice(0, vowelIndex)}${displayVowel}${syllable.slice(vowelIndex + 1)}`;
};

export const numberedPinyinToMarks = (pinyin: string): string =>
  pinyin.replace(/([A-Za-züÜvV:]+)([0-5])/g, (_, syllable: string, tone: string) =>
    markSyllable(syllable, tone)
  );

const bucketFor = (word: string): number =>
  createHash('sha256').update(word).digest()[0] % SHARD_COUNT;

const loadBucket = async (bucketNumber: number): Promise<DictionaryBucket> => {
  const cached = bucketCache.get(bucketNumber);
  if (cached) {
    bucketCache.delete(bucketNumber);
    bucketCache.set(bucketNumber, cached);
    return cached;
  }

  const filename = `${bucketNumber.toString(16).padStart(2, '0')}.json.gz`;
  const filePath = path.join(process.cwd(), 'resources', 'cedict', filename);
  const compressed = await readFile(filePath);
  const bucket = JSON.parse((await gunzipAsync(compressed)).toString('utf8')) as DictionaryBucket;
  if (bucketCache.size >= MAX_BUCKET_CACHE) {
    const oldestKey = bucketCache.keys().next().value;
    if (oldestKey !== undefined) bucketCache.delete(oldestKey);
  }
  bucketCache.set(bucketNumber, bucket);
  return bucket;
};

const normalizeEntry = (entry: CompactEntry): DictionaryEntryResult => {
  const [traditional, simplified, pinyin, definitions, classifiers, variants, isVariant] = entry;
  return {
    traditional,
    simplified,
    pinyinNumbered: pinyin,
    pinyinMarked: numberedPinyinToMarks(pinyin),
    definitions,
    classifiers: classifiers.map(([classifierTraditional, classifierSimplified, classifierPinyin]) => ({
      traditional: classifierTraditional,
      simplified: classifierSimplified,
      pinyinNumbered: classifierPinyin,
      pinyinMarked: numberedPinyinToMarks(classifierPinyin),
    })),
    variants: variants.map(([variantTraditional, variantSimplified, variantPinyin]) => ({
      traditional: variantTraditional,
      simplified: variantSimplified,
      pinyinNumbered: variantPinyin,
      pinyinMarked: numberedPinyinToMarks(variantPinyin),
    })),
    isVariant: isVariant === 1,
  };
};

const exactLookup = async (word: string): Promise<DictionaryEntryResult[]> => {
  const bucket = await loadBucket(bucketFor(word));
  return (bucket[word] || []).map(normalizeEntry);
};

const segmentChinese = async (query: string): Promise<DictionarySegmentResult[]> => {
  const characters = Array.from(query);
  const segments: DictionarySegmentResult[] = [];
  let position = 0;

  while (position < characters.length) {
    if (!/\p{Script=Han}/u.test(characters[position])) {
      position += 1;
      continue;
    }

    let match: DictionarySegmentResult | null = null;
    const available = Math.min(MAX_SEGMENT_LENGTH, characters.length - position);
    for (let length = available; length >= 1; length -= 1) {
      const text = characters.slice(position, position + length).join('');
      if (!Array.from(text).every(character => /\p{Script=Han}/u.test(character))) continue;
      const entries = await exactLookup(text);
      if (entries.length > 0) {
        match = { text, entries };
        break;
      }
    }

    if (match) {
      segments.push(match);
      position += Array.from(match.text).length;
    } else {
      position += 1;
    }
  }

  return segments;
};

const storeResultCache = (key: string, result: DictionaryLookupResult): void => {
  if (resultCache.size >= MAX_RESULT_CACHE) {
    const oldestKey = resultCache.keys().next().value;
    if (oldestKey) resultCache.delete(oldestKey);
  }
  resultCache.set(key, result);
};

export const lookupDictionary = async (rawQuery: string): Promise<DictionaryLookupResult> => {
  const query = rawQuery.trim().normalize('NFKC');
  const cached = resultCache.get(query);
  if (cached) {
    resultCache.delete(query);
    resultCache.set(query, cached);
    return cached;
  }

  const entries = await exactLookup(query);
  const result: DictionaryLookupResult = {
    query,
    exactMatch: entries.length > 0,
    entries,
    segments: entries.length > 0 ? [] : await segmentChinese(query),
    attribution: DICTIONARY_ATTRIBUTION,
  };
  storeResultCache(query, result);
  return result;
};
