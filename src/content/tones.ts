// Tone practice data served from backend to keep app size small

export interface ToneQuestion {
  syllable: string;
  correctTone: number;
  character: string;
  meaning: string;
}

export interface MinimalPairItem {
  syllable: string;
  tone: number;
  character: string;
  meaning: string;
}

export interface MinimalPair {
  syllable: string;
  pairs: MinimalPairItem[];
}

export interface ToneSandhiRule {
  title: string;
  rule: string;
  example: string;
  spokenAs: string;
  meaning: string;
  explanation: string;
}

export const toneSandhiRules: ToneSandhiRule[] = [
  {
    title: "Two Third Tones",
    rule: "3rd tone + 3rd tone → 2nd tone + 3rd tone",
    example: "你好 (nǐ hǎo)",
    spokenAs: "ní hǎo",
    meaning: "Hello",
    explanation: "When two third tones appear together, the first becomes a second tone. So nǐ hǎo is actually spoken as ní hǎo.",
  },
  {
    title: "不 (bù) before 4th tone",
    rule: "bù (4th) + 4th tone → bú (2nd) + 4th tone",
    example: "不是 (bù shì)",
    spokenAs: "bú shì",
    meaning: "Is not",
    explanation: "The negation word 不 (bù) changes to 2nd tone (bú) when followed by a 4th tone syllable.",
  },
  {
    title: "不 (bù) before other tones",
    rule: "bù stays 4th tone before 1st, 2nd, 3rd tones",
    example: "不喝 (bù hē)",
    spokenAs: "bù hē",
    meaning: "Not drink",
    explanation: "Before 1st, 2nd, or 3rd tones, 不 keeps its original 4th tone.",
  },
  {
    title: "一 (yī) before 4th tone",
    rule: "yī (1st) + 4th tone → yí (2nd) + 4th tone",
    example: "一个 (yī gè)",
    spokenAs: "yí gè",
    meaning: "One (of)",
    explanation: "The number 一 (yī) changes to 2nd tone (yí) before a 4th tone syllable.",
  },
  {
    title: "一 (yī) before 1st/2nd/3rd tone",
    rule: "yī (1st) + 1st/2nd/3rd → yì (4th) + tone",
    example: "一天 (yī tiān)",
    spokenAs: "yì tiān",
    meaning: "One day",
    explanation: "Before 1st, 2nd, or 3rd tones, 一 changes to 4th tone (yì).",
  },
];

export const minimalPairs: MinimalPair[] = [
  {
    syllable: "ma",
    pairs: [
      { syllable: "mā", tone: 1, character: "妈", meaning: "mother" },
      { syllable: "má", tone: 2, character: "麻", meaning: "hemp" },
      { syllable: "mǎ", tone: 3, character: "马", meaning: "horse" },
      { syllable: "mà", tone: 4, character: "骂", meaning: "scold" },
    ],
  },
  {
    syllable: "shi",
    pairs: [
      { syllable: "shī", tone: 1, character: "诗", meaning: "poem" },
      { syllable: "shí", tone: 2, character: "十", meaning: "ten" },
      { syllable: "shǐ", tone: 3, character: "史", meaning: "history" },
      { syllable: "shì", tone: 4, character: "是", meaning: "is" },
    ],
  },
  {
    syllable: "wen",
    pairs: [
      { syllable: "wēn", tone: 1, character: "温", meaning: "warm" },
      { syllable: "wén", tone: 2, character: "文", meaning: "culture" },
      { syllable: "wěn", tone: 3, character: "稳", meaning: "steady" },
      { syllable: "wèn", tone: 4, character: "问", meaning: "ask" },
    ],
  },
  {
    syllable: "tang",
    pairs: [
      { syllable: "tāng", tone: 1, character: "汤", meaning: "soup" },
      { syllable: "táng", tone: 2, character: "糖", meaning: "sugar" },
      { syllable: "tǎng", tone: 3, character: "躺", meaning: "lie down" },
      { syllable: "tàng", tone: 4, character: "烫", meaning: "hot" },
    ],
  },
  {
    syllable: "yi",
    pairs: [
      { syllable: "yī", tone: 1, character: "衣", meaning: "clothes" },
      { syllable: "yí", tone: 2, character: "姨", meaning: "aunt" },
      { syllable: "yǐ", tone: 3, character: "椅", meaning: "chair" },
      { syllable: "yì", tone: 4, character: "易", meaning: "easy" },
    ],
  },
  {
    syllable: "ba",
    pairs: [
      { syllable: "bā", tone: 1, character: "八", meaning: "eight" },
      { syllable: "bá", tone: 2, character: "拔", meaning: "pull" },
      { syllable: "bǎ", tone: 3, character: "把", meaning: "hold" },
      { syllable: "bà", tone: 4, character: "爸", meaning: "dad" },
    ],
  },
  {
    syllable: "duo",
    pairs: [
      { syllable: "duō", tone: 1, character: "多", meaning: "many" },
      { syllable: "duó", tone: 2, character: "夺", meaning: "seize" },
      { syllable: "duǒ", tone: 3, character: "朵", meaning: "flower" },
      { syllable: "duò", tone: 4, character: "惰", meaning: "lazy" },
    ],
  },
  {
    syllable: "fu",
    pairs: [
      { syllable: "fū", tone: 1, character: "夫", meaning: "husband" },
      { syllable: "fú", tone: 2, character: "福", meaning: "blessing" },
      { syllable: "fǔ", tone: 3, character: "府", meaning: "government" },
      { syllable: "fù", tone: 4, character: "父", meaning: "father" },
    ],
  },
  {
    syllable: "ji",
    pairs: [
      { syllable: "jī", tone: 1, character: "鸡", meaning: "chicken" },
      { syllable: "jí", tone: 2, character: "急", meaning: "urgent" },
      { syllable: "jǐ", tone: 3, character: "几", meaning: "few" },
      { syllable: "jì", tone: 4, character: "记", meaning: "remember" },
    ],
  },
  {
    syllable: "lai",
    pairs: [
      { syllable: "lāi", tone: 1, character: "来", meaning: "come" },
      { syllable: "lái", tone: 2, character: "来", meaning: "come" },
      { syllable: "lǎi", tone: 3, character: "乃", meaning: "thus" },
      { syllable: "lài", tone: 4, character: "赖", meaning: "rely" },
    ],
  },
];

