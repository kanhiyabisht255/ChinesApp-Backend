import type { Request } from 'express';
import { User } from '../models';
import type { AuthRequest } from '../types';

export const CURATED_CONTENT_LANGUAGES = ['en', 'hi', 'es', 'ja'] as const;

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  es: 'Spanish',
  ja: 'Japanese',
  ko: 'Korean',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  ru: 'Russian',
  ar: 'Arabic',
  id: 'Indonesian',
  vi: 'Vietnamese',
  th: 'Thai',
};

export const normalizeLanguageCode = (value: unknown): string => {
  if (typeof value !== 'string') return 'en';
  const normalized = value.trim().toLowerCase().replace('_', '-').split('-')[0];
  return /^[a-z]{2,3}$/.test(normalized) ? normalized : 'en';
};

export const getLanguageName = (code: string): string =>
  LANGUAGE_NAMES[normalizeLanguageCode(code)] || code;

export const getRequestLanguage = async (req: Request): Promise<string> => {
  const requested = req.query.lang;
  if (typeof requested === 'string' && requested.trim()) {
    return normalizeLanguageCode(requested);
  }

  const userId = (req as AuthRequest).userId;
  if (!userId) return 'en';

  const user = await User.findById(userId).select('nativeLanguage').lean();
  return normalizeLanguageCode(user?.nativeLanguage);
};

const getMapValue = (value: unknown, key: string): unknown => {
  if (value instanceof Map) return value.get(key);
  if (value && typeof value === 'object') return (value as Record<string, unknown>)[key];
  return undefined;
};

const translatedField = (
  translations: unknown,
  language: string,
  field: string,
  fallback: string
): string => {
  if (language === 'en') return fallback;
  const languageBlock = getMapValue(translations, language);
  const translated = getMapValue(languageBlock, field);
  return typeof translated === 'string' && translated.trim() ? translated : fallback;
};

const translatedValue = (translations: unknown, language: string, fallback: string): string => {
  if (language === 'en') return fallback;
  const translated = getMapValue(translations, language);
  return typeof translated === 'string' && translated.trim() ? translated : fallback;
};

const translatedArray = (translations: unknown, language: string, fallback: string[]): string[] => {
  if (language === 'en') return fallback;
  const translated = getMapValue(translations, language);
  return Array.isArray(translated) && translated.every(item => typeof item === 'string')
    ? translated
    : fallback;
};

const toPlainObject = (document: unknown): Record<string, any> => {
  if (document && typeof (document as { toObject?: unknown }).toObject === 'function') {
    return (document as { toObject: (options?: unknown) => Record<string, any> }).toObject({ flattenMaps: true });
  }
  return document as Record<string, any>;
};

export const localizeCourse = (course: unknown, language: string): Record<string, any> => {
  const plain = toPlainObject(course);
  return {
    ...plain,
    title: translatedField(plain.translations, language, 'title', plain.title),
    description: translatedField(plain.translations, language, 'description', plain.description),
    outcomes: plain.outcomes?.map((outcome: string, index: number) =>
      translatedField(plain.translations, language, `outcome${index + 1}`, outcome)
    ) || [],
    contentLanguage: language,
  };
};

export const localizeVocabularyTopic = (topic: unknown, language: string): Record<string, any> => {
  const plain = toPlainObject(topic);
  return {
    ...plain,
    title: translatedField(plain.translations, language, 'title', plain.title),
    description: translatedField(plain.translations, language, 'description', plain.description),
    contentLanguage: language,
  };
};

export const localizeVocabularyWord = (word: unknown, language: string): Record<string, any> => {
  const plain = toPlainObject(word);
  return {
    ...plain,
    english: translatedField(plain.translations, language, 'english', plain.english),
    exampleEnglish: translatedField(
      plain.translations,
      language,
      'exampleEnglish',
      plain.exampleEnglish,
    ),
    usageNote: translatedField(plain.translations, language, 'usageNote', plain.usageNote || ''),
    contentLanguage: language,
  };
};

