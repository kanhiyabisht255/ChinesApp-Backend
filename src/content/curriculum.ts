type LocaleText = { hi: string; es: string; ja: string };

type WordSeed = {
  chinese: string;
  pinyin: string;
  english: string;
  localized: LocaleText;
  partOfSpeech?: string;
};

type SentenceSeed = {
  chinese: string;
  pinyin: string;
  english: string;
  localized: LocaleText;
};

type LessonDefinition = {
  courseSlug: string;
  slug: string;
  title: string;
  titleCn: string;
  pinyin: string;
  description: string;
  localizedTitle: LocaleText;
  localizedDescription: LocaleText;
  order: number;
  type: 'pronunciation' | 'vocabulary' | 'dialogue' | 'grammar' | 'listening' | 'reading' | 'story' | 'character' | 'quiz';
  estimatedMinutes?: number;
  xpReward?: number;
  isPremium?: boolean;
  objectives: string[];
  words: WordSeed[];
  sentences: SentenceSeed[];
  grammarPoints?: Array<{
    title: string;
    explanation: string;
    example: string;
    examplePinyin: string;
    exampleTranslation: string;
  }>;
};

const L = (hi: string, es: string, ja: string): LocaleText => ({ hi, es, ja });

const word = (
  chinese: string,
  pinyin: string,
  english: string,
  localized: LocaleText,
  partOfSpeech: string = 'word'
): WordSeed => ({ chinese, pinyin, english, localized, partOfSpeech });

const sentence = (
  chinese: string,
  pinyin: string,
  english: string,
  localized: LocaleText
): SentenceSeed => ({ chinese, pinyin, english, localized });

const translationsForFields = (title: LocaleText, description: LocaleText) => ({
  hi: { title: title.hi, description: description.hi },
  es: { title: title.es, description: description.es },
  ja: { title: title.ja, description: description.ja },
});

export const COURSE_SEEDS = [
  {
    slug: 'pinyin-and-tones',
    title: 'Pinyin & Four Tones',
    titleCn: '拼音和声调',
    hskLevel: 1,
    description: 'Build clear pronunciation with initials, finals and the four Mandarin tones.',
    color: '#22C55E',
    icon: 'graphic_eq',
    isPremium: false,
    order: 1,
    level: 'starter',
    category: 'pronunciation',
    accessTier: 'free',
    outcomes: ['Read basic pinyin', 'Recognize four tones', 'Pronounce useful syllables'],
    supportedLanguages: ['en', 'hi', 'es', 'ja'],
    isPublished: true,
    translations: translationsForFields(
      L('पिनयिन और चार स्वर', 'Pinyin y los cuatro tonos', 'ピンインと四声'),
      L('चीनी उच्चारण की मजबूत नींव बनाएं।', 'Construye una base sólida de pronunciación china.', '中国語の発音の基礎を作ります。')
    ),
  },
  {
    slug: 'survival-chinese',
    title: 'Greetings & Survival Chinese',
    titleCn: '问候和基础中文',
    hskLevel: 1,
    description: 'Greet people, introduce yourself and handle your first Chinese conversations.',
    color: '#7F43FE',
    icon: 'waving_hand',
    isPremium: false,
    order: 2,
    level: 'starter',
    category: 'speaking',
    accessTier: 'free',
    outcomes: ['Introduce yourself', 'Ask simple questions', 'Use polite expressions'],
    supportedLanguages: ['en', 'hi', 'es', 'ja'],
    isPublished: true,
    translations: translationsForFields(
      L('अभिवादन और शुरुआती चीनी', 'Saludos y chino esencial', 'あいさつと基礎中国語'),
      L('अपनी पहली चीनी बातचीत करना सीखें।', 'Aprende a tener tus primeras conversaciones en chino.', '最初の中国語会話を学びます。')
    ),
  },
  {
    slug: 'numbers-time-dates',
    title: 'Numbers, Time & Dates',
    titleCn: '数字、时间和日期',
    hskLevel: 1,
    description: 'Count, tell time, discuss prices and make plans.',
    color: '#3B82F6',
    icon: 'schedule',
    isPremium: false,
    order: 3,
    level: 'beginner',
    category: 'foundations',
    accessTier: 'free',
    outcomes: ['Count confidently', 'Tell time and dates', 'Understand basic prices'],
    supportedLanguages: ['en', 'hi', 'es', 'ja'],
    isPublished: true,
    translations: translationsForFields(
      L('संख्याएँ, समय और तारीखें', 'Números, hora y fechas', '数字・時間・日付'),
      L('गिनती, समय, कीमत और योजनाएँ सीखें।', 'Aprende a contar, decir la hora y hablar de precios.', '数え方、時間、値段、予定を学びます。')
    ),
  },
  {
    slug: 'people-food-and-world',
    title: 'People, Food & Everyday World',
    titleCn: '人物、食物和日常生活',
    hskLevel: 2,
    description: 'Talk about family, colors, fruits, meals and everyday objects.',
    color: '#F59E0B',
    icon: 'restaurant',
    isPremium: false,
    order: 4,
    level: 'beginner',
    category: 'vocabulary',
    accessTier: 'free',
    outcomes: ['Describe people and things', 'Name common foods and fruits', 'Build practical sentences'],
    supportedLanguages: ['en', 'hi', 'es', 'ja'],
    isPublished: true,
    translations: translationsForFields(
      L('लोग, भोजन और रोज़मर्रा की दुनिया', 'Personas, comida y vida diaria', '人・食べ物・日常生活'),
      L('परिवार, रंग, फल और आम वस्तुओं पर बात करें।', 'Habla de familia, colores, frutas y objetos cotidianos.', '家族、色、果物、日用品について話します。')
    ),
  },
  {
    slug: 'daily-life-and-travel',
    title: 'Daily Life & Travel',
    titleCn: '日常生活和旅行',
    hskLevel: 3,
    description: 'Manage transport, hotels, directions, routines and common problems.',
    color: '#06B6D4',
    icon: 'flight',
    isPremium: true,
    order: 5,
    level: 'intermediate',
    category: 'conversation',
    accessTier: 'premium',
    outcomes: ['Navigate a Chinese-speaking city', 'Explain plans and problems', 'Handle travel conversations'],
    supportedLanguages: ['en', 'hi', 'es', 'ja'],
    isPublished: true,
    translations: translationsForFields(
      L('दैनिक जीवन और यात्रा', 'Vida diaria y viajes', '日常生活と旅行'),
      L('यातायात, होटल, दिशा और समस्याएँ संभालें।', 'Maneja transporte, hoteles, direcciones y problemas.', '交通、ホテル、道案内、問題への対応を学びます。')
    ),
  },
  {
    slug: 'characters-and-stories',
    title: 'Characters & Short Stories',
    titleCn: '汉字和短篇故事',
    hskLevel: 3,
    description: 'Understand character structure and learn through graded stories.',
    color: '#EC4899',
    icon: 'auto_stories',
    isPremium: true,
    order: 6,
    level: 'intermediate',
    category: 'reading',
    accessTier: 'premium',
    outcomes: ['Recognize character components', 'Read graded stories', 'Learn vocabulary in context'],
    supportedLanguages: ['en', 'hi', 'es', 'ja'],
    isPublished: true,
    translations: translationsForFields(
      L('चीनी अक्षर और छोटी कहानियाँ', 'Caracteres y cuentos cortos', '漢字とショートストーリー'),
      L('अक्षरों की बनावट समझें और कहानियों से सीखें।', 'Comprende los caracteres y aprende con historias graduadas.', '漢字の構造を理解し、物語から学びます。')
    ),
  },
  {
    slug: 'work-and-opinions',
    title: 'Work, Society & Opinions',
    titleCn: '工作、社会和观点',
    hskLevel: 5,
    description: 'Communicate professionally, explain reasons and discuss social topics.',
    color: '#EF4444',
    icon: 'business_center',
    isPremium: true,
    order: 7,
    level: 'advanced',
    category: 'business',
    accessTier: 'premium',
    outcomes: ['Speak in professional settings', 'Explain and defend opinions', 'Use connected complex sentences'],
    supportedLanguages: ['en', 'hi', 'es', 'ja'],
    isPublished: true,
    translations: translationsForFields(
      L('काम, समाज और विचार', 'Trabajo, sociedad y opiniones', '仕事・社会・意見'),
      L('पेशेवर बातचीत और जटिल विचार व्यक्त करें।', 'Comunícate profesionalmente y expresa ideas complejas.', '仕事の会話や複雑な意見表現を学びます。')
    ),
  },
  {
    slug: 'fluent-chinese',
    title: 'Fluent Chinese Expression',
    titleCn: '流利中文表达',
    hskLevel: 6,
    description: 'Develop natural rhythm, nuance, storytelling and spontaneous discussion.',
    color: '#8B5CF6',
    icon: 'record_voice_over',
    isPremium: true,
    order: 8,
    level: 'fluent',
    category: 'fluency',
    accessTier: 'premium',
    outcomes: ['Speak with natural flow', 'Understand nuance and idioms', 'Discuss unfamiliar topics spontaneously'],
    supportedLanguages: ['en', 'hi', 'es', 'ja'],
    isPublished: true,
    translations: translationsForFields(
      L('धाराप्रवाह चीनी अभिव्यक्ति', 'Expresión china fluida', '流暢な中国語表現'),
      L('स्वाभाविक लय, बारीक अर्थ और सहज चर्चा विकसित करें।', 'Desarrolla ritmo natural, matices y conversación espontánea.', '自然なリズム、ニュアンス、即興会話を身につけます。')
    ),
  },
];

