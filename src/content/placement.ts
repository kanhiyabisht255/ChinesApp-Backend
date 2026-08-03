export type PlacementLanguage = 'en' | 'hi' | 'es' | 'ja';
export type PlacementSkill = 'vocabulary' | 'grammar' | 'reading';

type LocalizedText = Record<PlacementLanguage, string>;

export interface PlacementQuestionSeed {
  id: string;
  hskLevel: number;
  skill: PlacementSkill;
  prompt: LocalizedText;
  contextChinese?: string;
  contextPinyin?: string;
  options: string[];
  answer: string;
  explanation: LocalizedText;
}

const localized = (en: string, hi: string, es: string, ja: string): LocalizedText => ({ en, hi, es, ja });

export const PLACEMENT_QUESTIONS: PlacementQuestionSeed[] = [
  {
    id: 'hsk1-greeting', hskLevel: 1, skill: 'vocabulary',
    prompt: localized('Which phrase means “Hello”?', '“नमस्ते” के लिए सही चीनी वाक्य चुनें।', '¿Qué frase significa «Hola»?', '「こんにちは」を意味する中国語を選んでください。'),
    options: ['你好', '谢谢', '再见', '对不起'], answer: '你好',
    explanation: localized('你好 is the everyday greeting “hello”.', '你好 रोज़मर्रा का “नमस्ते” है।', '你好 es el saludo cotidiano «hola».', '你好 は日常的な「こんにちは」です。'),
  },
  {
    id: 'hsk1-student', hskLevel: 1, skill: 'grammar',
    prompt: localized('Choose “I am a student.”', '“मैं एक छात्र हूँ।” चुनें।', 'Elige «Soy estudiante».', '「私は学生です」を選んでください。'),
    options: ['我是学生。', '我有学生。', '我在学生。', '我叫学生。'], answer: '我是学生。',
    explanation: localized('A 是 B identifies A as B.', 'A 是 B का अर्थ है A, B है।', 'A 是 B identifica A como B.', 'A 是 B は「A は B です」の形です。'),
  },
  {
    id: 'hsk2-book-measure', hskLevel: 2, skill: 'vocabulary',
    prompt: localized('Complete the natural phrase for “three books”.', '“तीन किताबें” का सही वाक्य पूरा करें।', 'Completa la expresión natural para «tres libros».', '「3冊の本」の自然な表現を完成させてください。'),
    contextChinese: '三___书', contextPinyin: 'sān ___ shū',
    options: ['本', '只', '杯', '张'], answer: '本',
    explanation: localized('本 is the common measure word for books.', 'किताबों के लिए 本 माप शब्द है।', '本 es el clasificador habitual para libros.', '本 は本を数える量詞です。'),
  },
  {
    id: 'hsk2-completed', hskLevel: 2, skill: 'grammar',
    prompt: localized('Which sentence naturally says “I ate already”?', '“मैं पहले ही खा चुका हूँ।” का स्वाभाविक वाक्य चुनें।', '¿Qué oración expresa naturalmente «Ya comí»?', '「もう食べました」を自然に表す文を選んでください。'),
    options: ['我吃饭了。', '我了吃饭。', '我吃了饭吗。', '了我吃饭。'], answer: '我吃饭了。',
    explanation: localized('Sentence-final 了 marks a new completed situation here.', 'यहाँ वाक्य के अंत का 了 पूरा हुआ काम दिखाता है।', 'El 了 final marca aquí una situación completada.', '文末の 了 はここで完了した新しい状況を表します。'),
  },
  {
    id: 'hsk3-comparison', hskLevel: 3, skill: 'grammar',
    prompt: localized('Choose “Today is colder than yesterday.”', '“आज कल से ज़्यादा ठंड है।” चुनें।', 'Elige «Hoy hace más frío que ayer».', '「今日は昨日より寒い」を選んでください。'),
    options: ['今天比昨天冷。', '今天很昨天冷。', '昨天比今天更昨天。', '今天冷比昨天。'], answer: '今天比昨天冷。',
    explanation: localized('A 比 B + adjective compares A with B.', 'A 比 B + विशेषण तुलना का सही क्रम है।', 'A 比 B + adjetivo compara A con B.', 'A 比 B ＋形容詞で比較します。'),
  },
  {
    id: 'hsk3-reading', hskLevel: 3, skill: 'reading',
    prompt: localized('Why did Xiaoli take an umbrella?', 'शाओली ने छाता क्यों लिया?', '¿Por qué Xiaoli llevó un paraguas?', '小李はなぜ傘を持って行きましたか。'),
    contextChinese: '天气预报说下午会下雨，所以小李带了一把伞。',
    contextPinyin: 'Tiānqì yùbào shuō xiàwǔ huì xiàyǔ, suǒyǐ Xiǎo Lǐ dài le yì bǎ sǎn.',
    options: ['下午会下雨', '天气很热', '她要买东西', '朋友喜欢雨伞'], answer: '下午会下雨',
    explanation: localized('The forecast says it will rain in the afternoon.', 'मौसम की जानकारी में दोपहर को बारिश बताई गई है।', 'El pronóstico dice que lloverá por la tarde.', '天気予報で午後は雨だと言っています。'),
  },
  {
    id: 'hsk4-even-though', hskLevel: 4, skill: 'grammar',
    prompt: localized('Complete: “Although busy, he still exercises every day.”', 'पूरा करें: “व्यस्त होने के बावजूद वह रोज़ व्यायाम करता है।”', 'Completa: «Aunque está ocupado, hace ejercicio cada día».', '「忙しいけれど、毎日運動する」を完成させてください。'),
    contextChinese: '___工作很忙，___他还是每天运动。',
    options: ['虽然 / 但是', '因为 / 所以', '如果 / 就', '不但 / 而且'], answer: '虽然 / 但是',
    explanation: localized('虽然…但是… expresses “although…but…”.', '虽然…但是… का अर्थ “हालाँकि…लेकिन…” है।', '虽然…但是… significa «aunque… pero…».', '虽然…但是… は「〜だけれども…」を表します。'),
  },
  {
    id: 'hsk4-reading', hskLevel: 4, skill: 'reading',
    prompt: localized('What changed after the company allowed remote work?', 'कंपनी ने घर से काम की अनुमति दी, उसके बाद क्या बदला?', '¿Qué cambió después de permitir el trabajo remoto?', '在宅勤務が認められた後、何が変わりましたか。'),
    contextChinese: '公司允许每周在家工作两天以后，员工省下了通勤时间，开会也变得更准时了。',
    options: ['通勤时间减少了', '会议变多了', '员工工资降低了', '办公室搬家了'], answer: '通勤时间减少了',
    explanation: localized('Employees saved commuting time.', 'कर्मचारियों का आने-जाने का समय बचा।', 'Los empleados ahorraron tiempo de desplazamiento.', '従業員は通勤時間を節約できました。'),
  },
  {
    id: 'hsk5-result', hskLevel: 5, skill: 'grammar',
    prompt: localized('Which sentence means “I finally finished reading this book”?', '“आखिरकार मैंने यह किताब पूरी पढ़ ली।” चुनें।', '¿Qué oración significa «Por fin terminé de leer este libro»?', '「ついにこの本を読み終えた」を意味する文を選んでください。'),
    options: ['我终于把这本书看完了。', '我终于看这本书完把了。', '这本书终于我看把完。', '我把终于完了这本书。'], answer: '我终于把这本书看完了。',
    explanation: localized('把 brings the object forward; 看完 is the result complement “finish reading”.', '把 वस्तु को आगे लाता है और 看完 का अर्थ पढ़कर पूरा करना है।', '把 adelanta el objeto y 看完 expresa terminar de leer.', '把 で目的語を前に出し、看完 で「読み終える」を表します。'),
  },
  {
    id: 'hsk5-reading', hskLevel: 5, skill: 'reading',
    prompt: localized('What is the writer’s main point?', 'लेखक का मुख्य विचार क्या है?', '¿Cuál es la idea principal del autor?', '筆者の主な考えは何ですか。'),
    contextChinese: '学习语言不能只追求速度。每天认真练习一点，并且不断回顾错误，往往比短时间背很多内容更有效。',
    options: ['持续练习和复习更有效', '学习越快越好', '只要背单词就够了', '错误应该被忽略'], answer: '持续练习和复习更有效',
    explanation: localized('Consistent practice and reviewing mistakes are more effective than rushing.', 'लगातार अभ्यास और गलतियों की समीक्षा तेज़ी से रटने से बेहतर है।', 'La práctica constante y revisar errores es más eficaz que correr.', '継続的な練習と間違いの復習が、急ぐより効果的だという主張です。'),
  },
  {
    id: 'hsk6-idiom', hskLevel: 6, skill: 'vocabulary',
    prompt: localized('What does 画蛇添足 imply?', '画蛇添足 का भाव क्या है?', '¿Qué implica 画蛇添足?', '画蛇添足 はどんな意味ですか。'),
    options: ['做多余的事反而坏事', '提前做好准备', '认真观察细节', '勇敢面对困难'], answer: '做多余的事反而坏事',
    explanation: localized('It describes ruining something by adding an unnecessary extra step.', 'अनावश्यक चीज़ जोड़कर काम बिगाड़ देना इसका भाव है।', 'Describe arruinar algo al añadir un paso innecesario.', '余計なことを加えて、かえって台無しにする意味です。'),
  },
  {
    id: 'hsk6-reading', hskLevel: 6, skill: 'reading',
    prompt: localized('Which conclusion best matches the passage?', 'कौन-सा निष्कर्ष अनुच्छेद से सबसे अधिक मेल खाता है?', '¿Qué conclusión coincide mejor con el texto?', '文章に最も合う結論を選んでください。'),
    contextChinese: '技术可以提高沟通效率，却无法自动建立信任。真正稳定的合作关系，仍然需要双方公开表达需求，并在出现分歧时愿意承担责任。',
    options: ['信任需要坦诚和责任感', '技术能够解决所有分歧', '合作时不应该表达需求', '效率比信任更重要'], answer: '信任需要坦诚和责任感',
    explanation: localized('The passage says durable trust still requires openness and responsibility.', 'स्थायी भरोसे के लिए खुलापन और ज़िम्मेदारी आवश्यक है।', 'La confianza duradera requiere franqueza y responsabilidad.', '安定した信頼には率直さと責任感が必要だと述べています。'),
  },
];
