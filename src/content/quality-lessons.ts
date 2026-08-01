import { COURSE_SEEDS } from './curriculum';
import {
  TOPIC_BLUEPRINTS,
  type ContentLocale,
  type PatternKey,
  type TopicBlueprint,
  type UtteranceBlueprint,
} from './topic-blueprints';

type CourseSeed = (typeof COURSE_SEEDS)[number];

type PatternDefinition = {
  name: string;
  formula: string;
  explanation: string;
  usage: string;
  localized: Record<'hi' | 'es' | 'ja', {
    name: string;
    formula: string;
    explanation: string;
    usage: string;
  }>;
};

const translatedPattern = (
  name: string,
  formula: string,
  explanation: string,
  usage: string,
  hi: [string, string, string, string],
  es: [string, string, string, string],
  ja: [string, string, string, string]
): PatternDefinition => ({
  name,
  formula,
  explanation,
  usage,
  localized: {
    hi: { name: hi[0], formula: hi[1], explanation: hi[2], usage: hi[3] },
    es: { name: es[0], formula: es[1], explanation: es[2], usage: es[3] },
    ja: { name: ja[0], formula: ja[1], explanation: ja[2], usage: ja[3] },
  },
});

const PATTERNS: Record<PatternKey, PatternDefinition> = {
  pronunciation: translatedPattern(
    'Sound before speed', 'Listen → mark the tone → speak the whole phrase',
    'Mandarin meaning depends on tone. Practise the complete phrase so tone changes and rhythm stay connected.',
    'Use this process whenever a phrase sounds different at natural speed.',
    ['पहले ध्वनि, फिर गति', 'सुनें → स्वर पहचानें → पूरा वाक्य बोलें', 'चीनी में स्वर से अर्थ बदल सकता है। पूरे वाक्य के साथ अभ्यास करें।', 'जब तेज़ बोलचाल समझ न आए तब यह तरीका अपनाएँ।'],
    ['Sonido antes que velocidad', 'Escucha → marca el tono → di la frase', 'El tono puede cambiar el significado. Practica la frase completa.', 'Úsalo cuando el habla natural resulte difícil.'],
    ['速さより音', '聞く → 声調を確認 → 文全体を話す', '中国語は声調で意味が変わります。文全体のリズムで練習します。', '自然な速さが難しい時に使います。']
  ),
  identity: translatedPattern(
    'Introduce identity', 'Subject + 是 / 叫 / 在 + identity or role',
    'Use 叫 for a name, 是 for identity, and 在 with a place before the action or role.',
    'Use this to introduce yourself, your work, origin or relationship.',
    ['पहचान बताना', 'कर्ता + 是 / 叫 / 在 + पहचान या भूमिका', 'नाम के लिए 叫, पहचान के लिए 是 और स्थान के लिए 在 लगाएँ।', 'परिचय, काम, मूल स्थान या संबंध बताने में उपयोग करें।'],
    ['Presentar identidad', 'Sujeto + 是 / 叫 / 在 + identidad', 'Usa 叫 para el nombre, 是 para identidad y 在 para lugar.', 'Úsalo al presentarte o hablar del trabajo y origen.'],
    ['身元を紹介', '主語 + 是 / 叫 / 在 + 身元・役割', '名前は叫、身元は是、場所は在を使います。', '自己紹介、仕事、出身を話す時に使います。']
  ),
  quantity: translatedPattern(
    'Count with measure words', 'Number + measure word + noun',
    'A measure word normally sits between a number and a noun. Match it to the noun instead of using 个 for everything.',
    'Use this for people, objects, prices, amounts and measurements.',
    ['माप-शब्द के साथ गिनती', 'संख्या + माप-शब्द + संज्ञा', 'संख्या और संज्ञा के बीच सही माप-शब्द आता है। हर जगह 个 न लगाएँ।', 'लोग, वस्तु, कीमत, मात्रा और माप में उपयोग करें।'],
    ['Contar con clasificadores', 'Número + clasificador + sustantivo', 'El clasificador va entre número y sustantivo.', 'Úsalo para personas, objetos, precios y medidas.'],
    ['量詞で数える', '数字 + 量詞 + 名詞', '数字と名詞の間に適切な量詞を置きます。', '人、物、値段、量を数える時に使います。']
  ),
  time: translatedPattern(
    'Time before action', 'Subject + time + place + action',
    'Chinese usually places the time before the action. Move from broad time to specific time.',
    'Use it for schedules, dates, routines and duration.',
    ['क्रिया से पहले समय', 'कर्ता + समय + स्थान + क्रिया', 'चीनी में समय आम तौर पर क्रिया से पहले आता है; बड़े समय से छोटे समय की ओर जाएँ।', 'दिनचर्या, तारीख, कार्यक्रम और अवधि के लिए उपयोग करें।'],
    ['Tiempo antes de la acción', 'Sujeto + tiempo + lugar + acción', 'El tiempo suele ir antes de la acción.', 'Úsalo para horarios, fechas y duración.'],
    ['動作の前に時間', '主語 + 時間 + 場所 + 動作', '中国語では時間を動作の前に置きます。', '予定、日付、習慣、期間に使います。']
  ),
  description: translatedPattern(
    'Describe naturally', 'Topic + 很 / 有点儿 / adjective phrase',
    'A plain adjective often needs a degree word such as 很. 有点儿 commonly introduces a mildly negative quality.',
    'Use this for people, objects, weather, taste and physical condition.',
    ['स्वाभाविक वर्णन', 'विषय + 很 / 有点儿 / विशेषण', 'साधारण विशेषण के साथ अक्सर 很 आता है; हल्की नकारात्मक बात के लिए 有点儿।', 'लोग, वस्तु, मौसम, स्वाद और स्थिति बताने में उपयोग करें।'],
    ['Describir con naturalidad', 'Tema + 很 / 有点儿 / adjetivo', 'Los adjetivos suelen llevar un grado como 很.', 'Úsalo con personas, objetos, clima y sensaciones.'],
    ['自然に描写', '話題 + 很 / 有点儿 / 形容詞', '形容詞には很などの程度語をよく使います。', '人、物、天気、味、体調を話す時に使います。']
  ),
  possession: translatedPattern(
    'Have and belong', 'Owner + 有 + item / item + 是 + owner + 的',
    'Use 有 for possession or existence. Use 是…的 to identify who something belongs to.',
    'Use it for family, home, belongings and available resources.',
    ['होना और संबंध', 'मालिक + 有 + वस्तु / वस्तु + 是 + मालिक + 的', 'किसी के पास कुछ होने के लिए 有 और मालिक पहचानने के लिए 是…的।', 'परिवार, घर, सामान और उपलब्ध चीज़ों में उपयोग करें।'],
    ['Tener y pertenecer', 'Dueño + 有 + objeto / objeto + 是 + dueño + 的', 'Usa 有 para tener y 是…的 para pertenencia.', 'Úsalo para familia, casa y pertenencias.'],
    ['所有と所属', '所有者 + 有 + 物 / 物 + 是 + 所有者 + 的', '所有は有、持ち主の特定は是…的を使います。', '家族、家、持ち物に使います。']
  ),
  location: translatedPattern(
    'Place things clearly', 'Thing + 在 + place / place + 有 + thing',
    'Use 在 when locating a known thing. Use 有 when introducing what exists at a place.',
    'Use it for directions, rooms, cities, transport and movement.',
    ['स्थान स्पष्ट बताना', 'वस्तु + 在 + स्थान / स्थान + 有 + वस्तु', 'जानी हुई वस्तु कहाँ है उसके लिए 在; किसी जगह क्या है उसके लिए 有।', 'दिशा, कमरा, शहर, परिवहन और गति में उपयोग करें।'],
    ['Ubicar con claridad', 'Cosa + 在 + lugar / lugar + 有 + cosa', '在 ubica algo conocido; 有 presenta lo que existe.', 'Úsalo para direcciones, habitaciones y movimiento.'],
    ['場所を明確に', '物 + 在 + 場所 / 場所 + 有 + 物', '既知の物の位置は在、存在の紹介は有を使います。', '道案内、部屋、都市、移動に使います。']
  ),
  action: translatedPattern(
    'Put actions in sequence', '先 + action 1， 再 / 然后 + action 2',
    '先…再… makes the order explicit. Add 了 for a completed event and 着 for a continuing state when needed.',
    'Use it for routines, instructions, cooking and stories.',
    ['क्रियाओं का क्रम', '先 + क्रिया 1， 再 / 然后 + क्रिया 2', '先…再… क्रम साफ करता है; पूरी क्रिया के लिए 了 और चलती स्थिति के लिए 着।', 'दिनचर्या, निर्देश, खाना और कहानी में उपयोग करें।'],
    ['Ordenar acciones', '先 + acción 1， 再 / 然后 + acción 2', '先…再… deja claro el orden.', 'Úsalo para rutinas, instrucciones y relatos.'],
    ['動作の順序', '先 + 動作1， 再 / 然后 + 動作2', '先…再…で順番を明確にします。', '習慣、説明、料理、物語に使います。']
  ),
  preference: translatedPattern(
    'Express preference', 'Subject + 喜欢 / 想 / 不太 + action or object',
    '喜欢 states a preference, 想 introduces a wish, and 不太 softens a negative preference.',
    'Use it for food, hobbies, entertainment and choices.',
    ['पसंद बताना', 'कर्ता + 喜欢 / 想 / 不太 + क्रिया या वस्तु', '喜欢 पसंद, 想 इच्छा और 不太 नरम नापसंद बताता है।', 'भोजन, शौक, मनोरंजन और चुनाव में उपयोग करें।'],
    ['Expresar preferencia', 'Sujeto + 喜欢 / 想 / 不太 + acción u objeto', '喜欢 indica gusto, 想 deseo y 不太 suaviza lo negativo.', 'Úsalo con comida, aficiones y elecciones.'],
    ['好みを表す', '主語 + 喜欢 / 想 / 不太 + 動作・物', '喜欢は好み、想は希望、不太は弱い否定です。', '食事、趣味、選択に使います。']
  ),
  request: translatedPattern(
    'Make a useful request', '请 / 我想要 / 可以 + request',
    '请 is polite and direct. 我想要 states what you want, while 可以…吗 asks permission.',
    'Use it when ordering, asking for help or customizing something.',
    ['काम का अनुरोध', '请 / 我想要 / 可以 + अनुरोध', '请 विनम्र अनुरोध, 我想要 इच्छा और 可以…吗 अनुमति पूछता है।', 'ऑर्डर, मदद या बदलाव माँगने में उपयोग करें।'],
    ['Pedir con utilidad', '请 / 我想要 / 可以 + petición', '请 pide con cortesía; 我想要 expresa deseo; 可以…吗 pide permiso.', 'Úsalo al pedir, solicitar ayuda o personalizar.'],
    ['実用的な依頼', '请 / 我想要 / 可以 + 依頼', '请は丁寧な依頼、我想要は希望、可以…吗は許可です。', '注文、助け、変更の依頼に使います。']
  ),
  comparison: translatedPattern(
    'Compare two things', 'A + 比 + B + adjective / A + 没有 + B + 那么 + adjective',
    '比 marks a difference. 没有…那么… says A is not as adjective as B.',
    'Use it to compare products, places, people, methods and results.',
    ['दो चीज़ों की तुलना', 'A + 比 + B + विशेषण / A + 没有 + B + 那么 + विशेषण', 'अंतर के लिए 比; “इतना नहीं” के लिए 没有…那么…。', 'वस्तु, स्थान, व्यक्ति, तरीका और परिणाम की तुलना में उपयोग करें।'],
    ['Comparar dos cosas', 'A + 比 + B + adjetivo / A + 没有 + B + 那么 + adjetivo', '比 marca diferencia; 没有…那么… indica menor grado.', 'Úsalo para productos, lugares y resultados.'],
    ['二つを比較', 'A + 比 + B + 形容詞 / A + 没有 + B + 那么 + 形容詞', '比は差、没有…那么…は程度が低いことを示します。', '物、場所、人、方法、結果の比較に使います。']
  ),
  social: translatedPattern(
    'Keep the exchange going', 'Opening + message + natural reply',
    'A useful social line needs a fitting reply. Learn both turns so you can react without translating word by word.',
    'Use it in greetings, invitations, apologies and casual conversation.',
    ['बातचीत जारी रखना', 'शुरुआत + संदेश + स्वाभाविक उत्तर', 'सामाजिक वाक्य के साथ उसका सही उत्तर भी सीखें ताकि बिना अनुवाद जवाब दे सकें।', 'अभिवादन, निमंत्रण, माफ़ी और सामान्य बातचीत में उपयोग करें।'],
    ['Mantener la conversación', 'Inicio + mensaje + respuesta natural', 'Aprende ambos turnos para responder sin traducir palabra por palabra.', 'Úsalo en saludos, invitaciones y disculpas.'],
    ['会話を続ける', '始まり + 内容 + 自然な返答', '両方の発話を学び、逐語訳せずに反応します。', '挨拶、招待、謝罪、日常会話に使います。']
  ),
  plan: translatedPattern(
    'Connect intention and steps', '打算 / 要 / 会 + plan， 然后 + next step',
    '打算 presents an intention, 要 a decided plan or need, and 会 an expected future action.',
    'Use it for travel, projects, appointments and future goals.',
    ['इरादा और कदम जोड़ना', '打算 / 要 / 会 + योजना， 然后 + अगला कदम', '打算 इरादा, 要 तय योजना या आवश्यकता और 会 अपेक्षित भविष्य बताता है।', 'यात्रा, प्रोजेक्ट, मुलाकात और लक्ष्य में उपयोग करें।'],
    ['Unir intención y pasos', '打算 / 要 / 会 + plan， 然后 + paso', '打算 expresa intención, 要 plan decidido y 会 futuro esperado.', 'Úsalo para viajes, proyectos y objetivos.'],
    ['意図と手順', '打算 / 要 / 会 + 計画， 然后 + 次の段階', '打算は意図、要は決定・必要、会は予想される未来です。', '旅行、計画、目標に使います。']
  ),
  service: translatedPattern(
    'Solve a real-world task', 'Polite opener + specific need + confirmation',
    'State the exact item, time, place or problem. A short confirmation prevents misunderstandings.',
    'Use it in shops, transport, hotels, banks, restaurants and emergencies.',
    ['असल काम हल करना', 'विनम्र शुरुआत + स्पष्ट आवश्यकता + पुष्टि', 'वस्तु, समय, स्थान या समस्या साफ बताएँ और अंत में पुष्टि करें।', 'दुकान, परिवहन, होटल, बैंक, रेस्तरां और आपात स्थिति में उपयोग करें।'],
    ['Resolver una tarea real', 'Inicio cortés + necesidad concreta + confirmación', 'Indica objeto, hora, lugar o problema y confirma.', 'Úsalo en tiendas, transporte, hoteles y emergencias.'],
    ['実生活の課題', '丁寧な開始 + 具体的な要望 + 確認', '物、時間、場所、問題を具体的に述べて確認します。', '店、交通、ホテル、銀行、緊急時に使います。']
  ),
  grammar: translatedPattern(
    'Build the relationship', 'Clause 1 + connector or particle + clause 2',
    'Chinese grammar often shows how ideas relate rather than changing the verb. Notice position, pairing and context.',
    'Use this to make accurate questions, negatives, conditions, sequences and reviews.',
    ['विचारों का संबंध', 'उपवाक्य 1 + जोड़ने वाला शब्द/कण + उपवाक्य 2', 'चीनी में क्रिया बदलने के बजाय शब्दों का स्थान और संबंध अर्थ बनाते हैं।', 'प्रश्न, नकार, शर्त, क्रम और पुनरावृत्ति में उपयोग करें।'],
    ['Construir la relación', 'Cláusula 1 + conector o partícula + cláusula 2', 'La gramática china muestra relaciones mediante posición y partículas.', 'Úsalo para preguntas, negación y condiciones.'],
    ['関係を組み立てる', '節1 + 接続語・助詞 + 節2', '中国語は動詞変化より位置や助詞で関係を示します。', '疑問、否定、条件、順序に使います。']
  ),
  opinion: translatedPattern(
    'State and support a view', 'Viewpoint marker + claim + reason or evidence',
    'Lead with your position, then support it. Soften disagreement by acknowledging the other view first.',
    'Use it for advice, reviews, discussion, agreement and debate.',
    ['राय और समर्थन', 'राय की शुरुआत + दावा + कारण या प्रमाण', 'पहले अपनी स्थिति, फिर कारण दें; असहमति से पहले सामने वाले की बात स्वीकारें।', 'सलाह, समीक्षा, चर्चा, सहमति और बहस में उपयोग करें।'],
    ['Opinar y apoyar', 'Marcador de opinión + afirmación + razón', 'Presenta tu postura y luego la evidencia; suaviza el desacuerdo.', 'Úsalo en consejos, reseñas y debate.'],
    ['意見と根拠', '意見の標識 + 主張 + 理由・証拠', '立場を述べて根拠を示し、反対時は相手の意見を認めます。', '助言、評価、議論に使います。']
  ),
  formal: translatedPattern(
    'Professional structure', 'Context + objective statement + action or condition',
    'Formal Chinese is clear, compact and appropriately polite. Put context first and the requested action last.',
    'Use it in meetings, documents, interviews, negotiation and professional calls.',
    ['पेशेवर संरचना', 'संदर्भ + स्पष्ट कथन + कार्रवाई या शर्त', 'औपचारिक चीनी स्पष्ट, संक्षिप्त और विनम्र होती है; पहले संदर्भ, अंत में कार्रवाई।', 'बैठक, दस्तावेज़, इंटरव्यू, बातचीत और कॉल में उपयोग करें।'],
    ['Estructura profesional', 'Contexto + declaración + acción o condición', 'El chino formal es claro, compacto y cortés.', 'Úsalo en reuniones, documentos y negociaciones.'],
    ['専門的な構成', '背景 + 明確な述べ方 + 行動・条件', '正式な中国語は明確で簡潔かつ丁寧です。', '会議、文書、面接、交渉に使います。']
  ),
  reading: translatedPattern(
    'Read for purpose', 'Identify text type → find signals → infer meaning',
    'Do not decode every character equally. Use structure, components, headings and context to find the intended meaning.',
    'Use it for characters, signs, menus, messages, articles and classical references.',
    ['उद्देश्य से पढ़ना', 'पाठ प्रकार पहचानें → संकेत खोजें → अर्थ निकालें', 'हर अक्षर को समान रूप से न खोलें; संरचना, भाग, शीर्षक और संदर्भ से अर्थ पकड़ें।', 'अक्षर, संकेत, मेन्यू, संदेश, लेख और शास्त्रीय संदर्भ में उपयोग करें।'],
    ['Leer con propósito', 'Tipo de texto → señales → significado', 'Usa estructura, componentes y contexto, no descifres todo por igual.', 'Úsalo con caracteres, señales y artículos.'],
    ['目的を持って読む', '文章の種類 → 手掛かり → 意味を推測', '全てを同じように解読せず、構造や文脈を使います。', '漢字、標識、メニュー、記事に使います。']
  ),
  narrative: translatedPattern(
    'Move a story forward', 'Setting + change or conflict + result or insight',
    'Orient the listener first, then use time connectors and a clear change. End with the result or what was learned.',
    'Use it for events, personal stories, graded reading and anecdotes.',
    ['कहानी आगे बढ़ाना', 'स्थिति + बदलाव/समस्या + परिणाम/सीख', 'पहले संदर्भ दें, फिर समय जोड़ने वाले शब्दों से बदलाव बताएँ और अंत में परिणाम।', 'घटना, निजी कहानी, पाठ और अनुभव में उपयोग करें।'],
    ['Hacer avanzar una historia', 'Escena + cambio o conflicto + resultado', 'Orienta primero, conecta el tiempo y termina con resultado o aprendizaje.', 'Úsalo en eventos y relatos.'],
    ['物語を進める', '設定 + 変化・問題 + 結果・気づき', '最初に状況、次に時間表現と変化、最後に結果を述べます。', '出来事、個人の話、読解に使います。']
  ),
  fluency: translatedPattern(
    'Meaning over word-for-word translation', 'Idea + natural Chinese chunk + listener-aware follow-up',
    'Fluency comes from reusable chunks, context and repair strategies—not from translating each word or avoiding every mistake.',
    'Use it for idioms, nuance, media, humour, persuasion and spontaneous speaking.',
    ['शब्द नहीं, अर्थ पहले', 'विचार + स्वाभाविक चीनी खंड + सामने वाले के अनुसार अगली बात', 'धाराप्रवाहता तैयार खंड, संदर्भ और सुधार की क्षमता से आती है, हर शब्द के अनुवाद से नहीं।', 'मुहावरे, बारीक अर्थ, मीडिया, हास्य और तुरंत बोलने में उपयोग करें।'],
    ['Sentido antes que traducción', 'Idea + bloque natural + seguimiento', 'La fluidez nace de bloques, contexto y reparación, no de traducir cada palabra.', 'Úsalo con matices, humor y habla espontánea.'],
    ['逐語訳より意味', '考え + 自然なまとまり + 相手に合わせた続き', '流暢さは語句のまとまり、文脈、言い直しから生まれます。', '慣用句、ニュアンス、即興会話に使います。']
  ),
};

