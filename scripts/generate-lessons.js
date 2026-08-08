const fs = require('fs');
const path = require('path');

const curriculumPath = path.join(__dirname, '..', 'src', 'content', 'curriculum.ts');
let content = fs.readFileSync(curriculumPath, 'utf8');

// Extract course slugs
const courseMatches = content.match(/slug:\s*['"]([^'"]+)['"]/g);
const courses = courseMatches ? courseMatches.map(m => m.match(/slug:\s*['"]([^'"]+)['"]/)[1]) : [];

console.log(`Found ${courses.length} courses`);

// Generate lessons for each course
let lessonsCode = '\n\nconst LESSON_DEFINITIONS: LessonDefinition[] = [\n';

const lessonTypes = ['pronunciation', 'vocabulary', 'dialogue', 'grammar', 'listening', 'reading', 'story', 'character', 'quiz'];
const sampleWords = [
  ['你好', 'nǐ hǎo', 'hello'], ['谢谢', 'xièxie', 'thank you'], ['再见', 'zàijiàn', 'goodbye'],
  ['我', 'wǒ', 'I'], ['你', 'nǐ', 'you'], ['是', 'shì', 'is'], ['人', 'rén', 'person'],
  ['大', 'dà', 'big'], ['小', 'xiǎo', 'small'], ['好', 'hǎo', 'good']
];

courses.forEach((courseSlug, idx) => {
  const numLessons = 4 + Math.floor(Math.random() * 4); // 4-7 lessons per course
  
  for (let i = 1; i <= numLessons; i++) {
    const lessonNum = idx * 10 + i;
    const type = lessonTypes[Math.floor(Math.random() * lessonTypes.length)];
    const word = sampleWords[Math.floor(Math.random() * sampleWords.length)];
    
    lessonsCode += `  {
    courseSlug: '${courseSlug}', slug: '${courseSlug}-lesson-${i}', title: 'Lesson ${i}', titleCn: '第${i}课', pinyin: 'dì ${i} kè',
    description: 'Learn key vocabulary and practice speaking.', localizedTitle: L('पाठ ${i}', 'Lección ${i}', '第${i}課'), localizedDescription: L('मुख्य शब्द और अभ्यास।', 'Vocabulario clave y práctica.', '重要な単語と練習。'),
    order: ${i}, type: '${type}', isPremium: ${idx >= 4 ? 'true' : i > 2 ? 'true' : 'false'}, objectives: ['Learn vocabulary', 'Practice speaking'],
    words: [word('${word[0]}', '${word[1]}', '${word[2]}', L('अर्थ', 'significado', '意味'))],
    sentences: [sentence('${word[0]}。', '${word[1]}.', '${word[2]}.', L('अर्थ', 'significado', '意味'))],
  },\n`;
  }
});

lessonsCode += '];\n';

// Replace the empty LESSON_SEEDS export
content = content.replace('export const LESSON_SEEDS = [] as any[];', '');

// Append lessons and export
content += lessonsCode;
content += `

export const LESSON_SEEDS = LESSON_DEFINITIONS.map(definition => {
  const options = definition.words.map(item => item.english);
  const firstWord = definition.words[0];
  return {
    courseSlug: definition.courseSlug,
    slug: definition.slug,
    title: definition.title,
    titleCn: definition.titleCn,
    pinyin: definition.pinyin,
    description: definition.description,
    order: definition.order,
    type: definition.type,
    estimatedMinutes: definition.estimatedMinutes || 8,
    xpReward: definition.xpReward || (definition.isPremium ? 30 : 20),
    isPremium: definition.isPremium || false,
    isPublished: true,
    objectives: definition.objectives,
    vocab: definition.words.map(item => ({
      chinese: item.chinese,
      pinyin: item.pinyin,
      english: item.english,
      partOfSpeech: item.partOfSpeech || 'word',
      translations: item.localized,
    })),
    grammarPoints: definition.grammarPoints || [],
    sentences: definition.sentences.map(item => ({
      chinese: item.chinese,
      pinyin: item.pinyin,
      english: item.english,
      translations: item.localized,
    })),
    exercises: firstWord ? [
      {
        type: 'multiple_choice',
        prompt: \`What does \${firstWord.chinese} mean?\`,
        promptChinese: firstWord.chinese,
        options,
        answer: firstWord.english,
        explanation: \`\${firstWord.chinese} (\${firstWord.pinyin}) means "\${firstWord.english}".\`,
        translations: { hi: 'सही अर्थ चुनें।', es: 'Elige el significado correcto.', ja: '正しい意味を選んでください。' },
      },
    ] : [],
    translations: translationsForFields(definition.localizedTitle, definition.localizedDescription),
  };
});
`;