const LESSON_DEFINITIONS: LessonDefinition[] = [
  {
    courseSlug: 'pinyin-and-tones', slug: 'tone-shapes', title: 'Hear the Four Tones', titleCn: '听四声', pinyin: 'tīng sì shēng',
    description: 'Hear and imitate the four Mandarin tone shapes.', localizedTitle: L('चार स्वर सुनें', 'Escucha los cuatro tonos', '四声を聞く'), localizedDescription: L('चारों स्वरों को सुनें और दोहराएँ।', 'Escucha e imita los cuatro tonos.', '四声を聞いて真似します。'),
    order: 1, type: 'pronunciation', objectives: ['Identify tone direction', 'Repeat each tone clearly'],
    words: [word('妈', 'mā', 'mother', L('माँ', 'madre', '母')), word('麻', 'má', 'hemp', L('भांग का रेशा', 'cáñamo', '麻')), word('马', 'mǎ', 'horse', L('घोड़ा', 'caballo', '馬')), word('骂', 'mà', 'to scold', L('डाँटना', 'regañar', '叱る'))],
    sentences: [sentence('妈妈骑马。', 'Māma qí mǎ.', 'Mother rides a horse.', L('माँ घोड़े की सवारी करती हैं।', 'Mamá monta a caballo.', '母は馬に乗ります。'))],
  },
  {
    courseSlug: 'pinyin-and-tones', slug: 'initials-finals', title: 'Initials & Finals', titleCn: '声母和韵母', pinyin: 'shēng mǔ hé yùn mǔ',
    description: 'Combine common initials and finals into accurate syllables.', localizedTitle: L('शुरुआती और अंतिम ध्वनियाँ', 'Iniciales y finales', '声母と韻母'), localizedDescription: L('चीनी ध्वनियों को सही ढंग से जोड़ें।', 'Combina sonidos chinos correctamente.', '中国語の音を正しく組み合わせます。'),
    order: 2, type: 'pronunciation', objectives: ['Distinguish j/q/x', 'Produce zh/ch/sh sounds'],
    words: [word('家', 'jiā', 'home', L('घर', 'casa', '家')), word('去', 'qù', 'to go', L('जाना', 'ir', '行く')), word('学', 'xué', 'to study', L('पढ़ना', 'estudiar', '学ぶ')), word('吃', 'chī', 'to eat', L('खाना', 'comer', '食べる'))],
    sentences: [sentence('我去学校。', 'Wǒ qù xuéxiào.', 'I go to school.', L('मैं स्कूल जाता/जाती हूँ।', 'Voy a la escuela.', '私は学校へ行きます。'))],
  },
  {
    courseSlug: 'pinyin-and-tones', slug: 'tone-changes', title: 'Tone Changes in Real Speech', titleCn: '变调', pinyin: 'biàn diào',
    description: 'Use third-tone, 一 and 不 tone changes naturally.', localizedTitle: L('बोलचाल में स्वर परिवर्तन', 'Cambios de tono al hablar', '会話の変調'), localizedDescription: L('वास्तविक बातचीत में स्वर बदलना सीखें।', 'Aprende cambios de tono naturales.', '自然な変調を学びます。'),
    order: 3, type: 'listening', objectives: ['Use 你好 naturally', 'Apply 一 and 不 tone changes'],
    words: [word('你好', 'ní hǎo', 'hello', L('नमस्ते', 'hola', 'こんにちは'), 'phrase'), word('一个', 'yí ge', 'one item', L('एक चीज़', 'un artículo', '一つ')), word('不是', 'bú shì', 'is not', L('नहीं है', 'no es', 'ではない')), word('很好', 'hěn hǎo', 'very good', L('बहुत अच्छा', 'muy bien', 'とても良い'))],
    sentences: [sentence('这不是一个问题。', 'Zhè bú shì yí ge wèntí.', 'This is not a problem.', L('यह कोई समस्या नहीं है।', 'Esto no es un problema.', 'これは問題ではありません。'))],
  },
  {
    courseSlug: 'survival-chinese', slug: 'hello-goodbye', title: 'Hello, Thanks & Goodbye', titleCn: '你好、谢谢、再见', pinyin: 'nǐ hǎo, xièxie, zàijiàn',
    description: 'Use the most important polite phrases from day one.', localizedTitle: L('नमस्ते, धन्यवाद और अलविदा', 'Hola, gracias y adiós', 'こんにちは・ありがとう・さようなら'), localizedDescription: L('पहले दिन से जरूरी विनम्र वाक्य सीखें।', 'Usa frases corteses desde el primer día.', '初日から大切な丁寧表現を学びます。'),
    order: 1, type: 'dialogue', objectives: ['Greet politely', 'Thank someone', 'Say goodbye'],
    words: [word('你好', 'nǐ hǎo', 'hello', L('नमस्ते', 'hola', 'こんにちは'), 'phrase'), word('谢谢', 'xièxie', 'thank you', L('धन्यवाद', 'gracias', 'ありがとう'), 'phrase'), word('不客气', 'bú kèqi', "you're welcome", L('कोई बात नहीं', 'de nada', 'どういたしまして'), 'phrase'), word('再见', 'zàijiàn', 'goodbye', L('अलविदा', 'adiós', 'さようなら'), 'phrase')],
    sentences: [sentence('你好！很高兴认识你。', 'Nǐ hǎo! Hěn gāoxìng rènshi nǐ.', 'Hello! Nice to meet you.', L('नमस्ते! आपसे मिलकर खुशी हुई।', '¡Hola! Mucho gusto.', 'こんにちは！お会いできてうれしいです。'))],
  },
  {
    courseSlug: 'survival-chinese', slug: 'introduce-yourself', title: 'Introduce Yourself', titleCn: '自我介绍', pinyin: 'zìwǒ jièshào',
    description: 'Say your name, nationality and the languages you speak.', localizedTitle: L('अपना परिचय दें', 'Preséntate', '自己紹介'), localizedDescription: L('नाम, देश और भाषा बताना सीखें।', 'Di tu nombre, país e idiomas.', '名前、国、言語を伝えます。'),
    order: 2, type: 'dialogue', objectives: ['Say your name', 'Ask where someone is from'],
    words: [word('我', 'wǒ', 'I / me', L('मैं', 'yo', '私'), 'pronoun'), word('叫', 'jiào', 'to be called', L('नाम होना', 'llamarse', '〜という')), word('来自', 'láizì', 'to come from', L('से आना', 'venir de', '〜出身')), word('国家', 'guójiā', 'country', L('देश', 'país', '国'))],
    sentences: [sentence('我叫安娜，我来自西班牙。', 'Wǒ jiào Ānnà, wǒ láizì Xībānyá.', 'My name is Ana, and I am from Spain.', L('मेरा नाम अन्ना है और मैं स्पेन से हूँ।', 'Me llamo Ana y soy de España.', '私はアナです。スペイン出身です。'))],
  },
  {
    courseSlug: 'survival-chinese', slug: 'simple-questions', title: 'Ask Simple Questions', titleCn: '简单问题', pinyin: 'jiǎndān wèntí',
    description: 'Ask who, what, where and whether something is true.', localizedTitle: L('सरल प्रश्न पूछें', 'Haz preguntas sencillas', '簡単な質問'), localizedDescription: L('कौन, क्या, कहाँ और हाँ/ना प्रश्न सीखें।', 'Pregunta quién, qué, dónde y sí/no.', '誰・何・どこ・はい/いいえの質問を学びます。'),
    order: 3, type: 'grammar', objectives: ['Use 吗 questions', 'Use 什么 and 哪里'],
    words: [word('吗', 'ma', 'question particle', L('प्रश्न कण', 'partícula interrogativa', '疑問助詞'), 'particle'), word('什么', 'shénme', 'what', L('क्या', 'qué', '何')), word('哪里', 'nǎlǐ', 'where', L('कहाँ', 'dónde', 'どこ')), word('谁', 'shéi', 'who', L('कौन', 'quién', '誰'))],
    sentences: [sentence('你是学生吗？', 'Nǐ shì xuésheng ma?', 'Are you a student?', L('क्या आप विद्यार्थी हैं?', '¿Eres estudiante?', 'あなたは学生ですか。'))],
    grammarPoints: [{ title: 'Yes/no questions with 吗', explanation: 'Add 吗 at the end of a statement to turn it into a neutral yes/no question.', example: '你忙吗？', examplePinyin: 'Nǐ máng ma?', exampleTranslation: 'Are you busy?' }],
  },
  {
    courseSlug: 'numbers-time-dates', slug: 'numbers-0-100', title: 'Numbers 0–100', titleCn: '零到一百', pinyin: 'líng dào yì bǎi',
    description: 'Build every number from zero to one hundred.', localizedTitle: L('0 से 100 तक संख्याएँ', 'Números del 0 al 100', '0から100まで'), localizedDescription: L('शून्य से सौ तक सभी संख्याएँ बोलें।', 'Forma todos los números hasta cien.', '0から100までの数字を作ります。'),
    order: 1, type: 'vocabulary', objectives: ['Count to 100', 'Combine tens and units'],
    words: [word('零', 'líng', 'zero', L('शून्य', 'cero', 'ゼロ'), 'number'), word('一', 'yī', 'one', L('एक', 'uno', '一'), 'number'), word('十', 'shí', 'ten', L('दस', 'diez', '十'), 'number'), word('百', 'bǎi', 'hundred', L('सौ', 'cien', '百'), 'number')],
    sentences: [sentence('二十五加十等于三十五。', 'Èrshíwǔ jiā shí děngyú sānshíwǔ.', 'Twenty-five plus ten equals thirty-five.', L('पच्चीस और दस मिलाकर पैंतीस होते हैं।', 'Veinticinco más diez son treinta y cinco.', '25足す10は35です。'))],
  },
  {
    courseSlug: 'numbers-time-dates', slug: 'clock-and-routine', title: 'Clock Time & Daily Routine', titleCn: '时间和作息', pinyin: 'shíjiān hé zuòxī',
    description: 'Ask the time and describe when activities happen.', localizedTitle: L('समय और दैनिक दिनचर्या', 'La hora y la rutina', '時間と日課'), localizedDescription: L('समय पूछें और दिनचर्या बताएं।', 'Pregunta la hora y describe tu rutina.', '時間を尋ね、日課を説明します。'),
    order: 2, type: 'dialogue', objectives: ['Tell exact time', 'Use morning and evening words'],
    words: [word('现在', 'xiànzài', 'now', L('अभी', 'ahora', '今')), word('几点', 'jǐ diǎn', 'what time', L('कितने बजे', 'qué hora', '何時')), word('早上', 'zǎoshang', 'morning', L('सुबह', 'mañana', '朝')), word('晚上', 'wǎnshang', 'evening', L('शाम/रात', 'noche', '夜'))],
    sentences: [sentence('我早上七点起床。', 'Wǒ zǎoshang qī diǎn qǐchuáng.', 'I get up at seven in the morning.', L('मैं सुबह सात बजे उठता/उठती हूँ।', 'Me levanto a las siete.', '私は朝7時に起きます。'))],
  },
  {
    courseSlug: 'numbers-time-dates', slug: 'dates-and-prices', title: 'Dates, Money & Prices', titleCn: '日期、钱和价格', pinyin: 'rìqī, qián hé jiàgé',
    description: 'Say dates, understand prices and ask how much things cost.', localizedTitle: L('तारीख, पैसे और कीमत', 'Fechas, dinero y precios', '日付・お金・値段'), localizedDescription: L('तारीख और कीमतों की बातचीत सीखें।', 'Habla de fechas y precios.', '日付と値段について話します。'),
    order: 3, type: 'dialogue', objectives: ['Say a full date', 'Ask and understand prices'],
    words: [word('今天', 'jīntiān', 'today', L('आज', 'hoy', '今日')), word('月', 'yuè', 'month', L('महीना', 'mes', '月')), word('多少钱', 'duōshao qián', 'how much money', L('कितने पैसे', 'cuánto cuesta', 'いくら')), word('块', 'kuài', 'yuan (spoken)', L('युआन', 'yuan', '元'))],
    sentences: [sentence('这个苹果多少钱？', 'Zhège píngguǒ duōshao qián?', 'How much is this apple?', L('यह सेब कितने का है?', '¿Cuánto cuesta esta manzana?', 'このりんごはいくらですか。'))],
  },
  {
    courseSlug: 'people-food-and-world', slug: 'family-and-people', title: 'Family & People', titleCn: '家人和人物', pinyin: 'jiārén hé rénwù',
    description: 'Introduce family members and describe people.', localizedTitle: L('परिवार और लोग', 'Familia y personas', '家族と人'), localizedDescription: L('परिवार का परिचय और लोगों का वर्णन करें।', 'Presenta a tu familia y describe personas.', '家族を紹介し、人を説明します。'),
    order: 1, type: 'vocabulary', objectives: ['Name close family', 'Use simple descriptions'],
    words: [word('妈妈', 'māma', 'mother', L('माँ', 'madre', '母')), word('爸爸', 'bàba', 'father', L('पिता', 'padre', '父')), word('朋友', 'péngyou', 'friend', L('दोस्त', 'amigo', '友達')), word('孩子', 'háizi', 'child', L('बच्चा', 'niño', '子ども'))],
    sentences: [sentence('她是我的好朋友。', 'Tā shì wǒ de hǎo péngyou.', 'She is my good friend.', L('वह मेरी अच्छी दोस्त है।', 'Ella es mi buena amiga.', '彼女は私の親友です。'))],
  },
  {
    courseSlug: 'people-food-and-world', slug: 'colors-fruits-objects', title: 'Colors, Fruits & Objects', titleCn: '颜色、水果和物品', pinyin: 'yánsè, shuǐguǒ hé wùpǐn',
    description: 'Learn visual vocabulary for colors, fruits and useful objects.', localizedTitle: L('रंग, फल और वस्तुएँ', 'Colores, frutas y objetos', '色・果物・物'), localizedDescription: L('रंगों, फलों और आम वस्तुओं के शब्द सीखें।', 'Aprende colores, frutas y objetos útiles.', '色、果物、日用品の単語を学びます。'),
    order: 2, type: 'vocabulary', objectives: ['Name common fruits', 'Describe color and size'],
    words: [word('苹果', 'píngguǒ', 'apple', L('सेब', 'manzana', 'りんご')), word('香蕉', 'xiāngjiāo', 'banana', L('केला', 'plátano', 'バナナ')), word('红色', 'hóngsè', 'red', L('लाल', 'rojo', '赤')), word('黄色', 'huángsè', 'yellow', L('पीला', 'amarillo', '黄色'))],
    sentences: [sentence('我喜欢红色的苹果。', 'Wǒ xǐhuan hóngsè de píngguǒ.', 'I like red apples.', L('मुझे लाल सेब पसंद हैं।', 'Me gustan las manzanas rojas.', '私は赤いりんごが好きです。'))],
  },
  {
    courseSlug: 'people-food-and-world', slug: 'meals-and-taste', title: 'Meals & Taste', titleCn: '饮食和味道', pinyin: 'yǐnshí hé wèidào',
    description: 'Order simple food and describe how it tastes.', localizedTitle: L('भोजन और स्वाद', 'Comidas y sabores', '食事と味'), localizedDescription: L('भोजन मँगाएँ और स्वाद का वर्णन करें।', 'Pide comida y describe sabores.', '食べ物を注文し、味を説明します。'),
    order: 3, type: 'dialogue', objectives: ['Order a meal', 'Say likes and dislikes'],
    words: [word('米饭', 'mǐfàn', 'cooked rice', L('पका चावल', 'arroz cocido', 'ご飯')), word('面条', 'miàntiáo', 'noodles', L('नूडल्स', 'fideos', '麺')), word('好吃', 'hǎochī', 'delicious', L('स्वादिष्ट', 'delicioso', 'おいしい')), word('辣', 'là', 'spicy', L('तीखा', 'picante', '辛い'))],
    sentences: [sentence('我要一碗不辣的面条。', 'Wǒ yào yì wǎn bú là de miàntiáo.', 'I want a bowl of non-spicy noodles.', L('मुझे बिना तीखे नूडल्स का एक कटोरा चाहिए।', 'Quiero un tazón de fideos no picantes.', '辛くない麺を一杯ください。'))],
  },
  {
    courseSlug: 'daily-life-and-travel', slug: 'transport-directions', title: 'Transport & Directions', titleCn: '交通和问路', pinyin: 'jiāotōng hé wènlù',
    description: 'Find places and use buses, metro and taxis.', localizedTitle: L('यातायात और दिशा', 'Transporte y direcciones', '交通と道案内'), localizedDescription: L('जगह खोजें और सार्वजनिक परिवहन उपयोग करें।', 'Encuentra lugares y usa el transporte público.', '場所を探し、公共交通を利用します。'),
    order: 1, type: 'dialogue', isPremium: true, objectives: ['Ask for directions', 'Understand left, right and straight'],
    words: [word('地铁', 'dìtiě', 'metro', L('मेट्रो', 'metro', '地下鉄')), word('车站', 'chēzhàn', 'station', L('स्टेशन', 'estación', '駅')), word('左边', 'zuǒbian', 'left side', L('बाईं ओर', 'izquierda', '左側')), word('一直走', 'yìzhí zǒu', 'go straight', L('सीधे जाएँ', 'sigue recto', 'まっすぐ行く'))],
    sentences: [sentence('请问，地铁站怎么走？', 'Qǐngwèn, dìtiězhàn zěnme zǒu?', 'Excuse me, how do I get to the metro station?', L('माफ़ कीजिए, मेट्रो स्टेशन कैसे जाएँ?', 'Disculpe, ¿cómo llego al metro?', 'すみません、地下鉄駅へはどう行きますか。'))],
  },
  {
    courseSlug: 'daily-life-and-travel', slug: 'hotel-and-airport', title: 'Hotel & Airport', titleCn: '酒店和机场', pinyin: 'jiǔdiàn hé jīchǎng',
    description: 'Check in, confirm reservations and solve common travel issues.', localizedTitle: L('होटल और हवाई अड्डा', 'Hotel y aeropuerto', 'ホテルと空港'), localizedDescription: L('चेक-इन, बुकिंग और यात्रा समस्याएँ संभालें।', 'Gestiona reservas y problemas de viaje.', '予約や旅行中の問題に対応します。'),
    order: 2, type: 'dialogue', isPremium: true, objectives: ['Check into a hotel', 'Ask about flight information'],
    words: [word('护照', 'hùzhào', 'passport', L('पासपोर्ट', 'pasaporte', 'パスポート')), word('预订', 'yùdìng', 'reservation', L('बुकिंग', 'reserva', '予約')), word('房间', 'fángjiān', 'room', L('कमरा', 'habitación', '部屋')), word('航班', 'hángbān', 'flight', L('उड़ान', 'vuelo', '便'))],
    sentences: [sentence('我预订了一个房间。', 'Wǒ yùdìng le yí ge fángjiān.', 'I reserved a room.', L('मैंने एक कमरा बुक किया है।', 'He reservado una habitación.', '部屋を予約しました。'))],
  },
  {
    courseSlug: 'daily-life-and-travel', slug: 'health-and-problems', title: 'Health & Common Problems', titleCn: '健康和常见问题', pinyin: 'jiànkāng hé chángjiàn wèntí',
    description: 'Describe symptoms, ask for help and explain what went wrong.', localizedTitle: L('स्वास्थ्य और आम समस्याएँ', 'Salud y problemas comunes', '健康とよくある問題'), localizedDescription: L('लक्षण और समस्या समझाकर मदद माँगें।', 'Describe síntomas y pide ayuda.', '症状や問題を説明して助けを求めます。'),
    order: 3, type: 'dialogue', isPremium: true, objectives: ['Describe pain', 'Ask for urgent help'],
    words: [word('医生', 'yīshēng', 'doctor', L('डॉक्टर', 'médico', '医者')), word('头疼', 'tóuténg', 'headache', L('सिरदर्द', 'dolor de cabeza', '頭痛')), word('帮忙', 'bāngmáng', 'to help', L('मदद करना', 'ayudar', '手伝う')), word('丢了', 'diū le', 'lost', L('खो गया', 'perdido', 'なくした'))],
    sentences: [sentence('我头疼，而且有点儿发烧。', 'Wǒ tóuténg, érqiě yǒudiǎnr fāshāo.', 'I have a headache and a slight fever.', L('मुझे सिरदर्द और थोड़ा बुखार है।', 'Me duele la cabeza y tengo algo de fiebre.', '頭が痛くて、少し熱があります。'))],
  },
  {
    courseSlug: 'characters-and-stories', slug: 'character-building-blocks', title: 'Character Building Blocks', titleCn: '汉字部件', pinyin: 'hànzì bùjiàn',
    description: 'Use radicals and components to remember unfamiliar characters.', localizedTitle: L('चीनी अक्षरों के भाग', 'Componentes de caracteres', '漢字の部品'), localizedDescription: L('मूल भागों से अक्षर याद करना सीखें।', 'Usa radicales para recordar caracteres.', '部首を使って漢字を覚えます。'),
    order: 1, type: 'character', isPremium: true, objectives: ['Recognize key radicals', 'Infer broad meaning categories'],
    words: [word('人', 'rén', 'person', L('व्यक्ति', 'persona', '人')), word('口', 'kǒu', 'mouth', L('मुँह', 'boca', '口')), word('木', 'mù', 'wood / tree', L('लकड़ी/पेड़', 'madera/árbol', '木')), word('水', 'shuǐ', 'water', L('पानी', 'agua', '水'))],
    sentences: [sentence('休字有人和木。', 'Xiū zì yǒu rén hé mù.', 'The character 休 contains person and tree.', L('休 अक्षर में व्यक्ति और पेड़ हैं।', 'El carácter 休 contiene persona y árbol.', '「休」には人と木があります。'))],
  },
  {
    courseSlug: 'characters-and-stories', slug: 'story-beijing-weather', title: 'Story: Beijing Weather', titleCn: '故事：北京的天气', pinyin: 'gùshi: Běijīng de tiānqì',
    description: 'Read and listen to a graded story about seasons in Beijing.', localizedTitle: L('कहानी: बीजिंग का मौसम', 'Historia: El clima de Pekín', '物語：北京の天気'), localizedDescription: L('बीजिंग के मौसम पर आसान कहानी पढ़ें और सुनें।', 'Lee y escucha una historia graduada.', '北京の季節についての物語を読みます。'),
    order: 2, type: 'story', isPremium: true, objectives: ['Follow a short narrative', 'Understand weather vocabulary'],
    words: [word('天气', 'tiānqì', 'weather', L('मौसम', 'clima', '天気')), word('秋天', 'qiūtiān', 'autumn', L('पतझड़', 'otoño', '秋')), word('凉快', 'liángkuai', 'cool and pleasant', L('ठंडा और सुखद', 'fresco', '涼しい')), word('以前', 'yǐqián', 'before', L('पहले', 'antes', '以前'))],
    sentences: [sentence('北京的秋天很漂亮，天气也很凉快。', 'Běijīng de qiūtiān hěn piàoliang, tiānqì yě hěn liángkuai.', 'Autumn in Beijing is beautiful, and the weather is pleasantly cool.', L('बीजिंग का पतझड़ सुंदर और मौसम सुहावना होता है।', 'El otoño de Pekín es bonito y fresco.', '北京の秋は美しく、涼しいです。'))],
  },
  {
    courseSlug: 'characters-and-stories', slug: 'story-listening-skills', title: 'Story Listening Skills', titleCn: '故事听力技巧', pinyin: 'gùshi tīnglì jìqiǎo',
    description: 'Use keywords, context and replay to understand natural narration.', localizedTitle: L('कहानी सुनने की तकनीक', 'Técnicas para escuchar historias', '物語リスニング'), localizedDescription: L('मुख्य शब्द और संदर्भ से कहानी समझें।', 'Comprende historias mediante palabras clave.', 'キーワードと文脈から物語を理解します。'),
    order: 3, type: 'listening', isPremium: true, objectives: ['Listen for time and place', 'Retell the main idea'],
    words: [word('后来', 'hòulái', 'later', L('बाद में', 'después', 'その後')), word('突然', 'tūrán', 'suddenly', L('अचानक', 'de repente', '突然')), word('发现', 'fāxiàn', 'to discover', L('पता लगाना', 'descubrir', '気づく')), word('终于', 'zhōngyú', 'finally', L('आखिरकार', 'finalmente', 'ついに'))],
    sentences: [sentence('后来，他突然发现自己坐错了车。', 'Hòulái, tā tūrán fāxiàn zìjǐ zuò cuò le chē.', 'Later, he suddenly realized he had taken the wrong bus.', L('बाद में उसे अचानक पता चला कि वह गलत बस में बैठा है।', 'Después descubrió que había tomado el autobús equivocado.', 'その後、彼はバスを間違えたことに気づきました。'))],
  },
  {
    courseSlug: 'work-and-opinions', slug: 'professional-introductions', title: 'Professional Introductions', titleCn: '职场介绍', pinyin: 'zhíchǎng jièshào',
    description: 'Introduce your role, experience and responsibilities naturally.', localizedTitle: L('पेशेवर परिचय', 'Presentaciones profesionales', '仕事の自己紹介'), localizedDescription: L('भूमिका, अनुभव और जिम्मेदारियाँ बताएं।', 'Presenta tu cargo y experiencia.', '役職、経験、責任を説明します。'),
    order: 1, type: 'dialogue', isPremium: true, objectives: ['Describe professional experience', 'Use polite workplace language'],
    words: [word('负责', 'fùzé', 'to be responsible for', L('जिम्मेदार होना', 'ser responsable de', '担当する')), word('经验', 'jīngyàn', 'experience', L('अनुभव', 'experiencia', '経験')), word('项目', 'xiàngmù', 'project', L('परियोजना', 'proyecto', 'プロジェクト')), word('合作', 'hézuò', 'to cooperate', L('सहयोग करना', 'colaborar', '協力する'))],
    sentences: [sentence('我负责产品设计，也有五年的管理经验。', 'Wǒ fùzé chǎnpǐn shèjì, yě yǒu wǔ nián de guǎnlǐ jīngyàn.', 'I am responsible for product design and have five years of management experience.', L('मैं उत्पाद डिज़ाइन संभालता/संभालती हूँ और पाँच साल का प्रबंधन अनुभव है।', 'Soy responsable del diseño y tengo cinco años de experiencia.', '製品設計を担当し、管理経験が5年あります。'))],
  },
  {
    courseSlug: 'work-and-opinions', slug: 'reasons-and-comparisons', title: 'Reasons, Results & Comparisons', titleCn: '原因、结果和比较', pinyin: 'yuányīn, jiéguǒ hé bǐjiào',
    description: 'Connect ideas and explain why one option is better.', localizedTitle: L('कारण, परिणाम और तुलना', 'Razones, resultados y comparaciones', '理由・結果・比較'), localizedDescription: L('विचार जोड़ें और विकल्पों की तुलना करें।', 'Conecta ideas y compara opciones.', '考えをつなぎ、選択肢を比較します。'),
    order: 2, type: 'grammar', isPremium: true, objectives: ['Use 因为…所以…', 'Make nuanced comparisons'],
    words: [word('因为', 'yīnwèi', 'because', L('क्योंकि', 'porque', 'なぜなら')), word('所以', 'suǒyǐ', 'therefore', L('इसलिए', 'por eso', 'だから')), word('相比', 'xiāngbǐ', 'compared with', L('तुलना में', 'comparado con', '比べると')), word('更加', 'gèngjiā', 'even more', L('और अधिक', 'aún más', 'さらに'))],
    sentences: [sentence('因为这个方案更简单，所以风险也比较低。', "Yīnwèi zhège fāng'àn gèng jiǎndān, suǒyǐ fēngxiǎn yě bǐjiào dī.", 'Because this plan is simpler, the risk is also relatively low.', L('क्योंकि यह योजना सरल है, इसलिए जोखिम भी कम है।', 'Como este plan es más sencillo, el riesgo es menor.', 'この案は簡単なので、リスクも比較的低いです。'))],
    grammarPoints: [{ title: '因为…所以…', explanation: 'Use 因为 to introduce a reason and 所以 to introduce the result.', example: '因为下雨，所以我没去。', examplePinyin: 'Yīnwèi xiàyǔ, suǒyǐ wǒ méi qù.', exampleTranslation: "Because it rained, I didn't go." }],
  },
  {
    courseSlug: 'work-and-opinions', slug: 'meetings-and-negotiation', title: 'Meetings & Negotiation', titleCn: '会议和谈判', pinyin: 'huìyì hé tánpàn',
    description: 'Clarify, disagree politely and move a discussion forward.', localizedTitle: L('बैठक और बातचीत', 'Reuniones y negociación', '会議と交渉'), localizedDescription: L('विनम्र असहमति और स्पष्ट बातचीत सीखें।', 'Aclara, discrepa con cortesía y negocia.', '確認、丁寧な反対、交渉を学びます。'),
    order: 3, type: 'dialogue', isPremium: true, objectives: ['Disagree politely', 'Ask for clarification'],
    words: [word('同意', 'tóngyì', 'to agree', L('सहमत होना', 'estar de acuerdo', '同意する')), word('考虑', 'kǎolǜ', 'to consider', L('विचार करना', 'considerar', '検討する')), word('建议', 'jiànyì', 'suggestion', L('सुझाव', 'sugerencia', '提案')), word('具体', 'jùtǐ', 'specific', L('विशिष्ट', 'concreto', '具体的'))],
    sentences: [sentence('我理解你的看法，不过我们也需要考虑成本。', 'Wǒ lǐjiě nǐ de kànfǎ, búguò wǒmen yě xūyào kǎolǜ chéngběn.', 'I understand your view, but we also need to consider the cost.', L('मैं आपका विचार समझता/समझती हूँ, लेकिन हमें लागत भी देखनी होगी।', 'Entiendo tu opinión, pero debemos considerar el coste.', 'ご意見は理解しますが、コストも検討する必要があります。'))],
  },
  {
    courseSlug: 'fluent-chinese', slug: 'natural-connectors', title: 'Natural Connectors & Rhythm', titleCn: '自然连接和语感', pinyin: 'zìrán liánjiē hé yǔgǎn',
    description: 'Sound less translated by linking ideas the way native speakers do.', localizedTitle: L('स्वाभाविक जोड़ और लय', 'Conectores y ritmo natural', '自然な接続とリズム'), localizedDescription: L('मूल वक्ताओं जैसी लय में विचार जोड़ें।', 'Conecta ideas con ritmo natural.', 'ネイティブらしく考えをつなぎます。'),
    order: 1, type: 'dialogue', isPremium: true, objectives: ['Use discourse connectors', 'Reduce unnatural pauses'],
    words: [word('其实', 'qíshí', 'actually', L('असल में', 'en realidad', '実は')), word('反正', 'fǎnzhèng', 'anyway', L('वैसे भी', 'de todos modos', 'とにかく')), word('总的来说', 'zǒng de lái shuō', 'generally speaking', L('कुल मिलाकर', 'en general', '全体的に言えば')), word('换句话说', 'huàn jù huà shuō', 'in other words', L('दूसरे शब्दों में', 'en otras palabras', '言い換えると'))],
    sentences: [sentence('其实我也不太确定，换句话说，我们还需要更多信息。', 'Qíshí wǒ yě bú tài quèdìng, huàn jù huà shuō, wǒmen hái xūyào gèng duō xìnxī.', 'Actually, I am not entirely sure; in other words, we still need more information.', L('असल में मैं भी पूरी तरह निश्चित नहीं हूँ; दूसरे शब्दों में, हमें और जानकारी चाहिए।', 'En realidad no estoy seguro; necesitamos más información.', '実は確信がありません。言い換えると、もっと情報が必要です。'))],
  },
  {
    courseSlug: 'fluent-chinese', slug: 'idioms-and-nuance', title: 'Idioms & Nuance', titleCn: '成语和语气', pinyin: 'chéngyǔ hé yǔqì',
    description: 'Understand common idioms without sounding forced or unnatural.', localizedTitle: L('मुहावरे और बारीक अर्थ', 'Modismos y matices', '成語とニュアンス'), localizedDescription: L('सामान्य मुहावरों का स्वाभाविक उपयोग समझें।', 'Comprende modismos sin sonar forzado.', '成語を自然に理解して使います。'),
    order: 2, type: 'reading', isPremium: true, objectives: ['Interpret common idioms', 'Choose context-appropriate expressions'],
    words: [word('一步一步', 'yí bù yí bù', 'step by step', L('कदम दर कदम', 'paso a paso', '一歩ずつ')), word('顺其自然', 'shùn qí zìrán', 'let nature take its course', L('स्वाभाविक रूप से होने दें', 'dejar que siga su curso', '自然に任せる')), word('说来话长', 'shuō lái huà cháng', "it's a long story", L('कहानी लंबी है', 'es una larga historia', '話せば長い')), word('一举两得', 'yì jǔ liǎng dé', 'achieve two goals at once', L('एक तीर से दो निशाने', 'matar dos pájaros de un tiro', '一石二鳥'))],
    sentences: [sentence('学语言要一步一步来，不能太着急。', 'Xué yǔyán yào yí bù yí bù lái, bù néng tài zháojí.', 'Language learning must happen step by step; you cannot rush too much.', L('भाषा धीरे-धीरे सीखनी चाहिए, बहुत जल्दी नहीं करनी चाहिए।', 'Un idioma se aprende paso a paso.', '語学は一歩ずつ学び、焦りすぎてはいけません。'))],
  },
  {
    courseSlug: 'fluent-chinese', slug: 'spontaneous-discussion', title: 'Spontaneous Discussion', titleCn: '即兴讨论', pinyin: 'jíxìng tǎolùn',
    description: 'Organize an answer quickly and discuss unfamiliar topics with confidence.', localizedTitle: L('तुरंत चर्चा', 'Discusión espontánea', '即興ディスカッション'), localizedDescription: L('अनजान विषयों पर आत्मविश्वास से बोलें।', 'Habla con confianza sobre temas nuevos.', '未知の話題でも自信を持って話します。'),
    order: 3, type: 'dialogue', isPremium: true, objectives: ['Structure spontaneous answers', 'Ask follow-up questions naturally'],
    words: [word('从我的角度来看', 'cóng wǒ de jiǎodù lái kàn', 'from my perspective', L('मेरे दृष्टिकोण से', 'desde mi perspectiva', '私の観点では')), word('关键在于', 'guānjiàn zàiyú', 'the key lies in', L('मुख्य बात यह है', 'la clave está en', '鍵となるのは')), word('值得注意的是', 'zhíde zhùyì de shì', 'it is worth noting that', L('ध्यान देने योग्य है', 'cabe destacar que', '注目すべきは')), word('你怎么看', 'nǐ zěnme kàn', 'what do you think', L('आप क्या सोचते हैं', 'qué opinas', 'どう思いますか'))],
    sentences: [sentence('从我的角度来看，关键在于怎么平衡效率和质量。', 'Cóng wǒ de jiǎodù lái kàn, guānjiàn zàiyú zěnme pínghéng xiàolǜ hé zhìliàng.', 'From my perspective, the key is how to balance efficiency and quality.', L('मेरे अनुसार मुख्य बात दक्षता और गुणवत्ता में संतुलन है।', 'La clave es equilibrar eficiencia y calidad.', '私の観点では、効率と品質のバランスが重要です。'))],
  },
];

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
        prompt: `What does ${firstWord.chinese} mean?`,
        promptChinese: firstWord.chinese,
        options,
        answer: firstWord.english,
        explanation: `${firstWord.chinese} (${firstWord.pinyin}) means “${firstWord.english}”.`,
        translations: {
          hi: `${firstWord.chinese} का सही अर्थ चुनें।`,
          es: `Elige el significado correcto de ${firstWord.chinese}.`,
          ja: `${firstWord.chinese} の正しい意味を選んでください。`,
        },
      },
      {
        type: 'listen_select',
        prompt: 'Listen and choose the correct meaning.',
        promptChinese: firstWord.chinese,
        options,
        answer: firstWord.english,
        explanation: `You heard ${firstWord.chinese} (${firstWord.pinyin}).`,
        translations: {
          hi: 'सुनें और सही अर्थ चुनें।',
          es: 'Escucha y elige el significado correcto.',
          ja: '音声を聞いて正しい意味を選んでください。',
        },
      },
      ...(definition.sentences[0] ? [
        {
          type: 'speak',
          prompt: 'Say this sentence aloud. Focus on tones and rhythm.',
          promptChinese: definition.sentences[0].chinese,
          options: [],
          answer: definition.sentences[0].chinese,
          explanation: definition.sentences[0].pinyin,
          translations: {
            hi: 'इस वाक्य को बोलें और स्वरों पर ध्यान दें।',
            es: 'Di esta frase en voz alta y cuida los tonos.',
            ja: '声調とリズムに注意して文を発音してください。',
          },
        },
        {
          type: 'translate',
          prompt: `Translate into Chinese: ${definition.sentences[0].english}`,
          promptChinese: undefined,
          options: [],
          answer: definition.sentences[0].chinese,
          explanation: definition.sentences[0].pinyin,
          translations: {
            hi: `चीनी में अनुवाद करें: ${definition.sentences[0].localized.hi}`,
            es: `Traduce al chino: ${definition.sentences[0].localized.es}`,
            ja: `中国語に訳してください：${definition.sentences[0].localized.ja}`,
          },
        },
      ] : []),
      ...(definition.type === 'character' ? [{
        type: 'trace',
        prompt: `Trace and write ${firstWord.chinese}.`,
        promptChinese: firstWord.chinese,
        options: [],
        answer: firstWord.chinese,
        explanation: `Write ${firstWord.chinese} slowly and keep each stroke balanced.`,
        translations: {
          hi: `${firstWord.chinese} अक्षर को ट्रेस करके लिखें।`,
          es: `Repasa y escribe el carácter ${firstWord.chinese}.`,
          ja: `${firstWord.chinese} をなぞって書いてください。`,
        },
      }] : []),
    ] : [],
    translations: translationsForFields(definition.localizedTitle, definition.localizedDescription),
  };
});