const courseTranslation = (course: CourseSeed, language: 'hi' | 'es' | 'ja', field: 'title' | 'description'): string =>
  (course.translations as Record<string, Record<string, string>>)?.[language]?.[field] || course[field];

const lessonTranslations = (
  course: CourseSeed,
  stage: 'expressions' | 'sentence' | 'conversation' | 'review'
) => {
  const labels = {
    hi: {
      expressions: 'ज़रूरी अभिव्यक्तियाँ', sentence: 'वाक्य को समझें', conversation: 'असल बातचीत', review: 'बोलें और दोहराएँ',
      descriptions: {
        expressions: 'ज़रूरी शब्द-खंडों को अर्थ और उच्चारण के साथ सीखें।',
        sentence: 'वाक्य को शब्द-दर-शब्द खोलें और उसका स्वाभाविक ढाँचा समझें।',
        conversation: 'सही समय पर स्वाभाविक जवाब देना सीखें।',
        review: 'सुने बिना अनुवाद किए बोलें और अलग अभ्यासों से याद पक्का करें।',
      },
    },
    es: {
      expressions: 'Expresiones clave', sentence: 'Comprende la frase', conversation: 'Conversación real', review: 'Habla y repasa',
      descriptions: {
        expressions: 'Aprende bloques útiles con significado y pronunciación.',
        sentence: 'Descompón la frase y comprende su estructura natural.',
        conversation: 'Responde con naturalidad en el momento correcto.',
        review: 'Escucha, habla y repasa con actividades variadas.',
      },
    },
    ja: {
      expressions: '重要表現', sentence: '文を理解する', conversation: '実際の会話', review: '話して復習',
      descriptions: {
        expressions: '意味と発音を伴う実用的なまとまりを学びます。',
        sentence: '文を語句ごとに分け、自然な構造を理解します。',
        conversation: '適切な場面で自然に返答します。',
        review: '聞く・話す・並べ替える練習で定着させます。',
      },
    },
  } as const;

  return Object.fromEntries((['hi', 'es', 'ja'] as const).map(language => [language, {
    title: `${labels[language][stage]}: ${courseTranslation(course, language, 'title')}`,
    description: labels[language].descriptions[stage],
    objective1: labels[language].descriptions[stage],
    objective2: courseTranslation(course, language, 'description'),
    objective3: stage === 'review'
      ? labels[language].descriptions.review
      : labels[language].descriptions.conversation,
  }]));
};