// Add scenario seeds at the end
content += `

const SCENARIO_TRANSLATIONS = {
  'meeting-someone': { hi: { title: 'पहली मुलाकात', description: 'अपना परिचय दें' }, es: { title: 'Conocer a alguien', description: 'Preséntate' }, ja: { title: '初対面', description: '自己紹介します' } },
  'ordering-drinks': { hi: { title: 'पेय ऑर्डर', description: 'चाय या कॉफी मँगाएँ' }, es: { title: 'Pedir bebidas', description: 'Pide té o café' }, ja: { title: '飲み物を注文', description: 'お茶やコーヒーを注文' } },
  'restaurant': { hi: { title: 'रेस्तरां', description: 'खाना ऑर्डर करें' }, es: { title: 'Restaurante', description: 'Pide comida' }, ja: { title: 'レストラン', description: '食事を注文' } },
};

export const SCENARIO_SEEDS = [
  ['meeting-someone', 'Meeting Someone', '初次见面', 'chūcì jiànmiàn', 'Introduce yourself', 'people', 'beginner', '#7F43FE', false],
  ['ordering-drinks', 'Ordering Drinks', '点饮料', 'diǎn yǐnliào', 'Order drinks', 'local_cafe', 'beginner', '#22C55E', false],
  ['restaurant', 'At a Restaurant', '在餐厅', 'zài cāntīng', 'Order food', 'restaurant', 'beginner', '#F59E0B', false],
].map((item, index) => {
  const [slug, title, titleCn, pinyin, description, icon, difficulty, color, isPremium] = item;
  const localized = SCENARIO_TRANSLATIONS[slug];
  return {
    slug, title, titleCn, pinyin, description, icon, difficulty, color, isPremium,
    order: index + 1,
    estimatedMinutes: 5,
    learningGoals: ['Practice speaking', 'Learn vocabulary', 'Build confidence'],
    systemPrompt: \`Role-play: \${title}. Stay in character and help the learner practice.\`,
    isPublished: true,
    dialogues: [
      { speaker: 'ai', chinese: '你好！我们开始练习吧。', pinyin: 'Nǐ hǎo! Wǒmen kāishǐ liànxí ba.', english: "Hello! Let's practice.", translations: { hi: 'नमस्ते! अभ्यास शुरू करते हैं।', es: '¡Hola! Empecemos.', ja: 'こんにちは！練習を始めましょう。' } },
      { speaker: 'user', chinese: '好的。', pinyin: 'Hǎo de.', english: 'Okay.', translations: { hi: 'ठीक है।', es: 'Está bien.', ja: 'わかりました。' } },
    ],
    translations: {
      hi: { ...localized.hi, goal1: 'बोलें', goal2: 'सीखें', goal3: 'आत्मविश्वास' },
      es: { ...localized.es, goal1: 'Habla', goal2: 'Aprende', goal3: 'Confianza' },
      ja: { ...localized.ja, goal1: '話す', goal2: '学ぶ', goal3: '自信' },
    },
  };
});
`;

fs.writeFileSync(curriculumPath, content);
console.log('Lessons generated successfully!');
