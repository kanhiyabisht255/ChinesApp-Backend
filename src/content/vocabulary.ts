type VocabularyWordInput = readonly [
  chinese: string,
  pinyin: string,
  english: string,
  partOfSpeech: string,
  exampleChinese: string,
  examplePinyin: string,
  exampleEnglish: string,
  hindi: string,
  spanish: string,
  japanese: string,
  usageNote?: string,
];

type TopicInput = {
  slug: string;
  title: string;
  titleCn: string;
  pinyin: string;
  description: string;
  hskLevel: number;
  level: 'starter' | 'beginner' | 'intermediate' | 'advanced';
  icon: string;
  color: string;
  isPremium: boolean;
  words: readonly VocabularyWordInput[];
};

export const VOCABULARY_VERSION = '2026.08.vocabulary-1';

const TOPICS: readonly TopicInput[] = [
  {
    slug: 'greetings-and-politeness', title: 'Greetings & Politeness', titleCn: '问候与礼貌',
    pinyin: 'wènhòu yǔ lǐmào', description: 'Start, continue and end everyday conversations naturally.',
    hskLevel: 1, level: 'starter', icon: 'waving_hand', color: '#FF9F43', isPremium: false,
    words: [
      ['你好', 'nǐ hǎo', 'hello', 'expression', '你好，很高兴认识你。', 'Nǐ hǎo, hěn gāoxìng rènshi nǐ.', 'Hello, nice to meet you.', 'नमस्ते', 'hola', 'こんにちは'],
      ['您好', 'nín hǎo', 'hello (polite)', 'expression', '王老师，您好！', 'Wáng lǎoshī, nín hǎo!', 'Hello, Teacher Wang.', 'नमस्ते (आदरपूर्वक)', 'hola (formal)', 'こんにちは（丁寧）', 'Use 您 with customers, teachers and older people.'],
      ['早上好', 'zǎoshang hǎo', 'good morning', 'expression', '妈妈，早上好！', 'Māma, zǎoshang hǎo!', 'Good morning, Mom!', 'सुप्रभात', 'buenos días', 'おはようございます'],
      ['再见', 'zàijiàn', 'goodbye', 'expression', '明天见，再见！', 'Míngtiān jiàn, zàijiàn!', 'See you tomorrow, goodbye!', 'अलविदा', 'adiós', 'さようなら'],
      ['谢谢', 'xièxie', 'thank you', 'expression', '谢谢你的帮助。', 'Xièxie nǐ de bāngzhù.', 'Thank you for your help.', 'धन्यवाद', 'gracias', 'ありがとう'],
      ['不客气', 'bú kèqi', "you're welcome", 'expression', '不客气，这是我应该做的。', 'Bú kèqi, zhè shì wǒ yīnggāi zuò de.', "You're welcome; it is what I should do.", 'कोई बात नहीं', 'de nada', 'どういたしまして'],
      ['对不起', 'duìbuqǐ', 'sorry', 'expression', '对不起，我来晚了。', 'Duìbuqǐ, wǒ lái wǎn le.', "Sorry, I'm late.", 'माफ़ कीजिए', 'lo siento', 'ごめんなさい'],
      ['没关系', 'méi guānxi', "it's okay", 'expression', '没关系，下次注意。', 'Méi guānxi, xià cì zhùyì.', "It's okay; be careful next time.", 'कोई बात नहीं', 'no pasa nada', '大丈夫です'],
    ],
  },
  {
    slug: 'people-and-pronouns', title: 'People & Pronouns', titleCn: '人物与代词',
    pinyin: 'rénwù yǔ dàicí', description: 'Talk clearly about yourself and the people around you.',
    hskLevel: 1, level: 'starter', icon: 'groups', color: '#8B5CF6', isPremium: false,
    words: [
      ['我', 'wǒ', 'I; me', 'pronoun', '我是中国人。', 'Wǒ shì Zhōngguó rén.', 'I am Chinese.', 'मैं; मुझे', 'yo; me', '私'],
      ['你', 'nǐ', 'you', 'pronoun', '你叫什么名字？', 'Nǐ jiào shénme míngzi?', 'What is your name?', 'तुम; आप', 'tú; usted', 'あなた'],
      ['他', 'tā', 'he; him', 'pronoun', '他是我的同事。', 'Tā shì wǒ de tóngshì.', 'He is my colleague.', 'वह (पुरुष)', 'él', '彼'],
      ['她', 'tā', 'she; her', 'pronoun', '她会说汉语。', 'Tā huì shuō Hànyǔ.', 'She can speak Chinese.', 'वह (महिला)', 'ella', '彼女'],
      ['我们', 'wǒmen', 'we; us', 'pronoun', '我们一起学习吧。', 'Wǒmen yìqǐ xuéxí ba.', "Let's study together.", 'हम', 'nosotros', '私たち'],
      ['他们', 'tāmen', 'they; them', 'pronoun', '他们住在北京。', 'Tāmen zhù zài Běijīng.', 'They live in Beijing.', 'वे', 'ellos', '彼ら'],
      ['朋友', 'péngyou', 'friend', 'noun', '小李是我的好朋友。', 'Xiǎo Lǐ shì wǒ de hǎo péngyou.', 'Xiao Li is my good friend.', 'दोस्त', 'amigo', '友達'],
      ['老师', 'lǎoshī', 'teacher', 'noun', '我们的老师姓张。', 'Wǒmen de lǎoshī xìng Zhāng.', "Our teacher's surname is Zhang.", 'शिक्षक', 'profesor', '先生'],
    ],
  },
  {
    slug: 'numbers-and-quantities', title: 'Numbers & Quantities', titleCn: '数字与数量',
    pinyin: 'shùzì yǔ shùliàng', description: 'Count, ask quantities and understand everyday prices.',
    hskLevel: 1, level: 'starter', icon: 'pin', color: '#22C55E', isPremium: false,
    words: [
      ['零', 'líng', 'zero', 'number', '现在是零点。', 'Xiànzài shì líng diǎn.', 'It is midnight now.', 'शून्य', 'cero', 'ゼロ'],
      ['一', 'yī', 'one', 'number', '我想要一杯茶。', 'Wǒ xiǎng yào yì bēi chá.', 'I would like one cup of tea.', 'एक', 'uno', '一'],
      ['二', 'èr', 'two', 'number', '今天是二号。', 'Jīntiān shì èr hào.', 'Today is the second.', 'दो', 'dos', '二'],
      ['三', 'sān', 'three', 'number', '我们有三个人。', 'Wǒmen yǒu sān ge rén.', 'There are three of us.', 'तीन', 'tres', '三'],
      ['十', 'shí', 'ten', 'number', '这本书十块钱。', 'Zhè běn shū shí kuài qián.', 'This book costs ten yuan.', 'दस', 'diez', '十'],
      ['百', 'bǎi', 'hundred', 'number', '这里有一百个座位。', 'Zhèlǐ yǒu yì bǎi ge zuòwèi.', 'There are one hundred seats here.', 'सौ', 'cien', '百'],
      ['个', 'gè', 'general measure word', 'measure word', '我买了两个苹果。', 'Wǒ mǎi le liǎng ge píngguǒ.', 'I bought two apples.', 'सामान्य गिनती शब्द', 'clasificador general', '一般量詞', 'Use 个 when you do not know a more specific measure word.'],
      ['多少', 'duōshao', 'how many; how much', 'question word', '这个多少钱？', 'Zhège duōshao qián?', 'How much is this?', 'कितना; कितने', 'cuánto; cuántos', 'いくつ; いくら'],
    ],
  },
  {
    slug: 'time-and-calendar', title: 'Time & Calendar', titleCn: '时间与日期',
    pinyin: 'shíjiān yǔ rìqī', description: 'Make plans and understand when something happens.',
    hskLevel: 1, level: 'starter', icon: 'schedule', color: '#06B6D4', isPremium: false,
    words: [
      ['现在', 'xiànzài', 'now', 'time word', '你现在有时间吗？', 'Nǐ xiànzài yǒu shíjiān ma?', 'Do you have time now?', 'अभी', 'ahora', '今'],
      ['今天', 'jīntiān', 'today', 'time word', '今天天气很好。', 'Jīntiān tiānqì hěn hǎo.', 'The weather is nice today.', 'आज', 'hoy', '今日'],
      ['明天', 'míngtiān', 'tomorrow', 'time word', '我们明天见。', 'Wǒmen míngtiān jiàn.', 'We will meet tomorrow.', 'कल (आने वाला)', 'mañana', '明日'],
      ['昨天', 'zuótiān', 'yesterday', 'time word', '我昨天没上班。', 'Wǒ zuótiān méi shàngbān.', "I didn't work yesterday.", 'कल (बीता हुआ)', 'ayer', '昨日'],
      ['早上', 'zǎoshang', 'morning', 'noun', '我早上七点起床。', 'Wǒ zǎoshang qī diǎn qǐchuáng.', 'I get up at seven in the morning.', 'सुबह', 'mañana', '朝'],
      ['晚上', 'wǎnshang', 'evening; night', 'noun', '晚上我们一起吃饭。', 'Wǎnshang wǒmen yìqǐ chīfàn.', 'We will eat together tonight.', 'शाम; रात', 'noche', '夜'],
      ['点', 'diǎn', "o'clock", 'measure word', '电影八点开始。', 'Diànyǐng bā diǎn kāishǐ.', 'The movie starts at eight.', 'बजे', 'en punto', '時'],
      ['分钟', 'fēnzhōng', 'minute', 'noun', '请等我五分钟。', 'Qǐng děng wǒ wǔ fēnzhōng.', 'Please wait for me for five minutes.', 'मिनट', 'minuto', '分'],
    ],
  },
  {
    slug: 'family-and-relationships', title: 'Family & Relationships', titleCn: '家庭与关系',
    pinyin: 'jiātíng yǔ guānxi', description: 'Introduce family members and describe close relationships.',
    hskLevel: 1, level: 'starter', icon: 'family_restroom', color: '#EC4899', isPremium: false,
    words: [
      ['家', 'jiā', 'home; family', 'noun', '我家有四口人。', 'Wǒ jiā yǒu sì kǒu rén.', 'There are four people in my family.', 'घर; परिवार', 'casa; familia', '家; 家族'],
      ['爸爸', 'bàba', 'dad; father', 'noun', '我爸爸是医生。', 'Wǒ bàba shì yīshēng.', 'My father is a doctor.', 'पिताजी', 'papá', 'お父さん'],
      ['妈妈', 'māma', 'mom; mother', 'noun', '妈妈正在做饭。', 'Māma zhèngzài zuòfàn.', 'Mom is cooking.', 'माँ', 'mamá', 'お母さん'],
      ['哥哥', 'gēge', 'older brother', 'noun', '我哥哥比我高。', 'Wǒ gēge bǐ wǒ gāo.', 'My older brother is taller than me.', 'बड़ा भाई', 'hermano mayor', '兄'],
      ['姐姐', 'jiějie', 'older sister', 'noun', '姐姐在上海工作。', 'Jiějie zài Shànghǎi gōngzuò.', 'My older sister works in Shanghai.', 'बड़ी बहन', 'hermana mayor', '姉'],
      ['弟弟', 'dìdi', 'younger brother', 'noun', '弟弟喜欢踢足球。', 'Dìdi xǐhuan tī zúqiú.', 'My younger brother likes playing football.', 'छोटा भाई', 'hermano menor', '弟'],
      ['妹妹', 'mèimei', 'younger sister', 'noun', '妹妹今年十岁。', 'Mèimei jīnnián shí suì.', 'My younger sister is ten this year.', 'छोटी बहन', 'hermana menor', '妹'],
      ['孩子', 'háizi', 'child', 'noun', '那个孩子很可爱。', 'Nàge háizi hěn kě’ài.', 'That child is very cute.', 'बच्चा', 'niño', '子ども'],
    ],
  },
  {
    slug: 'food-and-drinks', title: 'Food & Drinks', titleCn: '食物与饮料',
    pinyin: 'shíwù yǔ yǐnliào', description: 'Order simple meals and say what you want to eat or drink.',
    hskLevel: 1, level: 'starter', icon: 'restaurant', color: '#F97316', isPremium: false,
    words: [
      ['吃', 'chī', 'to eat', 'verb', '你想吃什么？', 'Nǐ xiǎng chī shénme?', 'What would you like to eat?', 'खाना', 'comer', '食べる'],
      ['喝', 'hē', 'to drink', 'verb', '我每天喝很多水。', 'Wǒ měitiān hē hěn duō shuǐ.', 'I drink a lot of water every day.', 'पीना', 'beber', '飲む'],
      ['米饭', 'mǐfàn', 'cooked rice', 'noun', '请给我一碗米饭。', 'Qǐng gěi wǒ yì wǎn mǐfàn.', 'Please give me a bowl of rice.', 'पका हुआ चावल', 'arroz cocido', 'ご飯'],
      ['面条', 'miàntiáo', 'noodles', 'noun', '这家店的面条很好吃。', 'Zhè jiā diàn de miàntiáo hěn hǎochī.', "This restaurant's noodles are delicious.", 'नूडल्स', 'fideos', '麺'],
      ['水', 'shuǐ', 'water', 'noun', '服务员，请来一杯水。', 'Fúwùyuán, qǐng lái yì bēi shuǐ.', 'Waiter, please bring a glass of water.', 'पानी', 'agua', '水'],
      ['茶', 'chá', 'tea', 'noun', '中国人常常喝茶。', 'Zhōngguó rén chángcháng hē chá.', 'Chinese people often drink tea.', 'चाय', 'té', 'お茶'],
      ['咖啡', 'kāfēi', 'coffee', 'noun', '这杯咖啡不加糖。', 'Zhè bēi kāfēi bù jiā táng.', 'This coffee has no sugar added.', 'कॉफ़ी', 'café', 'コーヒー'],
      ['好吃', 'hǎochī', 'delicious', 'adjective', '这个菜真好吃！', 'Zhège cài zhēn hǎochī!', 'This dish is really delicious!', 'स्वादिष्ट', 'delicioso', 'おいしい'],
    ],
  },
  {
    slug: 'fruits-and-vegetables', title: 'Fruits & Vegetables', titleCn: '水果与蔬菜',
    pinyin: 'shuǐguǒ yǔ shūcài', description: 'Recognize common produce and buy it with confidence.',
    hskLevel: 2, level: 'beginner', icon: 'nutrition', color: '#84CC16', isPremium: true,
    words: [
      ['苹果', 'píngguǒ', 'apple', 'noun', '我想买一公斤苹果。', 'Wǒ xiǎng mǎi yì gōngjīn píngguǒ.', 'I want to buy one kilogram of apples.', 'सेब', 'manzana', 'りんご'],
      ['香蕉', 'xiāngjiāo', 'banana', 'noun', '这根香蕉很甜。', 'Zhè gēn xiāngjiāo hěn tián.', 'This banana is very sweet.', 'केला', 'plátano', 'バナナ'],
      ['橙子', 'chéngzi', 'orange', 'noun', '橙子里有很多果汁。', 'Chéngzi lǐ yǒu hěn duō guǒzhī.', 'Oranges contain a lot of juice.', 'संतरा', 'naranja', 'オレンジ'],
      ['葡萄', 'pútao', 'grapes', 'noun', '这些葡萄有点儿酸。', 'Zhèxiē pútao yǒudiǎnr suān.', 'These grapes are a little sour.', 'अंगूर', 'uvas', 'ぶどう'],
      ['西瓜', 'xīguā', 'watermelon', 'noun', '夏天吃西瓜很舒服。', 'Xiàtiān chī xīguā hěn shūfu.', 'Eating watermelon in summer is refreshing.', 'तरबूज', 'sandía', 'スイカ'],
      ['草莓', 'cǎoméi', 'strawberry', 'noun', '我用草莓做蛋糕。', 'Wǒ yòng cǎoméi zuò dàngāo.', 'I use strawberries to make cake.', 'स्ट्रॉबेरी', 'fresa', 'いちご'],
      ['西红柿', 'xīhóngshì', 'tomato', 'noun', '西红柿炒鸡蛋很受欢迎。', 'Xīhóngshì chǎo jīdàn hěn shòu huānyíng.', 'Tomato and scrambled eggs is very popular.', 'टमाटर', 'tomate', 'トマト'],
      ['土豆', 'tǔdòu', 'potato', 'noun', '请把土豆切小一点。', 'Qǐng bǎ tǔdòu qiē xiǎo yìdiǎn.', 'Please cut the potato a little smaller.', 'आलू', 'patata', 'じゃがいも'],
    ],
  },
  {
    slug: 'home-and-daily-routine', title: 'Home & Daily Routine', titleCn: '居家与日常',
    pinyin: 'jūjiā yǔ rìcháng', description: 'Describe your home and the actions in a normal day.',
    hskLevel: 2, level: 'beginner', icon: 'home', color: '#14B8A6', isPremium: true,
    words: [
      ['房间', 'fángjiān', 'room', 'noun', '我的房间很安静。', 'Wǒ de fángjiān hěn ānjìng.', 'My room is very quiet.', 'कमरा', 'habitación', '部屋'],
      ['厨房', 'chúfáng', 'kitchen', 'noun', '厨房在客厅旁边。', 'Chúfáng zài kètīng pángbiān.', 'The kitchen is next to the living room.', 'रसोई', 'cocina', '台所'],
      ['洗手间', 'xǐshǒujiān', 'restroom', 'noun', '请问，洗手间在哪儿？', 'Qǐngwèn, xǐshǒujiān zài nǎr?', 'Excuse me, where is the restroom?', 'शौचालय', 'baño', 'お手洗い'],
      ['起床', 'qǐchuáng', 'to get up', 'verb', '我周末八点起床。', 'Wǒ zhōumò bā diǎn qǐchuáng.', 'I get up at eight on weekends.', 'उठना', 'levantarse', '起きる'],
      ['睡觉', 'shuìjiào', 'to sleep', 'verb', '太晚了，该睡觉了。', 'Tài wǎn le, gāi shuìjiào le.', "It's late; time to sleep.", 'सोना', 'dormir', '寝る'],
      ['洗澡', 'xǐzǎo', 'to take a shower', 'verb', '运动以后我要洗澡。', 'Yùndòng yǐhòu wǒ yào xǐzǎo.', 'I will shower after exercising.', 'नहाना', 'ducharse', 'シャワーを浴びる'],
      ['做饭', 'zuòfàn', 'to cook', 'verb', '今晚我来做饭。', 'Jīnwǎn wǒ lái zuòfàn.', 'I will cook tonight.', 'खाना बनाना', 'cocinar', '料理する'],
      ['回家', 'huí jiā', 'to go home', 'verb phrase', '下班以后我直接回家。', 'Xiàbān yǐhòu wǒ zhíjiē huí jiā.', 'I go straight home after work.', 'घर लौटना', 'volver a casa', '家に帰る'],
    ],
  },
  {
    slug: 'travel-and-transport', title: 'Travel & Transport', titleCn: '旅行与交通',
    pinyin: 'lǚxíng yǔ jiāotōng', description: 'Choose transport and handle common travel situations.',
    hskLevel: 2, level: 'beginner', icon: 'train', color: '#3B82F6', isPremium: true,
    words: [
      ['飞机', 'fēijī', 'airplane', 'noun', '飞机几点起飞？', 'Fēijī jǐ diǎn qǐfēi?', 'What time does the plane take off?', 'हवाई जहाज़', 'avión', '飛行機'],
      ['火车', 'huǒchē', 'train', 'noun', '坐火车去上海很方便。', 'Zuò huǒchē qù Shànghǎi hěn fāngbiàn.', 'Taking the train to Shanghai is convenient.', 'रेलगाड़ी', 'tren', '列車'],
      ['地铁', 'dìtiě', 'subway', 'noun', '我每天坐地铁上班。', 'Wǒ měitiān zuò dìtiě shàngbān.', 'I take the subway to work every day.', 'मेट्रो', 'metro', '地下鉄'],
      ['公共汽车', 'gōnggòng qìchē', 'bus', 'noun', '这辆公共汽车去市中心吗？', 'Zhè liàng gōnggòng qìchē qù shì zhōngxīn ma?', 'Does this bus go downtown?', 'बस', 'autobús', 'バス'],
      ['出租车', 'chūzūchē', 'taxi', 'noun', '我们叫一辆出租车吧。', 'Wǒmen jiào yí liàng chūzūchē ba.', "Let's call a taxi.", 'टैक्सी', 'taxi', 'タクシー'],
      ['车站', 'chēzhàn', 'station; stop', 'noun', '下一个车站是北京站。', 'Xià yí ge chēzhàn shì Běijīng Zhàn.', 'The next station is Beijing Station.', 'स्टेशन', 'estación', '駅'],
      ['票', 'piào', 'ticket', 'noun', '我在手机上买了票。', 'Wǒ zài shǒujī shàng mǎi le piào.', 'I bought the ticket on my phone.', 'टिकट', 'billete', '切符'],
      ['护照', 'hùzhào', 'passport', 'noun', '请出示您的护照。', 'Qǐng chūshì nín de hùzhào.', 'Please show your passport.', 'पासपोर्ट', 'pasaporte', 'パスポート'],
    ],
  },
  {
    slug: 'directions-and-places', title: 'Directions & Places', titleCn: '方向与地点',
    pinyin: 'fāngxiàng yǔ dìdiǎn', description: 'Ask where things are and understand simple directions.',
    hskLevel: 2, level: 'beginner', icon: 'map', color: '#A855F7', isPremium: true,
    words: [
      ['这里', 'zhèlǐ', 'here', 'place word', '请在这里等我。', 'Qǐng zài zhèlǐ děng wǒ.', 'Please wait for me here.', 'यहाँ', 'aquí', 'ここ'],
      ['那里', 'nàlǐ', 'there', 'place word', '我的学校就在那里。', 'Wǒ de xuéxiào jiù zài nàlǐ.', 'My school is right there.', 'वहाँ', 'allí', 'そこ'],
      ['左边', 'zuǒbian', 'left side', 'place word', '银行在超市左边。', 'Yínháng zài chāoshì zuǒbian.', 'The bank is to the left of the supermarket.', 'बाईं ओर', 'lado izquierdo', '左側'],
      ['右边', 'yòubian', 'right side', 'place word', '请走右边的门。', 'Qǐng zǒu yòubian de mén.', 'Please use the door on the right.', 'दाईं ओर', 'lado derecho', '右側'],
      ['前面', 'qiánmian', 'in front; ahead', 'place word', '地铁站就在前面。', 'Dìtiě zhàn jiù zài qiánmian.', 'The subway station is just ahead.', 'आगे; सामने', 'delante', '前'],
      ['后面', 'hòumian', 'behind; at the back', 'place word', '停车场在大楼后面。', 'Tíngchēchǎng zài dàlóu hòumian.', 'The parking lot is behind the building.', 'पीछे', 'detrás', '後ろ'],
      ['医院', 'yīyuàn', 'hospital', 'noun', '最近的医院怎么走？', 'Zuìjìn de yīyuàn zěnme zǒu?', 'How do I get to the nearest hospital?', 'अस्पताल', 'hospital', '病院'],
      ['银行', 'yínháng', 'bank', 'noun', '银行下午五点关门。', 'Yínháng xiàwǔ wǔ diǎn guānmén.', 'The bank closes at five in the afternoon.', 'बैंक', 'banco', '銀行'],
    ],
  },
  {
    slug: 'shopping-and-money', title: 'Shopping & Money', titleCn: '购物与金钱',
    pinyin: 'gòuwù yǔ jīnqián', description: 'Ask prices, compare options and complete a purchase.',
    hskLevel: 2, level: 'beginner', icon: 'shopping_bag', color: '#EAB308', isPremium: true,
    words: [
      ['买', 'mǎi', 'to buy', 'verb', '我想买一件外套。', 'Wǒ xiǎng mǎi yí jiàn wàitào.', 'I want to buy a coat.', 'खरीदना', 'comprar', '買う'],
      ['卖', 'mài', 'to sell', 'verb', '这家店卖中国茶。', 'Zhè jiā diàn mài Zhōngguó chá.', 'This shop sells Chinese tea.', 'बेचना', 'vender', '売る'],
      ['钱', 'qián', 'money', 'noun', '我身上没有现金。', 'Wǒ shēnshang méiyǒu xiànjīn.', "I don't have cash on me.", 'पैसा', 'dinero', 'お金'],
      ['块', 'kuài', 'colloquial yuan', 'measure word', '一共五十块。', 'Yígòng wǔshí kuài.', 'The total is fifty yuan.', 'युआन (बोलचाल)', 'yuan (coloquial)', '元（口語）'],
      ['贵', 'guì', 'expensive', 'adjective', '这双鞋有点儿贵。', 'Zhè shuāng xié yǒudiǎnr guì.', 'This pair of shoes is a little expensive.', 'महँगा', 'caro', '高い'],
      ['便宜', 'piányi', 'cheap; inexpensive', 'adjective', '网上买更便宜。', 'Wǎngshàng mǎi gèng piányi.', 'Buying online is cheaper.', 'सस्ता', 'barato', '安い'],
      ['试', 'shì', 'to try', 'verb', '这件衣服可以试吗？', 'Zhè jiàn yīfu kěyǐ shì ma?', 'Can I try on this clothing?', 'आज़माना', 'probar', '試す'],
      ['付款', 'fùkuǎn', 'to pay', 'verb', '您想怎么付款？', 'Nín xiǎng zěnme fùkuǎn?', 'How would you like to pay?', 'भुगतान करना', 'pagar', '支払う'],
    ],
  },
  {
    slug: 'feelings-and-health', title: 'Feelings & Health', titleCn: '感受与健康',
    pinyin: 'gǎnshòu yǔ jiànkāng', description: 'Express how you feel and ask for basic help.',
    hskLevel: 2, level: 'beginner', icon: 'favorite', color: '#EF4444', isPremium: true,
    words: [
      ['高兴', 'gāoxìng', 'happy; glad', 'adjective', '见到你我很高兴。', 'Jiàndào nǐ wǒ hěn gāoxìng.', "I'm very happy to see you.", 'खुश', 'feliz', 'うれしい'],
      ['难过', 'nánguò', 'sad; upset', 'adjective', '听到这个消息，她很难过。', 'Tīngdào zhège xiāoxi, tā hěn nánguò.', 'She was sad to hear this news.', 'उदास', 'triste', '悲しい'],
      ['累', 'lèi', 'tired', 'adjective', '走了一天，我很累。', 'Zǒu le yì tiān, wǒ hěn lèi.', 'I am tired after walking all day.', 'थका हुआ', 'cansado', '疲れた'],
      ['饿', 'è', 'hungry', 'adjective', '我饿了，先吃饭吧。', 'Wǒ è le, xiān chīfàn ba.', "I'm hungry; let's eat first.", 'भूखा', 'hambriento', 'お腹が空いた'],
      ['渴', 'kě', 'thirsty', 'adjective', '你渴不渴？', 'Nǐ kě bu kě?', 'Are you thirsty?', 'प्यासा', 'sediento', '喉が渇いた'],
      ['疼', 'téng', 'to hurt; painful', 'adjective', '我的头有点儿疼。', 'Wǒ de tóu yǒudiǎnr téng.', 'My head hurts a little.', 'दर्द होना', 'doler', '痛い'],
      ['医生', 'yīshēng', 'doctor', 'noun', '我需要看医生。', 'Wǒ xūyào kàn yīshēng.', 'I need to see a doctor.', 'डॉक्टर', 'médico', '医者'],
      ['帮助', 'bāngzhù', 'to help; help', 'verb; noun', '请帮助我找一下药店。', 'Qǐng bāngzhù wǒ zhǎo yíxià yàodiàn.', 'Please help me find a pharmacy.', 'मदद', 'ayudar; ayuda', '助ける; 助け'],
    ],
  },
];