const sentenceExplanationTranslations = (
  utterance: UtteranceBlueprint,
  pattern: PatternDefinition
) => Object.fromEntries((['hi', 'es', 'ja'] as const).map(language => [language, {
  literalMeaning: utterance.localized[language],
  pattern: pattern.localized[language].formula,
  grammarNote: pattern.localized[language].explanation,
  usageNote: pattern.localized[language].usage,
}]));

const richSentence = (
  utterance: UtteranceBlueprint,
  substitution: UtteranceBlueprint,
  pattern: PatternDefinition
) => ({
  chinese: utterance.chinese,
  pinyin: utterance.pinyin,
  english: utterance.english,
  literalMeaning: utterance.chunks.map(chunk => chunk.meaning).join(' / '),
  breakdown: utterance.chunks,
  pattern: pattern.formula,
  grammarNote: pattern.explanation,
  usageNote: pattern.usage,
  substitutions: [{
    chinese: substitution.chinese,
    pinyin: substitution.pinyin,
    english: substitution.english,
    translations: substitution.localized,
  }],
  translations: utterance.localized,
  explanationTranslations: sentenceExplanationTranslations(utterance, pattern),
});

const uniqueOptions = (answer: string, alternatives: string[]): string[] =>
  Array.from(new Set([answer, ...alternatives])).slice(0, 4);

