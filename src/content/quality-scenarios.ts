import { SCENARIO_SEEDS } from './curriculum';
import { TOPIC_BLUEPRINTS } from './topic-blueprints';

const SCENARIO_TOPIC: Record<string, string> = {
  'meeting-someone': 'introducing-yourself',
  'ordering-drinks': 'drinks-and-beverages',
  restaurant: 'ordering-food',
  'fruit-market': 'fruits-and-vegetables',
  'asking-directions': 'directions',
  'hotel-checkin': 'hotel-checkin',
  airport: 'airport-and-flight',
  doctor: 'doctor-visit',
  'making-friends': 'making-friends',
  'work-meeting': 'business-meetings',
  'job-interview': 'job-interviews',
  'opinion-debate': 'agreeing-disagreeing',
};

const translations = (
  hi: [string, string],
  es: [string, string],
  ja: [string, string]
) => ({
  hi: {
    title: hi[0], description: hi[1],
    goal1: 'बातचीत स्वाभाविक रूप से शुरू करें', goal2: 'परिस्थिति के शब्दों का उपयोग करें', goal3: 'सुधार सुनकर फिर से बोलें',
  },
  es: {
    title: es[0], description: es[1],
    goal1: 'Inicia la conversación con naturalidad', goal2: 'Usa vocabulario de la situación', goal3: 'Escucha la corrección e inténtalo de nuevo',
  },
  ja: {
    title: ja[0], description: ja[1],
    goal1: '自然に会話を始める', goal2: '場面に合う語彙を使う', goal3: '訂正を聞いて言い直す',
  },
});

