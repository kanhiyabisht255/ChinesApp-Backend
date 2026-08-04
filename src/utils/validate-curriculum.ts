import {
  ALL_COURSE_SEEDS,
  ALL_LESSON_SEEDS,
  ALL_SCENARIO_SEEDS,
  ALL_LISTENING_LESSON_SEEDS,
  CURRICULUM_CATALOG_STATS,
} from '../content/catalog';

type ValidationIssue = { rule: string; detail: string };

const errors: ValidationIssue[] = [];
const warnings: ValidationIssue[] = [];

const fail = (rule: string, detail: string) => errors.push({ rule, detail });
const warn = (rule: string, detail: string) => warnings.push({ rule, detail });
const normalize = (value: string): string => value
  .trim()
  .toLowerCase()
  .replace(/[\s，。！？!?.,；;：“”"'’—–()-]/g, '');

const duplicateGroups = <T>(items: T[], keyFor: (item: T) => string): Array<[string, T[]]> => {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFor(item);
    groups.set(key, [...(groups.get(key) || []), item]);
  }
  return [...groups.entries()].filter(([key, group]) => key && group.length > 1);
};

const rejectDuplicates = <T>(
  rule: string,
  items: T[],
  keyFor: (item: T) => string,
  labelFor: (item: T) => string
) => {
  for (const [key, group] of duplicateGroups(items, keyFor)) {
    fail(rule, `${key}: ${group.map(labelFor).join(', ')}`);
  }
};

const courses = ALL_COURSE_SEEDS as any[];
const lessons = ALL_LESSON_SEEDS as any[];
const scenarios = ALL_SCENARIO_SEEDS as any[];
const listeningLessons = ALL_LISTENING_LESSON_SEEDS as any[];

if (courses.length !== 150) fail('catalog.course-count', `Expected 150, found ${courses.length}`);
if (lessons.length !== 600) fail('catalog.lesson-count', `Expected 600, found ${lessons.length}`);
if (scenarios.length < 30) fail('catalog.scenario-count', `Expected at least 30, found ${scenarios.length}`);
if (listeningLessons.length < 18) fail('catalog.listening-count', `Expected at least 18, found ${listeningLessons.length}`);
if (courses.filter(course => !course.isPremium).length < 8) {
  fail('catalog.free-course-count', 'Expected at least 8 complete free courses');
}

rejectDuplicates('course.duplicate-slug', courses, course => course.slug, course => course.title);
rejectDuplicates('course.duplicate-order', courses, course => String(course.order), course => course.slug);
rejectDuplicates('lesson.duplicate-slug', lessons, lesson => lesson.slug, lesson => lesson.title);
rejectDuplicates('scenario.duplicate-slug', scenarios, scenario => scenario.slug, scenario => scenario.title);
rejectDuplicates('listening.duplicate-slug', listeningLessons, item => item.slug, item => item.title);

const courseSlugs = new Set(courses.map(course => course.slug));
const lessonsByCourse = new Map<string, any[]>();
for (const lesson of lessons) {
  lessonsByCourse.set(lesson.courseSlug, [...(lessonsByCourse.get(lesson.courseSlug) || []), lesson]);
  if (!courseSlugs.has(lesson.courseSlug)) {
    fail('lesson.missing-course', `${lesson.slug} points to ${lesson.courseSlug}`);
  }
}

for (const course of courses) {
  const courseLessons = lessonsByCourse.get(course.slug) || [];
  if (courseLessons.length !== 4) {
    fail('course.lesson-arc', `${course.slug} has ${courseLessons.length} lessons; expected 4`);
  }
  const orders = courseLessons.map(lesson => lesson.order).sort((a, b) => a - b).join(',');
  if (orders !== '1,2,3,4') fail('course.lesson-order', `${course.slug}: ${orders}`);
}

const blockedText = new Set([
  'Learn key vocabulary and practice speaking.',
  'Learn vocabulary',
  'Practice speaking',
  'मुख्य शब्द और अभ्यास।',
  'Vocabulario clave y práctica.',
  '重要な単語と練習。',
  'अर्थ',
  'significado',
  '意味',
]);

const stringLeaves = (value: unknown): string[] => {
  if (typeof value === 'string') return [value.trim()];
  if (Array.isArray(value)) return value.flatMap(stringLeaves);
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).flatMap(stringLeaves);
  }
  return [];
};