// Generate 80+ practice questions (4 tones × 10 syllables × 2 variations)
export const tonePracticeQuestions: ToneQuestion[] = [
  // ma
  { syllable: "mā", correctTone: 1, character: "妈", meaning: "mother" },
  { syllable: "má", correctTone: 2, character: "麻", meaning: "hemp" },
  { syllable: "mǎ", correctTone: 3, character: "马", meaning: "horse" },
  { syllable: "mà", correctTone: 4, character: "骂", meaning: "scold" },
  // shi
  { syllable: "shī", correctTone: 1, character: "诗", meaning: "poem" },
  { syllable: "shí", correctTone: 2, character: "十", meaning: "ten" },
  { syllable: "shǐ", correctTone: 3, character: "史", meaning: "history" },
  { syllable: "shì", correctTone: 4, character: "是", meaning: "is" },
  // wen
  { syllable: "wēn", correctTone: 1, character: "温", meaning: "warm" },
  { syllable: "wén", correctTone: 2, character: "文", meaning: "culture" },
  { syllable: "wěn", correctTone: 3, character: "稳", meaning: "steady" },
  { syllable: "wèn", correctTone: 4, character: "问", meaning: "ask" },
  // tang
  { syllable: "tāng", correctTone: 1, character: "汤", meaning: "soup" },
  { syllable: "táng", correctTone: 2, character: "糖", meaning: "sugar" },
  { syllable: "tǎng", correctTone: 3, character: "躺", meaning: "lie down" },
  { syllable: "tàng", correctTone: 4, character: "烫", meaning: "hot" },
  // yi
  { syllable: "yī", correctTone: 1, character: "衣", meaning: "clothes" },
  { syllable: "yí", correctTone: 2, character: "姨", meaning: "aunt" },
  { syllable: "yǐ", correctTone: 3, character: "椅", meaning: "chair" },
  { syllable: "yì", correctTone: 4, character: "易", meaning: "easy" },
  // ba
  { syllable: "bā", correctTone: 1, character: "八", meaning: "eight" },
  { syllable: "bá", correctTone: 2, character: "拔", meaning: "pull" },
  { syllable: "bǎ", correctTone: 3, character: "把", meaning: "hold" },
  { syllable: "bà", correctTone: 4, character: "爸", meaning: "dad" },
  // duo
  { syllable: "duō", correctTone: 1, character: "多", meaning: "many" },
  { syllable: "duó", correctTone: 2, character: "夺", meaning: "seize" },
  { syllable: "duǒ", correctTone: 3, character: "朵", meaning: "flower" },
  { syllable: "duò", correctTone: 4, character: "惰", meaning: "lazy" },
  // fu
  { syllable: "fū", correctTone: 1, character: "夫", meaning: "husband" },
  { syllable: "fú", correctTone: 2, character: "福", meaning: "blessing" },
  { syllable: "fǔ", correctTone: 3, character: "府", meaning: "government" },
  { syllable: "fù", correctTone: 4, character: "父", meaning: "father" },
  // ji
  { syllable: "jī", correctTone: 1, character: "鸡", meaning: "chicken" },
  { syllable: "jí", correctTone: 2, character: "急", meaning: "urgent" },
  { syllable: "jǐ", correctTone: 3, character: "几", meaning: "few" },
  { syllable: "jì", correctTone: 4, character: "记", meaning: "remember" },
  // lai
  { syllable: "lāi", correctTone: 1, character: "来", meaning: "come" },
  { syllable: "lái", correctTone: 2, character: "来", meaning: "come" },
  { syllable: "lǎi", correctTone: 3, character: "乃", meaning: "thus" },
  { syllable: "lài", correctTone: 4, character: "赖", meaning: "rely" },
  // Additional common syllables
  // li
  { syllable: "lī", correctTone: 1, character: "哩", meaning: "mile" },
  { syllable: "lí", correctTone: 2, character: "梨", meaning: "pear" },
  { syllable: "lǐ", correctTone: 3, character: "里", meaning: "inside" },
  { syllable: "lì", correctTone: 4, character: "力", meaning: "power" },
  // qi
  { syllable: "qī", correctTone: 1, character: "七", meaning: "seven" },
  { syllable: "qí", correctTone: 2, character: "齐", meaning: "neat" },
  { syllable: "qǐ", correctTone: 3, character: "起", meaning: "rise" },
  { syllable: "qì", correctTone: 4, character: "气", meaning: "air" },
  // xi
  { syllable: "xī", correctTone: 1, character: "西", meaning: "west" },
  { syllable: "xí", correctTone: 2, character: "习", meaning: "practice" },
  { syllable: "xǐ", correctTone: 3, character: "洗", meaning: "wash" },
  { syllable: "xì", correctTone: 4, character: "戏", meaning: "play" },
  // zhu
  { syllable: "zhū", correctTone: 1, character: "猪", meaning: "pig" },
  { syllable: "zhú", correctTone: 2, character: "竹", meaning: "bamboo" },
  { syllable: "zhǔ", correctTone: 3, character: "主", meaning: "master" },
  { syllable: "zhù", correctTone: 4, character: "住", meaning: "live" },
  // chuan
  { syllable: "chuān", correctTone: 1, character: "穿", meaning: "wear" },
  { syllable: "chuán", correctTone: 2, character: "船", meaning: "boat" },
  { syllable: "chuǎn", correctTone: 3, character: "喘", meaning: "pant" },
  { syllable: "chuàn", correctTone: 4, character: "串", meaning: "string" },
  // quan
  { syllable: "quān", correctTone: 1, character: "圈", meaning: "circle" },
  { syllable: "quán", correctTone: 2, character: "全", meaning: "whole" },
  { syllable: "quǎn", correctTone: 3, character: "犬", meaning: "dog" },
  { syllable: "quàn", correctTone: 4, character: "劝", meaning: "advise" },
  // jia
  { syllable: "jiā", correctTone: 1, character: "家", meaning: "home" },
  { syllable: "jiá", correctTone: 2, character: "夹", meaning: "clip" },
  { syllable: "jiǎ", correctTone: 3, character: "假", meaning: "fake" },
  { syllable: "jià", correctTone: 4, character: "价", meaning: "price" },
  // hua
  { syllable: "huā", correctTone: 1, character: "花", meaning: "flower" },
  { syllable: "huá", correctTone: 2, character: "华", meaning: "China" },
  { syllable: "huǎ", correctTone: 3, character: "哗", meaning: "noise" },
  { syllable: "huà", correctTone: 4, character: "画", meaning: "draw" },
  // duo variations
  { syllable: "duō", correctTone: 1, character: "多", meaning: "many" },
  { syllable: "duò", correctTone: 4, character: "惰", meaning: "lazy" },
  // Additional mixed
  { syllable: "mā", correctTone: 1, character: "妈", meaning: "mother" },
  { syllable: "mǎ", correctTone: 3, character: "马", meaning: "horse" },
  { syllable: "shì", correctTone: 4, character: "是", meaning: "is" },
  { syllable: "shí", correctTone: 2, character: "十", meaning: "ten" },
  { syllable: "wén", correctTone: 2, character: "文", meaning: "culture" },
  { syllable: "wěn", correctTone: 3, character: "稳", meaning: "steady" },
  { syllable: "táng", correctTone: 2, character: "糖", meaning: "sugar" },
  { syllable: "tàng", correctTone: 4, character: "烫", meaning: "hot" },
];