const exerciseTranslations = (hi: string, es: string, ja: string): ContentLocale => ({ hi, es, ja });

const stageExercises = (
  course: CourseSeed,
  topic: TopicBlueprint,
  stage: number,
) => {
  const { primary, response } = topic;
  const meaningOptions = uniqueOptions(primary.english, [
    response.english,
    `This line changes the topic away from ${course.title}.`,
    'The speaker has not given a complete answer yet.',
  ]);
  const responseOptions = uniqueOptions(response.chinese, [
    primary.chinese,
    '我不明白这个问题。',
    '请你明天再来。',
  ]);
  const localizedMeaningOptions = {
    hi: uniqueOptions(primary.localized.hi, [
      response.localized.hi,
      `यह वाक्य ${courseTranslation(course, 'hi', 'title')} के विषय से अलग बात करता है।`,
      'वक्ता ने अभी पूरा जवाब नहीं दिया है।',
    ]),
    es: uniqueOptions(primary.localized.es, [
      response.localized.es,
      `Esta frase cambia a un tema distinto de ${courseTranslation(course, 'es', 'title')}.`,
      'La persona todavía no ha dado una respuesta completa.',
    ]),
    ja: uniqueOptions(primary.localized.ja, [
      response.localized.ja,
      `この文は「${courseTranslation(course, 'ja', 'title')}」とは別の話題です。`,
      '話し手はまだ完全な答えを述べていません。',
    ]),
  };
  const localizedResponseMeaningOptions = {
    hi: uniqueOptions(response.localized.hi, [primary.localized.hi, ...localizedMeaningOptions.hi]),
    es: uniqueOptions(response.localized.es, [primary.localized.es, ...localizedMeaningOptions.es]),
    ja: uniqueOptions(response.localized.ja, [primary.localized.ja, ...localizedMeaningOptions.ja]),
  };
  const prefix = `${course.title} · Step ${stage}`;
  const orderedChunks = primary.chunks.map(chunk => chunk.chinese);
  const scrambledChunks = orderedChunks.length > 2
    ? [...orderedChunks.slice(1), orderedChunks[0]]
    : [...orderedChunks].reverse();

  const bank = [
    {
      type: 'multiple_choice',
      prompt: `${prefix}: What is the natural meaning of ${primary.chinese}?`,
      promptChinese: primary.chinese,
      options: meaningOptions,
      answer: primary.english,
      explanation: `${primary.pinyin} — ${primary.english}`,
      translations: exerciseTranslations(`${primary.chinese} का स्वाभाविक अर्थ चुनें।`, `Elige el significado natural de ${primary.chinese}.`, `${primary.chinese} の自然な意味を選んでください。`),
      optionTranslations: localizedMeaningOptions,
      answerTranslations: primary.localized,
      explanationTranslations: {
        hi: `${primary.pinyin} — ${primary.localized.hi}`,
        es: `${primary.pinyin} — ${primary.localized.es}`,
        ja: `${primary.pinyin} — ${primary.localized.ja}`,
      },
    },
    {
      type: 'listen_select',
      prompt: `${prefix}: Listen and identify the line.`,
      promptChinese: response.chinese,
      options: uniqueOptions(response.english, [primary.english, ...meaningOptions]),
      answer: response.english,
      explanation: `${response.pinyin} — ${response.english}`,
      translations: exerciseTranslations('सुनें और सही अर्थ पहचानें।', 'Escucha e identifica el significado.', '音声を聞いて意味を選んでください。'),
      optionTranslations: localizedResponseMeaningOptions,
      answerTranslations: response.localized,
      explanationTranslations: {
        hi: `${response.pinyin} — ${response.localized.hi}`,
        es: `${response.pinyin} — ${response.localized.es}`,
        ja: `${response.pinyin} — ${response.localized.ja}`,
      },
    },
    {
      type: 'reorder',
      prompt: `${prefix}: Rebuild the sentence in natural Chinese order.`,
      promptChinese: primary.chinese,
      options: scrambledChunks,
      answer: primary.chinese,
      explanation: `${primary.pinyin} Follow the displayed sentence pattern, not English word order.`,
      translations: exerciseTranslations('चीनी वाक्य को स्वाभाविक क्रम में बनाएँ।', 'Reconstruye la frase en orden natural.', '中国語の自然な語順に並べてください。'),
    },
    {
      type: 'speak',
      prompt: `${prefix}: Say the complete line with connected tones and rhythm.`,
      promptChinese: stage % 2 === 0 ? response.chinese : primary.chinese,
      options: [],
      answer: stage % 2 === 0 ? response.chinese : primary.chinese,
      explanation: stage % 2 === 0 ? response.pinyin : primary.pinyin,
      translations: exerciseTranslations('पूरा वाक्य सही स्वर और लय में बोलें।', 'Di la frase completa con tonos y ritmo.', '声調とリズムに注意して文全体を話してください。'),
    },
    {
      type: 'translate',
      prompt: `${prefix}: Translate into Chinese: ${stage % 2 === 0 ? response.english : primary.english}`,
      options: [],
      answer: stage % 2 === 0 ? response.chinese : primary.chinese,
      explanation: stage % 2 === 0 ? response.pinyin : primary.pinyin,
      translations: exerciseTranslations(
        `चीनी में बोलें: ${stage % 2 === 0 ? response.localized.hi : primary.localized.hi}`,
        `Traduce al chino: ${stage % 2 === 0 ? response.localized.es : primary.localized.es}`,
        `中国語に訳してください：${stage % 2 === 0 ? response.localized.ja : primary.localized.ja}`
      ),
    },
    {
      type: 'multiple_choice',
      prompt: `${prefix}: Choose the most natural reply to ${primary.chinese}`,
      promptChinese: primary.chinese,
      options: responseOptions,
      answer: response.chinese,
      explanation: `${primary.chinese} — ${response.chinese}`,
      translations: exerciseTranslations('सबसे स्वाभाविक जवाब चुनें।', 'Elige la respuesta más natural.', '最も自然な返答を選んでください。'),
    },
  ];

  return stage === 1 ? bank.slice(0, 4)
    : stage === 2 ? [bank[2], bank[0], bank[4], bank[3], bank[5]]
      : stage === 3 ? [bank[1], bank[5], bank[3], bank[2], bank[4]]
        : [bank[0], bank[1], bank[2], bank[3], bank[4], bank[5]];
};