const slugPart = (value: string): string => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

export const VOCABULARY_TOPIC_SEEDS = TOPICS.map((topic, index) => ({
  slug: topic.slug,
  title: topic.title,
  titleCn: topic.titleCn,
  pinyin: topic.pinyin,
  description: topic.description,
  hskLevel: topic.hskLevel,
  level: topic.level,
  icon: topic.icon,
  color: topic.color,
  isPremium: topic.isPremium,
  order: index + 1,
  isPublished: true,
  translations: {},
}));

export const VOCABULARY_WORD_SEEDS = TOPICS.flatMap(topic =>
  topic.words.map((item, index) => {
    const [
      chinese, pinyin, english, partOfSpeech,
      exampleChinese, examplePinyin, exampleEnglish,
      hindi, spanish, japanese, usageNote = '',
    ] = item;
    return {
      topicSlug: topic.slug,
      slug: `${topic.slug}-${index + 1}-${slugPart(pinyin)}`,
      fingerprint: `${chinese}|${pinyin}`.toLowerCase().replace(/\s+/g, ' ').trim(),
      chinese,
      pinyin,
      english,
      partOfSpeech,
      classifier: '',
      usageNote,
      exampleChinese,
      examplePinyin,
      exampleEnglish,
      translations: {
        hi: { english: hindi },
        es: { english: spanish },
        ja: { english: japanese },
      },
      order: index + 1,
      isPremium: topic.isPremium,
      isPublished: true,
    };
  }),
);

const duplicateFingerprints = VOCABULARY_WORD_SEEDS.reduce((duplicates, word, index, all) => {
  if (all.findIndex(candidate => candidate.fingerprint === word.fingerprint) !== index) {
    duplicates.add(word.fingerprint);
  }
  return duplicates;
}, new Set<string>());

if (duplicateFingerprints.size > 0) {
  throw new Error(`Duplicate packaged vocabulary: ${[...duplicateFingerprints].join(', ')}`);
}

export const VOCABULARY_CATALOG_STATS = {
  version: VOCABULARY_VERSION,
  topics: VOCABULARY_TOPIC_SEEDS.length,
  words: VOCABULARY_WORD_SEEDS.length,
  freeTopics: VOCABULARY_TOPIC_SEEDS.filter(topic => !topic.isPremium).length,
  premiumTopics: VOCABULARY_TOPIC_SEEDS.filter(topic => topic.isPremium).length,
} as const;