const EXTRA_SCENARIO_SEEDS = [
  {
    slug: 'supermarket-shopping', courseSlug: 'shopping-malls', title: 'Supermarket Shopping', titleCn: '超市购物', pinyin: 'chāoshì gòuwù',
    description: 'Find products, compare options and pay at checkout', icon: 'shopping_cart', difficulty: 'beginner', color: '#22C55E', isPremium: false, estimatedMinutes: 6,
    translations: translations(
      ['सुपरमार्केट में खरीदारी', 'सामान खोजें, विकल्पों की तुलना करें और भुगतान करें'],
      ['Compras en el supermercado', 'Encuentra productos, compara opciones y paga'],
      ['スーパーで買い物', '商品を探し、比較して会計します']
    ),
  },
  {
    slug: 'taking-a-taxi', courseSlug: 'land-transport', title: 'Taking a Taxi', titleCn: '坐出租车', pinyin: 'zuò chūzūchē',
    description: 'Give a destination, confirm the route and handle the fare', icon: 'local_taxi', difficulty: 'beginner', color: '#3B82F6', isPremium: false, estimatedMinutes: 6,
    translations: translations(
      ['टैक्सी लेना', 'मंज़िल बताएँ, रास्ता तय करें और किराया संभालें'],
      ['Tomar un taxi', 'Indica el destino, confirma la ruta y paga la tarifa'],
      ['タクシーに乗る', '目的地と経路を確認し、料金を支払います']
    ),
  },
  {
    slug: 'train-station', courseSlug: 'air-and-rail', title: 'At the Train Station', titleCn: '在火车站', pinyin: 'zài huǒchēzhàn',
    description: 'Find the platform, confirm departure time and board correctly', icon: 'train', difficulty: 'elementary', color: '#0EA5E9', isPremium: true, estimatedMinutes: 7,
    translations: translations(
      ['रेलवे स्टेशन पर', 'प्लेटफ़ॉर्म और समय पता करें और सही ट्रेन लें'],
      ['En la estación de tren', 'Encuentra el andén, confirma la hora y sube al tren'],
      ['駅で', 'ホームと出発時刻を確認して乗車します']
    ),
  },
  {
    slug: 'buying-clothes', courseSlug: 'clothing-basics', title: 'Buying Clothes', titleCn: '买衣服', pinyin: 'mǎi yīfu',
    description: 'Ask for a size, try clothes on and decide what fits', icon: 'checkroom', difficulty: 'elementary', color: '#EC4899', isPremium: true, estimatedMinutes: 7,
    translations: translations(
      ['कपड़े खरीदना', 'साइज़ पूछें, पहनकर देखें और सही कपड़ा चुनें'],
      ['Comprar ropa', 'Pregunta la talla, pruébate la ropa y elige'],
      ['服を買う', 'サイズを尋ね、試着して選びます']
    ),
  },
  {
    slug: 'phone-call', courseSlug: 'telephone-chinese', title: 'A Phone Call', titleCn: '打电话', pinyin: 'dǎ diànhuà',
    description: 'Start a call, ask for someone and clarify unclear audio', icon: 'call', difficulty: 'elementary', color: '#8B5CF6', isPremium: true, estimatedMinutes: 7,
    translations: translations(
      ['फ़ोन कॉल', 'कॉल शुरू करें, किसी को बुलाएँ और बात स्पष्ट करें'],
      ['Una llamada telefónica', 'Inicia la llamada, pregunta por alguien y aclara el audio'],
      ['電話をかける', '電話を始め、人を呼び、聞き取れない点を確認します']
    ),
  },
  {
    slug: 'first-day-class', courseSlug: 'school-and-education', title: 'First Day in Class', titleCn: '开学第一天', pinyin: 'kāixué dì yī tiān',
    description: 'Meet a classmate, understand instructions and ask a question', icon: 'school', difficulty: 'elementary', color: '#F59E0B', isPremium: true, estimatedMinutes: 7,
    translations: translations(
      ['कक्षा का पहला दिन', 'सहपाठी से मिलें, निर्देश समझें और प्रश्न पूछें'],
      ['Primer día de clase', 'Conoce a un compañero, sigue instrucciones y pregunta'],
      ['授業の初日', 'クラスメートと会い、指示を理解して質問します']
    ),
  },
  {
    slug: 'weekend-plans', courseSlug: 'making-plans', title: 'Making Weekend Plans', titleCn: '周末计划', pinyin: 'zhōumò jìhuà',
    description: 'Suggest an activity, compare times and confirm a plan', icon: 'event', difficulty: 'elementary', color: '#14B8A6', isPremium: true, estimatedMinutes: 7,
    translations: translations(
      ['सप्ताहांत की योजना', 'गतिविधि सुझाएँ, समय मिलाएँ और योजना पक्की करें'],
      ['Planes para el fin de semana', 'Propón una actividad, compara horarios y confirma'],
      ['週末の予定', '活動を提案し、時間を合わせて予定を決めます']
    ),
  },
  {
    slug: 'service-complaint', courseSlug: 'complaints', title: 'Handling a Service Problem', titleCn: '处理服务问题', pinyin: 'chǔlǐ fúwù wèntí',
    description: 'Explain a problem calmly and request a practical solution', icon: 'support_agent', difficulty: 'intermediate', color: '#EF4444', isPremium: true, estimatedMinutes: 8,
    translations: translations(
      ['सेवा की समस्या', 'समस्या शांत तरीके से बताएँ और समाधान माँगें'],
      ['Problema con un servicio', 'Explica el problema con calma y pide una solución'],
      ['サービス問題への対応', '問題を落ち着いて説明し、解決を求めます']
    ),
  },
  {
    slug: 'dinner-invitation', courseSlug: 'invitations', title: 'Dinner Invitation', titleCn: '邀请吃饭', pinyin: 'yāoqǐng chīfàn',
    description: 'Invite someone, discuss details and respond politely', icon: 'dinner_dining', difficulty: 'intermediate', color: '#F97316', isPremium: true, estimatedMinutes: 8,
    translations: translations(
      ['रात के खाने का निमंत्रण', 'किसी को बुलाएँ, विवरण तय करें और विनम्र जवाब दें'],
      ['Invitación a cenar', 'Invita a alguien, acuerda detalles y responde con cortesía'],
      ['夕食への招待', '相手を誘い、詳細を決め、丁寧に返事します']
    ),
  },
  {
    slug: 'apology-repair', courseSlug: 'apologies-forgiveness', title: 'Apologizing and Repairing', titleCn: '道歉与和解', pinyin: 'dàoqiàn yǔ héjiě',
    description: 'Give a sincere apology, explain briefly and make things right', icon: 'handshake', difficulty: 'intermediate', color: '#A855F7', isPremium: true, estimatedMinutes: 8,
    translations: translations(
      ['माफ़ी और समझौता', 'ईमानदारी से माफ़ी माँगें और बात सुधारें'],
      ['Disculparse y arreglarlo', 'Ofrece una disculpa sincera y repara la situación'],
      ['謝罪と仲直り', '誠実に謝り、状況を改善します']
    ),
  },
  {
    slug: 'at-the-bank', courseSlug: 'bank-and-money', title: 'At the Bank', titleCn: '在银行', pinyin: 'zài yínháng',
    description: 'Ask about an account, a transfer and required documents', icon: 'account_balance', difficulty: 'intermediate', color: '#06B6D4', isPremium: true, estimatedMinutes: 8,
    translations: translations(
      ['बैंक में', 'खाते, ट्रांसफ़र और ज़रूरी दस्तावेज़ पूछें'],
      ['En el banco', 'Pregunta por una cuenta, una transferencia y documentos'],
      ['銀行で', '口座、送金、必要書類について尋ねます']
    ),
  },
  {
    slug: 'emergency-help', courseSlug: 'emergencies', title: 'Getting Emergency Help', titleCn: '紧急求助', pinyin: 'jǐnjí qiúzhù',
    description: 'State what happened, give a location and follow instructions', icon: 'emergency', difficulty: 'intermediate', color: '#DC2626', isPremium: true, estimatedMinutes: 8,
    translations: translations(
      ['आपातकालीन मदद', 'घटना और स्थान बताएँ तथा निर्देश मानें'],
      ['Pedir ayuda de emergencia', 'Explica lo ocurrido, da la ubicación y sigue instrucciones'],
      ['緊急時の助け', '状況と場所を伝え、指示に従います']
    ),
  },
  {
    slug: 'business-presentation', courseSlug: 'presentations', title: 'Business Presentation', titleCn: '商务演讲', pinyin: 'shāngwù yǎnjiǎng',
    description: 'Open clearly, explain a result and answer a question', icon: 'present_to_all', difficulty: 'advanced', color: '#6366F1', isPremium: true, estimatedMinutes: 10,
    translations: translations(
      ['व्यावसायिक प्रस्तुति', 'स्पष्ट शुरुआत करें, परिणाम बताएँ और प्रश्न का उत्तर दें'],
      ['Presentación empresarial', 'Abre con claridad, explica resultados y responde preguntas'],
      ['ビジネス発表', '明確に始め、結果を説明し、質問に答えます']
    ),
  },
  {
    slug: 'business-negotiation', courseSlug: 'negotiations', title: 'Business Negotiation', titleCn: '商务谈判', pinyin: 'shāngwù tánpàn',
    description: 'Clarify priorities, make a proposal and find common ground', icon: 'compare_arrows', difficulty: 'advanced', color: '#7C3AED', isPremium: true, estimatedMinutes: 10,
    translations: translations(
      ['व्यावसायिक बातचीत', 'प्राथमिकताएँ स्पष्ट करें, प्रस्ताव दें और सहमति खोजें'],
      ['Negociación empresarial', 'Aclara prioridades, propón y busca un acuerdo'],
      ['ビジネス交渉', '優先事項を確認し、提案して合意点を探します']
    ),
  },
  {
    slug: 'sales-pitch', courseSlug: 'marketing-sales', title: 'Sales Pitch', titleCn: '销售推介', pinyin: 'xiāoshòu tuījiè',
    description: 'Discover a need, explain value and handle an objection', icon: 'trending_up', difficulty: 'advanced', color: '#0D9488', isPremium: true, estimatedMinutes: 10,
    translations: translations(
      ['सेल्स प्रस्तुति', 'ज़रूरत समझें, मूल्य बताएँ और आपत्ति संभालें'],
      ['Presentación de ventas', 'Descubre la necesidad, explica el valor y responde objeciones'],
      ['セールストーク', 'ニーズを探り、価値を説明し、反論に対応します']
    ),
  },
  {
    slug: 'apartment-viewing', courseSlug: 'real-estate', title: 'Apartment Viewing', titleCn: '看房', pinyin: 'kàn fáng',
    description: 'Ask about rent, facilities, location and contract terms', icon: 'apartment', difficulty: 'advanced', color: '#D97706', isPremium: true, estimatedMinutes: 10,
    translations: translations(
      ['अपार्टमेंट देखना', 'किराया, सुविधाएँ, स्थान और अनुबंध पूछें'],
      ['Visitar un apartamento', 'Pregunta por alquiler, servicios, ubicación y contrato'],
      ['部屋の内見', '家賃、設備、場所、契約条件を尋ねます']
    ),
  },
  {
    slug: 'reading-a-menu', courseSlug: 'reading-menus', title: 'Reading a Chinese Menu', titleCn: '看中文菜单', pinyin: 'kàn Zhōngwén càidān',
    description: 'Identify dishes, ingredients and cooking styles before ordering', icon: 'menu_book', difficulty: 'advanced', color: '#EA580C', isPremium: true, estimatedMinutes: 9,
    translations: translations(
      ['चीनी मेन्यू पढ़ना', 'ऑर्डर से पहले व्यंजन, सामग्री और पकाने का तरीका समझें'],
      ['Leer un menú chino', 'Identifica platos, ingredientes y formas de cocinar'],
      ['中国語メニューを読む', '料理、材料、調理法を確認して注文します']
    ),
  },
  {
    slug: 'telling-a-story', courseSlug: 'storytelling', title: 'Telling a Personal Story', titleCn: '讲个人故事', pinyin: 'jiǎng gèrén gùshi',
    description: 'Set the scene, describe a turning point and finish naturally', icon: 'auto_stories', difficulty: 'advanced', color: '#9333EA', isPremium: true, estimatedMinutes: 10,
    translations: translations(
      ['अपनी कहानी सुनाना', 'परिस्थिति बनाएँ, बदलाव बताएँ और स्वाभाविक अंत करें'],
      ['Contar una historia personal', 'Presenta la escena, el cambio y termina con naturalidad'],
      ['自分の物語を話す', '状況、転機、自然な結末を話します']
    ),
  },
] as const;