for (const lesson of lessons) {
  if (/^Lesson\s+\d+$/i.test(lesson.title)) {
    fail('lesson.generic-title', `${lesson.slug}: ${lesson.title}`);
  }
  for (const leaf of stringLeaves(lesson)) {
    if (blockedText.has(leaf)) fail('lesson.placeholder-text', `${lesson.slug}: ${leaf}`);
  }
  if (!lesson.description || lesson.description.length < 45) {
    fail('lesson.weak-description', `${lesson.slug}: ${lesson.description || '<empty>'}`);
  }
  if (!Array.isArray(lesson.objectives) || lesson.objectives.length < 3) {
    fail('lesson.objectives', `${lesson.slug} has ${lesson.objectives?.length || 0}`);
  }
  if (!Array.isArray(lesson.vocab) || lesson.vocab.length < 2) {
    fail('lesson.vocab-depth', `${lesson.slug} has ${lesson.vocab?.length || 0}`);
  }
  if (!Array.isArray(lesson.sentences) || lesson.sentences.length < 1) {
    fail('lesson.sentence-depth', `${lesson.slug} has no sentences`);
  }
  if (!Array.isArray(lesson.exercises) || lesson.exercises.length < 4) {
    fail('lesson.exercise-depth', `${lesson.slug} has ${lesson.exercises?.length || 0}`);
  }

  for (const sentence of lesson.sentences || []) {
    const chineseLength = [...normalize(sentence.chinese || '')].length;
    if (chineseLength < 4) fail('sentence.fragment', `${lesson.slug}: ${sentence.chinese}`);
    if (!sentence.pinyin || !sentence.english) fail('sentence.core-fields', `${lesson.slug}: ${sentence.chinese}`);
    if (!sentence.literalMeaning || !sentence.pattern || !sentence.grammarNote || !sentence.usageNote) {
      fail('sentence.missing-explanation', `${lesson.slug}: ${sentence.chinese}`);
    }
    if (!Array.isArray(sentence.breakdown) || sentence.breakdown.length < 2) {
      fail('sentence.breakdown', `${lesson.slug}: ${sentence.chinese}`);
    }
    if (!Array.isArray(sentence.substitutions) || sentence.substitutions.length < 1) {
      fail('sentence.substitution', `${lesson.slug}: ${sentence.chinese}`);
    }
    for (const chunk of sentence.breakdown || []) {
      if (!chunk.chinese || !chunk.pinyin || !chunk.meaning) {
        fail('sentence.invalid-chunk', `${lesson.slug}: ${JSON.stringify(chunk)}`);
      }
    }
  }

  const exerciseGroups = duplicateGroups((lesson.exercises || []) as any[], exercise =>
    `${exercise.type}|${normalize(exercise.prompt || '')}|${normalize(exercise.answer || '')}`
  );
  if (exerciseGroups.length) fail('lesson.duplicate-exercise', lesson.slug);
}

const lessonFingerprints = duplicateGroups(lessons, lesson => JSON.stringify({
  type: lesson.type,
  objectives: lesson.objectives?.map(normalize),
  vocab: lesson.vocab?.map((item: any) => normalize(item.chinese)),
  sentences: lesson.sentences?.map((sentence: any) => normalize(sentence.chinese)),
  exercises: lesson.exercises?.map((exercise: any) => [
    exercise.type,
    normalize(exercise.prompt || ''),
    normalize(exercise.answer || ''),
  ]),
}));
for (const [, group] of lessonFingerprints) {
  fail('lesson.duplicate-content', group.map(lesson => lesson.slug).join(', '));
}

const sentenceUses = new Map<string, Set<string>>();
for (const lesson of lessons) {
  for (const sentence of lesson.sentences || []) {
    const key = normalize(sentence.chinese);
    sentenceUses.set(key, new Set([...(sentenceUses.get(key) || []), lesson.courseSlug]));
  }
}
for (const [sentence, usedByCourses] of sentenceUses) {
  if (usedByCourses.size > 1) {
    fail('sentence.cross-course-duplicate', `${sentence}: ${[...usedByCourses].join(', ')}`);
  }
}

const exercisePromptGroups = duplicateGroups(
  lessons.flatMap(lesson => (lesson.exercises || []).map((exercise: any) => ({ lesson, exercise }))),
  item => `${normalize(item.exercise.prompt || '')}|${normalize(item.exercise.answer || '')}`
);
for (const [, group] of exercisePromptGroups) {
  fail('exercise.cross-lesson-duplicate', group.map(item => item.lesson.slug).join(', '));
}