export const localizeLesson = (lesson: unknown, language: string): Record<string, any> => {
  const plain = toPlainObject(lesson);
  return {
    ...plain,
    title: translatedField(plain.translations, language, 'title', plain.title),
    description: translatedField(plain.translations, language, 'description', plain.description),
    objectives: plain.objectives?.map((objective: string, index: number) =>
      translatedField(plain.translations, language, `objective${index + 1}`, objective)
    ) || [],
    vocab: plain.vocab?.map((item: Record<string, any>) => ({
      ...item,
      english: translatedValue(item.translations, language, item.english),
    })) || [],
    grammarPoints: plain.grammarPoints?.map((point: Record<string, any>) => ({
      ...point,
      explanation: translatedValue(point.translations, language, point.explanation),
    })) || [],
    sentences: plain.sentences?.map((sentence: Record<string, any>) => ({
      ...sentence,
      english: translatedValue(sentence.translations, language, sentence.english),
      literalMeaning: translatedField(
        sentence.explanationTranslations,
        language,
        'literalMeaning',
        sentence.literalMeaning || sentence.english
      ),
      pattern: translatedField(
        sentence.explanationTranslations,
        language,
        'pattern',
        sentence.pattern || ''
      ),
      grammarNote: translatedField(
        sentence.explanationTranslations,
        language,
        'grammarNote',
        sentence.grammarNote || ''
      ),
      usageNote: translatedField(
        sentence.explanationTranslations,
        language,
        'usageNote',
        sentence.usageNote || ''
      ),
      breakdown: sentence.breakdown?.map((chunk: Record<string, any>) => ({
        ...chunk,
        meaning: translatedValue(chunk.translations, language, chunk.meaning),
      })) || [],
      substitutions: sentence.substitutions?.map((substitution: Record<string, any>) => ({
        ...substitution,
        english: translatedValue(
          substitution.translations,
          language,
          substitution.english
        ),
      })) || [],
    })) || [],
    exercises: plain.exercises?.map((exercise: Record<string, any>) => ({
      ...exercise,
      prompt: translatedValue(exercise.translations, language, exercise.prompt),
      options: translatedArray(exercise.optionTranslations, language, exercise.options || []),
      answer: translatedValue(exercise.answerTranslations, language, exercise.answer),
      explanation: translatedValue(
        exercise.explanationTranslations,
        language,
        exercise.explanation || ''
      ),
    })) || [],
    contentLanguage: language,
  };
};

export const localizeScenario = (scenario: unknown, language: string): Record<string, any> => {
  const plain = toPlainObject(scenario);
  return {
    ...plain,
    title: translatedField(plain.translations, language, 'title', plain.title),
    description: translatedField(plain.translations, language, 'description', plain.description),
    learningGoals: plain.learningGoals?.map((goal: string, index: number) =>
      translatedField(plain.translations, language, `goal${index + 1}`, goal)
    ) || [],
    dialogues: plain.dialogues?.map((dialogue: Record<string, any>) => ({
      ...dialogue,
      english: translatedValue(dialogue.translations, language, dialogue.english),
    })) || [],
    contentLanguage: language,
  };
};

export const localizeReadingStory = (story: unknown, language: string): Record<string, any> => {
  const plain = toPlainObject(story);
  return {
    ...plain,
    title: translatedField(plain.translations, language, 'title', plain.title),
    description: translatedField(plain.translations, language, 'description', plain.description),
    paragraphs: (plain.paragraphs || []).map((paragraph: Record<string, any>, index: number) => ({
      ...paragraph,
      // Story-level translations let editors translate metadata without changing
      // the Chinese text or pinyin. Paragraph-level values remain the fallback.
      english: translatedField(plain.translations, language, `paragraph${index + 1}`, translatedValue(paragraph.translations, language, paragraph.english)),
    })),
    vocabulary: (plain.vocabulary || []).map((word: Record<string, any>, index: number) => ({
      ...word,
      english: translatedField(plain.translations, language, `word${index + 1}`, translatedValue(word.translations, language, word.english)),
      exampleEnglish: translatedField(plain.translations, language, `word${index + 1}Example`, translatedValue(word.translations, language, word.exampleEnglish)),
    })),
    questions: (plain.questions || []).map((question: Record<string, any>, index: number) => ({
      ...question,
      prompt: translatedField(plain.translations, language, `question${index + 1}`, translatedValue(question.translations, language, question.prompt)),
      explanation: translatedField(plain.translations, language, `question${index + 1}Explanation`, translatedValue(question.translations, language, question.explanation)),
    })),
    contentLanguage: language,
  };
};

export const localizeListeningLesson = (lesson: unknown, language: string): Record<string, any> => {
  const plain = toPlainObject(lesson);
  return {
    ...plain,
    title: translatedField(plain.translations, language, 'title', plain.title),
    description: translatedField(plain.translations, language, 'description', plain.description),
    preListenTip: translatedField(plain.translations, language, 'preListenTip', plain.preListenTip),
    segments: (plain.segments || []).map((segment: Record<string, any>) => ({
      ...segment,
      english: translatedValue(segment.translations, language, segment.english),
    })),
    focusWords: (plain.focusWords || []).map((word: Record<string, any>) => ({
      ...word,
      english: translatedValue(word.translations, language, word.english),
    })),
    questions: (plain.questions || []).map((question: Record<string, any>) => ({
      ...question,
      prompt: translatedValue(question.translations, language, question.prompt),
      options: translatedArray(question.optionTranslations, language, question.options || []),
      explanation: translatedValue(
        question.explanationTranslations,
        language,
        question.explanation,
      ),
    })),
    contentLanguage: language,
  };
};