const SCENARIO_TRANSLATIONS: Record<string, { hi: { title: string; description: string }; es: { title: string; description: string }; ja: { title: string; description: string } }> = {
  'meeting-someone': { hi: { title: 'पहली मुलाकात', description: 'अपना परिचय दें और नया दोस्त बनाएँ' }, es: { title: 'Conocer a alguien', description: 'Preséntate y haz una nueva amistad' }, ja: { title: '初対面', description: '自己紹介して新しい友達を作ります' } },
  'ordering-drinks': { hi: { title: 'पेय ऑर्डर करना', description: 'चाय, कॉफी या जूस अपनी पसंद से मँगाएँ' }, es: { title: 'Pedir bebidas', description: 'Pide té, café o zumo a tu gusto' }, ja: { title: '飲み物を注文', description: 'お茶、コーヒー、ジュースを好みに合わせて注文します' } },
  restaurant: { hi: { title: 'रेस्तरां में', description: 'खाना मँगाएँ और भोजन की पसंद बताएँ' }, es: { title: 'En un restaurante', description: 'Pide comida y explica tus preferencias' }, ja: { title: 'レストラン', description: '料理を注文し、食事の希望を伝えます' } },
  'fruit-market': { hi: { title: 'फल बाज़ार', description: 'कीमत और मात्रा पूछें तथा विनम्रता से मोलभाव करें' }, es: { title: 'Mercado de frutas', description: 'Pregunta precios y cantidades y negocia con cortesía' }, ja: { title: '果物市場', description: '値段と量を尋ね、丁寧に交渉します' } },
  'asking-directions': { hi: { title: 'रास्ता पूछना', description: 'स्टेशन, दुकान या प्रसिद्ध स्थान खोजें' }, es: { title: 'Pedir direcciones', description: 'Encuentra una estación, tienda o lugar conocido' }, ja: { title: '道を尋ねる', description: '駅、店、観光地への行き方を聞きます' } },
  'hotel-checkin': { hi: { title: 'होटल चेक-इन', description: 'बुकिंग की पुष्टि करें और कमरा माँगें' }, es: { title: 'Registro en el hotel', description: 'Confirma una reserva y solicita una habitación' }, ja: { title: 'ホテルのチェックイン', description: '予約を確認して部屋の希望を伝えます' } },
  airport: { hi: { title: 'हवाई अड्डे पर', description: 'चेक-इन, गेट और सामान के बारे में बात करें' }, es: { title: 'En el aeropuerto', description: 'Factura, encuentra la puerta y habla del equipaje' }, ja: { title: '空港', description: 'チェックイン、搭乗口、荷物について話します' } },
  doctor: { hi: { title: 'डॉक्टर के पास', description: 'लक्षण बताएँ और सलाह समझें' }, es: { title: 'Visita al médico', description: 'Describe síntomas y comprende las indicaciones' }, ja: { title: '病院で', description: '症状を説明し、医師の助言を理解します' } },
  'making-friends': { hi: { title: 'दोस्ती करना', description: 'रुचियों और योजनाओं पर स्वाभाविक बातचीत करें' }, es: { title: 'Hacer amigos', description: 'Habla con naturalidad de aficiones y planes' }, ja: { title: '友達を作る', description: '趣味や予定について自然に話します' } },
  'work-meeting': { hi: { title: 'कार्य बैठक', description: 'अपडेट दें और स्पष्टीकरण माँगें' }, es: { title: 'Reunión de trabajo', description: 'Comparte avances y pide aclaraciones' }, ja: { title: '仕事の会議', description: '進捗を共有し、確認の質問をします' } },
  'job-interview': { hi: { title: 'नौकरी का इंटरव्यू', description: 'अनुभव, खूबियाँ और लक्ष्य समझाएँ' }, es: { title: 'Entrevista de trabajo', description: 'Explica tu experiencia, fortalezas y objetivos' }, ja: { title: '就職面接', description: '経験、強み、目標を説明します' } },
  'opinion-debate': { hi: { title: 'विचार और बहस', description: 'सूक्ष्म राय दें और विनम्रता से जवाब दें' }, es: { title: 'Opinión y debate', description: 'Expresa una opinión matizada y responde con cortesía' }, ja: { title: '意見と討論', description: '丁寧に複雑な意見を述べて応答します' } },
};