const scenarioFingerprints = duplicateGroups(scenarios, scenario => JSON.stringify({
  dialogues: scenario.dialogues?.map((dialogue: any) => [dialogue.speaker, normalize(dialogue.chinese)]),
  systemPrompt: normalize(scenario.systemPrompt || ''),
}));
for (const [, group] of scenarioFingerprints) {
  fail('scenario.duplicate-content', group.map(scenario => scenario.slug).join(', '));
}
for (const scenario of scenarios) {
  if (!Array.isArray(scenario.dialogues) || scenario.dialogues.length < 2) {
    fail('scenario.dialogue-depth', `${scenario.slug} has ${scenario.dialogues?.length || 0} lines`);
  }
  if (!scenario.systemPrompt || scenario.systemPrompt.length < 180) {
    fail('scenario.weak-system-prompt', scenario.slug);
  }
}

const listeningScriptUses = new Map<string, string>();
for (const item of listeningLessons) {
  if (!Array.isArray(item.segments) || item.segments.length < 3) {
    fail('listening.segment-depth', `${item.slug} has ${item.segments?.length || 0} segments`);
  }
  if (!Array.isArray(item.focusWords) || item.focusWords.length < 3) {
    fail('listening.focus-word-depth', `${item.slug} has ${item.focusWords?.length || 0} focus words`);
  }
  if (!Array.isArray(item.questions) || item.questions.length < 3) {
    fail('listening.question-depth', `${item.slug} has ${item.questions?.length || 0} questions`);
  }
  const questionKeys = new Set<string>();
  for (const segment of item.segments || []) {
    if (!segment.chinese || !segment.pinyin || !segment.english || !segment.speakerName) {
      fail('listening.invalid-segment', `${item.slug}: ${JSON.stringify(segment)}`);
    }
    const scriptKey = normalize(segment.chinese || '');
    const previous = listeningScriptUses.get(scriptKey);
    if (previous) fail('listening.duplicate-script', `${previous}, ${item.slug}: ${segment.chinese}`);
    else listeningScriptUses.set(scriptKey, item.slug);
  }
  for (const question of item.questions || []) {
    if (!question.prompt || !question.answer || !question.explanation) {
      fail('listening.invalid-question', `${item.slug}: ${JSON.stringify(question)}`);
    }
    if (question.type !== 'dictation' && (!Array.isArray(question.options) || question.options.length < 2)) {
      fail('listening.question-options', `${item.slug}: ${question.prompt}`);
    }
    if (question.replaySegmentIndex !== undefined && (
      question.replaySegmentIndex < 0 || question.replaySegmentIndex >= (item.segments || []).length
    )) {
      fail('listening.invalid-replay-index', `${item.slug}: ${question.replaySegmentIndex}`);
    }
    const key = `${normalize(question.prompt)}|${normalize(question.answer)}`;
    if (questionKeys.has(key)) fail('listening.duplicate-question', `${item.slug}: ${question.prompt}`);
    questionKeys.add(key);
  }
}

for (const lesson of lessons) {
  for (const item of lesson.vocab || []) {
    if (!/[\u3400-\u9fff]/u.test(item.chinese || '')) {
      warn('vocab.non-hanzi-chunk', `${lesson.slug}: ${item.chinese}`);
    }
  }
}

console.log('\nCurriculum quality report');
console.log(JSON.stringify({
  version: CURRICULUM_CATALOG_STATS.version,
  courses: courses.length,
  lessons: lessons.length,
  scenarios: scenarios.length,
  listeningLessons: listeningLessons.length,
  exercises: lessons.reduce((total, lesson) => total + (lesson.exercises?.length || 0), 0),
  uniqueSentenceTexts: sentenceUses.size,
  errors: errors.length,
  warnings: warnings.length,
}, null, 2));

if (warnings.length) {
  console.log('\nWarnings');
  warnings.slice(0, 30).forEach(issue => console.log(`- [${issue.rule}] ${issue.detail}`));
  if (warnings.length > 30) console.log(`- ...and ${warnings.length - 30} more`);
}

if (errors.length) {
  console.error('\nValidation errors');
  errors.slice(0, 100).forEach(issue => console.error(`- [${issue.rule}] ${issue.detail}`));
  if (errors.length > 100) console.error(`- ...and ${errors.length - 100} more`);
  process.exitCode = 1;
} else {
  console.log('\nPASS: no duplicate, placeholder or structurally weak curriculum content found.');
}