const vocabFromTopic = (topic: TopicBlueprint) => {
  return [topic.primary, topic.response].map(utterance => ({
    chinese: utterance.chinese,
    pinyin: utterance.pinyin,
    english: utterance.english,
    partOfSpeech: 'practical expression',
    translations: utterance.localized,
  }));
};

const LESSON_STAGES = [
  { key: 'expressions', title: 'Core Expressions', titleCn: '核心表达', type: 'vocabulary', minutes: 7 },
  { key: 'sentence', title: 'Understand the Sentence', titleCn: '拆解句子', type: 'grammar', minutes: 10 },
  { key: 'conversation', title: 'Use It in Conversation', titleCn: '情景对话', type: 'dialogue', minutes: 9 },
  { key: 'review', title: 'Speak & Review', titleCn: '口语复习', type: 'quiz', minutes: 10 },
] as const;

const topicMap = new Map(TOPIC_BLUEPRINTS.map(topic => [topic.courseSlug, topic]));

export const QUALITY_LESSON_SEEDS = COURSE_SEEDS.flatMap(course => {
  const topic = topicMap.get(course.slug);
  if (!topic) throw new Error(`Missing topic blueprint for course: ${course.slug}`);
  const pattern = PATTERNS[topic.patternKey];
  const primary = richSentence(topic.primary, topic.response, pattern);
  const response = richSentence(topic.response, topic.primary, pattern);
  const vocab = vocabFromTopic(topic);

  return LESSON_STAGES.map((stage, index) => {
    const order = index + 1;
    const sentenceSet = order === 1 ? [primary]
      : order === 4 ? [response, primary]
        : [primary, response];
    const descriptions = [
      `Learn the useful chunks behind ${course.title.toLowerCase()} before speaking the full line.`,
      `Break a complete ${course.title.toLowerCase()} sentence into meaning, pattern and natural usage.`,
      `Connect the target line to a realistic reply in ${course.title.toLowerCase()}.`,
      `Recall, rebuild, listen to and say the ${course.title.toLowerCase()} exchange without word-for-word translation.`,
    ];

    return {
      courseSlug: course.slug,
      slug: `${course.slug}-${stage.key}`,
      title: `${stage.title}: ${course.title}`,
      titleCn: `${stage.titleCn}：${course.titleCn}`,
      pinyin: order % 2 === 0 ? topic.response.pinyin : topic.primary.pinyin,
      description: descriptions[index],
      order,
      type: stage.type,
      estimatedMinutes: stage.minutes,
      xpReward: order === 4 ? 40 : order === 1 ? 20 : 30,
      isPremium: course.isPremium && order > 1,
      isPublished: true,
      objectives: order === 1
        ? ['Understand each useful chunk', 'Connect pinyin to meaning', 'Say the complete expression']
        : order === 2
          ? ['Read the sentence word by word', 'Understand the sentence pattern', 'Create a substitution']
          : order === 3
            ? ['Recognize the situation', 'Choose a natural reply', 'Speak both turns with rhythm']
            : ['Recall without hints', 'Rebuild natural word order', 'Complete listening and speaking review'],
      vocab,
      grammarPoints: [{
        title: pattern.name,
        explanation: `${pattern.explanation} ${pattern.usage}`,
        example: topic.primary.chinese,
        examplePinyin: topic.primary.pinyin,
        exampleTranslation: topic.primary.english,
        translations: {
          hi: `${pattern.localized.hi.explanation} ${pattern.localized.hi.usage}`,
          es: `${pattern.localized.es.explanation} ${pattern.localized.es.usage}`,
          ja: `${pattern.localized.ja.explanation} ${pattern.localized.ja.usage}`,
        },
      }],
      sentences: sentenceSet,
      exercises: stageExercises(course, topic, order),
      translations: lessonTranslations(course, stage.key),
    };
  });
});