const topicMap = new Map(TOPIC_BLUEPRINTS.map(topic => [topic.courseSlug, topic]));

const enrichScenario = (scenario: any, courseSlug: string) => {
  const topic = topicMap.get(courseSlug);
  if (!topic) throw new Error(`Missing scenario topic for ${scenario.slug}: ${courseSlug}`);

  return {
    ...scenario,
    isPublished: true,
    learningGoals: [
      `Open a realistic ${scenario.title.toLowerCase()} exchange`,
      `Respond with expressions from ${courseSlug.replace(/-/g, ' ')}`,
      'Receive one concise correction and try the line again',
    ],
    systemPrompt: [
      `Role-play the scenario “${scenario.title}” with a Mandarin learner.`,
      `Begin from this situation: ${topic.primary.english}`,
      `A natural reply is: ${topic.response.english}`,
      'Do not force the sample script; accept reasonable alternatives.',
      `Match vocabulary and speed to the learner's HSK level, keep each turn under two sentences,`,
      'and after the learner replies give at most one useful correction before continuing in character.',
    ].join(' '),
    dialogues: [
      {
        speaker: 'ai' as const,
        chinese: topic.primary.chinese,
        pinyin: topic.primary.pinyin,
        english: topic.primary.english,
        translations: topic.primary.localized,
      },
      {
        speaker: 'user' as const,
        chinese: topic.response.chinese,
        pinyin: topic.response.pinyin,
        english: topic.response.english,
        translations: topic.response.localized,
      },
    ],
  };
};

export const QUALITY_SCENARIO_SEEDS = [
  ...SCENARIO_SEEDS.map(scenario => enrichScenario(scenario, SCENARIO_TOPIC[scenario.slug])),
  ...EXTRA_SCENARIO_SEEDS.map((scenario, index) => {
    const { courseSlug, ...seed } = scenario;
    return enrichScenario({ ...seed, order: SCENARIO_SEEDS.length + index + 1 }, courseSlug);
  }),
];