export const SCENARIO_SEEDS = [
  ['meeting-someone', 'Meeting Someone', '初次见面', 'chūcì jiànmiàn', 'Introduce yourself and make a new friend', 'people', 'beginner', '#7F43FE', false],
  ['ordering-drinks', 'Ordering Drinks', '点饮料', 'diǎn yǐnliào', 'Order tea, coffee or juice and customize it', 'local_cafe', 'beginner', '#22C55E', false],
  ['restaurant', 'At a Restaurant', '在餐厅', 'zài cāntīng', 'Order a meal and handle dietary preferences', 'restaurant', 'beginner', '#F59E0B', false],
  ['fruit-market', 'Fruit Market', '水果市场', 'shuǐguǒ shìchǎng', 'Ask prices, quantities and bargain politely', 'shopping_bag', 'beginner', '#EC4899', false],
  ['asking-directions', 'Asking Directions', '问路', 'wènlù', 'Find a station, shop or landmark', 'explore', 'elementary', '#3B82F6', false],
  ['hotel-checkin', 'Hotel Check-in', '酒店入住', 'jiǔdiàn rùzhù', 'Confirm a reservation and request a room', 'hotel', 'elementary', '#06B6D4', true],
  ['airport', 'At the Airport', '在机场', 'zài jīchǎng', 'Check in, find a gate and discuss baggage', 'flight', 'intermediate', '#0EA5E9', true],
  ['doctor', 'Doctor Visit', '看医生', 'kàn yīshēng', 'Describe symptoms and understand advice', 'medical_services', 'intermediate', '#EF4444', true],
  ['making-friends', 'Making Friends', '交朋友', 'jiāo péngyou', 'Talk naturally about hobbies and plans', 'forum', 'intermediate', '#8B5CF6', true],
  ['work-meeting', 'Work Meeting', '工作会议', 'gōngzuò huìyì', 'Share an update and ask for clarification', 'business_center', 'advanced', '#6366F1', true],
  ['job-interview', 'Job Interview', '面试', 'miànshì', 'Explain experience, strengths and goals', 'work', 'advanced', '#F97316', true],
  ['opinion-debate', 'Opinion & Debate', '观点讨论', 'guāndiǎn tǎolùn', 'Express a nuanced view and respond politely', 'record_voice_over', 'advanced', '#A855F7', true],
].map((item, index) => {
  const [slug, title, titleCn, pinyin, description, icon, difficulty, color, isPremium] = item as [string, string, string, string, string, string, string, string, boolean];
  const localized = SCENARIO_TRANSLATIONS[slug];
  const dialogueTranslations = [
    { hi: 'नमस्ते! चलिए अभ्यास शुरू करते हैं।', es: '¡Hola! Empecemos a practicar.', ja: 'こんにちは！練習を始めましょう。' },
    { hi: 'ठीक है, मैं तैयार हूँ।', es: 'De acuerdo, estoy listo.', ja: 'はい、準備できました。' },
    { hi: 'चिंता मत करें, धीरे-धीरे बोलें।', es: 'No te preocupes, habla despacio.', ja: '心配しないで、ゆっくり話してください。' },
  ];
  return {
    slug,
    title,
    titleCn,
    pinyin,
    description,
    icon,
    difficulty,
    color,
    isPremium,
    order: index + 1,
    estimatedMinutes: index < 5 ? 5 : 8,
    learningGoals: ['Respond naturally', 'Use scenario vocabulary', 'Receive gentle corrections'],
    systemPrompt: `Role-play the scenario “${title}”. Stay in character, keep turns short, and adapt to the learner's HSK level.`,
    isPublished: true,
    dialogues: [
      { speaker: 'ai', chinese: '你好！我们开始练习吧。', pinyin: 'Nǐ hǎo! Wǒmen kāishǐ liànxí ba.', english: "Hello! Let's start practicing.", translations: dialogueTranslations[0] },
      { speaker: 'user', chinese: '好的，我准备好了。', pinyin: 'Hǎo de, wǒ zhǔnbèi hǎo le.', english: "Okay, I'm ready.", translations: dialogueTranslations[1] },
      { speaker: 'ai', chinese: '别担心，慢慢说。', pinyin: 'Bié dānxīn, mànmàn shuō.', english: "Don't worry, speak slowly.", translations: dialogueTranslations[2] },
    ],
    translations: {
      hi: { ...localized.hi, goal1: 'स्वाभाविक जवाब दें', goal2: 'परिस्थिति के शब्दों का उपयोग करें', goal3: 'सुधार से सीखें' },
      es: { ...localized.es, goal1: 'Responde con naturalidad', goal2: 'Usa vocabulario de la situación', goal3: 'Aprende de las correcciones' },
      ja: { ...localized.ja, goal1: '自然に答える', goal2: '場面の語彙を使う', goal3: '訂正から学ぶ' },
    },
  };
});
