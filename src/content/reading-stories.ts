import type { IReadingStory } from '../types';

/**
 * Short graded readers are deliberately separate from AI scenarios. Scenarios are
 * role-play prompts; these stories are quiet, repeatable reading practice with
 * line-by-line support, vocabulary and comprehension checks.
 */
export type ReadingStorySeed = Omit<IReadingStory, '_id' | 'createdAt' | 'source' | 'contentVersion'>;

export const READING_STORY_SEEDS: ReadingStorySeed[] = [
  {
    slug: 'a-small-morning', title: 'A Small Morning', titleCn: '一个小小的早晨', pinyin: 'yí gè xiǎoxiǎo de zǎochén',
    description: 'Follow Mei as she starts a calm morning and gets ready for class.', category: 'daily-life', level: 'beginner',
    icon: 'wb_sunny', color: '#F59E0B', isPremium: false, estimatedMinutes: 5, order: 1,
    paragraphs: [
      { chinese: '每天早上，梅六点半起床。', pinyin: 'Měi tiāntiān zǎoshang liù diǎn bàn qǐchuáng.', english: 'Every morning, Mei gets up at half past six.' },
      { chinese: '她先喝一杯温水，然后打开窗户。', pinyin: 'Tā xiān hē yì bēi wēn shuǐ, ránhòu dǎkāi chuānghu.', english: 'She first drinks a cup of warm water, then opens the window.' },
      { chinese: '外面的风很凉快，她觉得今天会是美好的一天。', pinyin: 'Wàimiàn de fēng hěn liángkuai, tā juéde jīntiān huì shì měihǎo de yì tiān.', english: 'The breeze outside is cool, and she feels today will be a good day.' },
    ],
    vocabulary: [
      { chinese: '每天', pinyin: 'měitiān', english: 'every day', partOfSpeech: 'time', exampleChinese: '我每天学习中文。', examplePinyin: 'Wǒ měitiān xuéxí Zhōngwén.', exampleEnglish: 'I study Chinese every day.' },
      { chinese: '起床', pinyin: 'qǐchuáng', english: 'to get up', partOfSpeech: 'verb', exampleChinese: '我七点起床。', examplePinyin: 'Wǒ qī diǎn qǐchuáng.', exampleEnglish: 'I get up at seven.' },
      { chinese: '温水', pinyin: 'wēn shuǐ', english: 'warm water', partOfSpeech: 'noun', exampleChinese: '请喝一点温水。', examplePinyin: 'Qǐng hē yìdiǎn wēn shuǐ.', exampleEnglish: 'Please drink some warm water.' },
      { chinese: '美好', pinyin: 'měihǎo', english: 'wonderful', partOfSpeech: 'adjective', exampleChinese: '祝你有美好的一天。', examplePinyin: 'Zhù nǐ yǒu měihǎo de yì tiān.', exampleEnglish: 'Have a wonderful day.' },
    ],
    questions: [
      { prompt: '梅几点起床？', options: ['六点', '六点半', '七点半', '八点'], answer: '六点半', explanation: 'The first sentence says 梅六点半起床.' },
      { prompt: '梅喝什么？', options: ['咖啡', '茶', '温水', '果汁'], answer: '温水', explanation: 'She drinks a cup of warm water.' },
    ],
    isPublished: true,
  },
  {
    slug: 'xiaobai-the-cat', title: 'Xiaobai the Cat', titleCn: '小白猫', pinyin: 'Xiǎobái māo',
    description: 'A playful cat teaches a child how to describe an animal.', category: 'people-and-animals', level: 'beginner',
    icon: 'pets', color: '#EC4899', isPremium: false, estimatedMinutes: 5, order: 2,
    paragraphs: [
      { chinese: '小丽家有一只白色的小猫，名字叫小白。', pinyin: 'Xiǎolì jiā yǒu yì zhī báisè de xiǎo māo, míngzi jiào Xiǎobái.', english: 'Xiaoli has a small white cat called Xiaobai.' },
      { chinese: '小白喜欢在阳台上晒太阳，也喜欢追一个红球。', pinyin: 'Xiǎobái xǐhuan zài yángtái shàng shài tàiyáng, yě xǐhuan zhuī yí ge hóng qiú.', english: 'Xiaobai likes sunbathing on the balcony and chasing a red ball.' },
      { chinese: '晚上，小白跳到小丽的椅子上，安静地睡着了。', pinyin: 'Wǎnshang, Xiǎobái tiào dào Xiǎolì de yǐzi shàng, ānjìng de shuìzháo le.', english: 'At night, Xiaobai jumps onto Xiaoli’s chair and falls asleep quietly.' },
    ],
    vocabulary: [
      { chinese: '一只', pinyin: 'yì zhī', english: 'one (for animals)', partOfSpeech: 'measure word', exampleChinese: '我看见一只鸟。', examplePinyin: 'Wǒ kànjiàn yì zhī niǎo.', exampleEnglish: 'I saw a bird.' },
      { chinese: '阳台', pinyin: 'yángtái', english: 'balcony', partOfSpeech: 'noun', exampleChinese: '花在阳台上。', examplePinyin: 'Huā zài yángtái shàng.', exampleEnglish: 'The flowers are on the balcony.' },
      { chinese: '追', pinyin: 'zhuī', english: 'to chase', partOfSpeech: 'verb', exampleChinese: '孩子在追猫。', examplePinyin: 'Háizi zài zhuī māo.', exampleEnglish: 'The child is chasing the cat.' },
      { chinese: '安静', pinyin: 'ānjìng', english: 'quiet', partOfSpeech: 'adjective', exampleChinese: '图书馆很安静。', examplePinyin: 'Túshūguǎn hěn ānjìng.', exampleEnglish: 'The library is quiet.' },
    ],
    questions: [
      { prompt: '小白是什么颜色？', options: ['黑色', '黄色', '白色', '灰色'], answer: '白色', explanation: '小白 is described as a white cat.' },
      { prompt: '小白追什么？', options: ['一只鸟', '一个红球', '一辆车', '一条鱼'], answer: '一个红球', explanation: 'The story says it chases a red ball.' },
    ],
    isPublished: true,
  },
  {
    slug: 'the-market-umbrella', title: 'The Market Umbrella', titleCn: '市场上的雨伞', pinyin: 'shìchǎng shàng de yǔsǎn',
    description: 'Read a simple market visit and learn useful weather and shopping words.', category: 'daily-life', level: 'beginner',
    icon: 'storefront', color: '#14B8A6', isPremium: false, estimatedMinutes: 6, order: 3,
    paragraphs: [
      { chinese: '今天下午突然下雨，安娜没有带雨伞。', pinyin: 'Jīntiān xiàwǔ tūrán xiàyǔ, Ānnà méiyǒu dài yǔsǎn.', english: 'It suddenly rains this afternoon, and Anna did not bring an umbrella.' },
      { chinese: '她跑进市场，在一个小摊上看到很多漂亮的伞。', pinyin: 'Tā pǎo jìn shìchǎng, zài yí ge xiǎo tān shàng kàndào hěn duō piàoliang de sǎn.', english: 'She runs into the market and sees many pretty umbrellas at a small stall.' },
      { chinese: '老板说：“这把蓝色的伞只要三十块钱。”安娜买下了它。', pinyin: 'Lǎobǎn shuō: “Zhè bǎ lánsè de sǎn zhǐ yào sānshí kuài qián.” Ānnà mǎixià le tā.', english: 'The shopkeeper says, “This blue umbrella is only thirty yuan.” Anna buys it.' },
    ],
    vocabulary: [
      { chinese: '突然', pinyin: 'tūrán', english: 'suddenly', partOfSpeech: 'adverb', exampleChinese: '天突然黑了。', examplePinyin: 'Tiān tūrán hēi le.', exampleEnglish: 'The sky suddenly became dark.' },
      { chinese: '带', pinyin: 'dài', english: 'to bring', partOfSpeech: 'verb', exampleChinese: '别忘了带手机。', examplePinyin: 'Bié wàng le dài shǒujī.', exampleEnglish: 'Do not forget to bring your phone.' },
      { chinese: '摊', pinyin: 'tān', english: 'stall', partOfSpeech: 'noun', exampleChinese: '这个摊卖水果。', examplePinyin: 'Zhège tān mài shuǐguǒ.', exampleEnglish: 'This stall sells fruit.' },
      { chinese: '只要', pinyin: 'zhǐyào', english: 'only need; just', partOfSpeech: 'adverb', exampleChinese: '这本书只要十块钱。', examplePinyin: 'Zhè běn shū zhǐ yào shí kuài qián.', exampleEnglish: 'This book is only ten yuan.' },
    ],
    questions: [
      { prompt: '安娜为什么跑进市场？', options: ['她饿了', '她要避雨', '她要找朋友', '她要买水果'], answer: '她要避雨', explanation: 'It started raining and she had no umbrella.' },
      { prompt: '蓝色的伞多少钱？', options: ['十块', '二十块', '三十块', '五十块'], answer: '三十块', explanation: 'The shopkeeper says 三十块钱.' },
    ],
    isPublished: true,
  },
  {
    slug: 'the-lost-wallet', title: 'The Lost Wallet', titleCn: '丢失的钱包', pinyin: 'diūshī de qiánbāo',
    description: 'A short story about asking for help and returning something important.', category: 'everyday-problems', level: 'elementary',
    icon: 'account_balance_wallet', color: '#3B82F6', isPremium: false, estimatedMinutes: 6, order: 4,
    paragraphs: [
      { chinese: '王明下班以后发现自己的钱包不见了。', pinyin: 'Wáng Míng xiàbān yǐhòu fāxiàn zìjǐ de qiánbāo bú jiàn le.', english: 'After work, Wang Ming discovers that his wallet is missing.' },
      { chinese: '他回到办公室，认真地找了每一张桌子，但是没有找到。', pinyin: 'Tā huí dào bàngōngshì, rènzhēn de zhǎo le měi yì zhāng zhuōzi, dànshì méiyǒu zhǎodào.', english: 'He returns to the office and carefully searches every desk, but cannot find it.' },
      { chinese: '同事小周在打印机旁边发现钱包，马上还给了他。王明非常感谢小周。', pinyin: 'Tóngshì Xiǎo Zhōu zài dǎyìnjī pángbiān fāxiàn qiánbāo, mǎshàng huán gěi le tā. Wáng Míng fēicháng gǎnxiè Xiǎo Zhōu.', english: 'His colleague Xiaozhou finds the wallet beside the printer and immediately returns it. Wang Ming is very grateful.' },
    ],
    vocabulary: [
      { chinese: '发现', pinyin: 'fāxiàn', english: 'to discover', partOfSpeech: 'verb', exampleChinese: '我发现一个问题。', examplePinyin: 'Wǒ fāxiàn yí ge wèntí.', exampleEnglish: 'I discovered a problem.' },
      { chinese: '不见', pinyin: 'bú jiàn', english: 'to be missing', partOfSpeech: 'verb', exampleChinese: '我的钥匙不见了。', examplePinyin: 'Wǒ de yàoshi bú jiàn le.', exampleEnglish: 'My keys are missing.' },
      { chinese: '认真', pinyin: 'rènzhēn', english: 'carefully; serious', partOfSpeech: 'adverb', exampleChinese: '请认真听。', examplePinyin: 'Qǐng rènzhēn tīng.', exampleEnglish: 'Please listen carefully.' },
      { chinese: '感谢', pinyin: 'gǎnxiè', english: 'to thank; gratitude', partOfSpeech: 'verb', exampleChinese: '感谢你的帮助。', examplePinyin: 'Gǎnxiè nǐ de bāngzhù.', exampleEnglish: 'Thank you for your help.' },
    ],
    questions: [
      { prompt: '钱包在哪里找到的？', options: ['桌子下面', '打印机旁边', '公交车上', '家里'], answer: '打印机旁边', explanation: 'Xiaozhou finds it beside the printer.' },
      { prompt: '王明对小周的感觉是什么？', options: ['生气', '感谢', '害怕', '奇怪'], answer: '感谢', explanation: 'He is very grateful to Xiaozhou.' },
    ],
    isPublished: true,
  },
  {
    slug: 'tea-house-kindness', title: 'Kindness at the Tea House', titleCn: '茶馆里的善意', pinyin: 'cháguǎn lǐ de shànyì',
    description: 'Learn how a small act of kindness connects two strangers over tea.', category: 'culture', level: 'elementary',
    icon: 'emoji_food_beverage', color: '#A16207', isPremium: true, estimatedMinutes: 7, order: 5,
    paragraphs: [
      { chinese: '林娜第一次去成都的老茶馆，一个人坐在窗边。', pinyin: 'Lín Nà dì yī cì qù Chéngdū de lǎo cháguǎn, yí ge rén zuò zài chuāngbiān.', english: 'Lin Na visits an old tea house in Chengdu for the first time and sits alone by the window.' },
      { chinese: '她不会用茶馆里的长嘴茶壶，旁边的爷爷笑着教她。', pinyin: 'Tā bú huì yòng cháguǎn lǐ de chángzuǐ cháhú, pángbiān de yéye xiàozhe jiāo tā.', english: 'She does not know how to use the long-spout teapot, so the grandfather next to her teaches her with a smile.' },
      { chinese: '两个人聊了很久。离开时，林娜学会了倒茶，也记住了这个温暖的下午。', pinyin: 'Liǎng ge rén liáo le hěn jiǔ. Líkāi shí, Lín Nà xuéhuì le dào chá, yě jìzhù le zhège wēnnuǎn de xiàwǔ.', english: 'They talk for a long time. When Lin Na leaves, she has learned to pour tea and remembers the warm afternoon.' },
    ],
    vocabulary: [
      { chinese: '茶馆', pinyin: 'cháguǎn', english: 'tea house', partOfSpeech: 'noun', exampleChinese: '我们在茶馆见面吧。', examplePinyin: 'Wǒmen zài cháguǎn jiànmiàn ba.', exampleEnglish: 'Let us meet at the tea house.' },
      { chinese: '旁边', pinyin: 'pángbiān', english: 'beside; next to', partOfSpeech: 'location', exampleChinese: '银行在学校旁边。', examplePinyin: 'Yínháng zài xuéxiào pángbiān.', exampleEnglish: 'The bank is next to the school.' },
      { chinese: '教', pinyin: 'jiāo', english: 'to teach', partOfSpeech: 'verb', exampleChinese: '老师教我们汉字。', examplePinyin: 'Lǎoshī jiāo wǒmen Hànzì.', exampleEnglish: 'The teacher teaches us Chinese characters.' },
      { chinese: '温暖', pinyin: 'wēnnuǎn', english: 'warm; heartwarming', partOfSpeech: 'adjective', exampleChinese: '这是一个温暖的故事。', examplePinyin: 'Zhè shì yí ge wēnnuǎn de gùshi.', exampleEnglish: 'This is a heartwarming story.' },
    ],
    questions: [
      { prompt: '林娜在哪里坐着？', options: ['门口', '厨房', '窗边', '楼上'], answer: '窗边', explanation: 'She sits by the window.' },
      { prompt: '爷爷教林娜做什么？', options: ['写字', '倒茶', '唱歌', '做饭'], answer: '倒茶', explanation: 'He teaches her how to pour tea.' },
    ],
    isPublished: true,
  },
  {
    slug: 'train-to-suzhou', title: 'The Train to Suzhou', titleCn: '去苏州的火车', pinyin: 'qù Sūzhōu de huǒchē',
    description: 'Read a travel story about checking a ticket and meeting a helpful passenger.', category: 'travel', level: 'elementary',
    icon: 'train', color: '#0EA5E9', isPremium: true, estimatedMinutes: 7, order: 6,
    paragraphs: [
      { chinese: '陈浩第一次坐高铁去苏州，提前一个小时到了车站。', pinyin: 'Chén Hào dì yī cì zuò gāotiě qù Sūzhōu, tíqián yí ge xiǎoshí dào le chēzhàn.', english: 'Chen Hao takes a high-speed train to Suzhou for the first time and arrives at the station an hour early.' },
      { chinese: '他看不懂电子屏上的站台号码，就问一位穿蓝衣服的乘客。', pinyin: 'Tā kàn bù dǒng diànzǐ píng shàng de zhàntái hàomǎ, jiù wèn yí wèi chuān lán yīfu de chéngkè.', english: 'He cannot understand the platform number on the screen, so he asks a passenger wearing blue.' },
      { chinese: '乘客带他走到正确的站台。火车准时出发，陈浩安心地看着窗外的风景。', pinyin: 'Chéngkè dài tā zǒu dào zhèngquè de zhàntái. Huǒchē zhǔnshí chūfā, Chén Hào ānxīn de kànzhe chuāngwài de fēngjǐng.', english: 'The passenger takes him to the correct platform. The train leaves on time, and Chen Hao enjoys the view outside.' },
    ],
    vocabulary: [
      { chinese: '高铁', pinyin: 'gāotiě', english: 'high-speed rail', partOfSpeech: 'noun', exampleChinese: '高铁很快。', examplePinyin: 'Gāotiě hěn kuài.', exampleEnglish: 'The high-speed train is fast.' },
      { chinese: '提前', pinyin: 'tíqián', english: 'ahead of time', partOfSpeech: 'adverb', exampleChinese: '请提前到这里。', examplePinyin: 'Qǐng tíqián dào zhèlǐ.', exampleEnglish: 'Please arrive here early.' },
      { chinese: '站台', pinyin: 'zhàntái', english: 'platform', partOfSpeech: 'noun', exampleChinese: '三号站台在哪里？', examplePinyin: 'Sān hào zhàntái zài nǎlǐ?', exampleEnglish: 'Where is platform three?' },
      { chinese: '准时', pinyin: 'zhǔnshí', english: 'on time', partOfSpeech: 'adverb', exampleChinese: '会议八点准时开始。', examplePinyin: 'Huìyì bā diǎn zhǔnshí kāishǐ.', exampleEnglish: 'The meeting starts at eight on time.' },
    ],
    questions: [
      { prompt: '陈浩提前多久到车站？', options: ['半小时', '一个小时', '两小时', '一天'], answer: '一个小时', explanation: 'He arrives one hour early.' },
      { prompt: '乘客穿什么颜色的衣服？', options: ['红色', '黑色', '蓝色', '白色'], answer: '蓝色', explanation: 'The passenger is wearing blue.' },
    ],
    isPublished: true,
  },
  {
    slug: 'first-day-at-work', title: 'The First Day at Work', titleCn: '工作的第一天', pinyin: 'gōngzuò de dì yī tiān',
    description: 'A new employee learns to introduce herself, ask questions and take notes.', category: 'work', level: 'intermediate',
    icon: 'work', color: '#6366F1', isPremium: false, estimatedMinutes: 8, order: 7,
    paragraphs: [
      { chinese: '赵琳今天是新公司的第一天上班，心里有一点紧张。', pinyin: 'Zhào Lín jīntiān shì xīn gōngsī de dì yī tiān shàngbān, xīnli yǒu yìdiǎn jǐnzhāng.', english: 'Today is Zhao Lin’s first day at her new company, and she feels a little nervous.' },
      { chinese: '经理请她向团队介绍自己，并告诉她本周的工作目标。', pinyin: 'Jīnglǐ qǐng tā xiàng tuánduì jièshào zìjǐ, bìng gàosu tā běn zhōu de gōngzuò mùbiāo.', english: 'The manager asks her to introduce herself to the team and tells her this week’s work goals.' },
      { chinese: '赵琳认真记下重点。她发现同事都很友好，于是慢慢放松了。', pinyin: 'Zhào Lín rènzhēn jì xià zhòngdiǎn. Tā fāxiàn tóngshì dōu hěn yǒuhǎo, yúshì mànmàn fàngsōng le.', english: 'Zhao Lin carefully writes down the key points. She finds her colleagues friendly and slowly relaxes.' },
    ],
    vocabulary: [
      { chinese: '紧张', pinyin: 'jǐnzhāng', english: 'nervous', partOfSpeech: 'adjective', exampleChinese: '考试前我有点紧张。', examplePinyin: 'Kǎoshì qián wǒ yǒudiǎn jǐnzhāng.', exampleEnglish: 'I am a little nervous before the exam.' },
      { chinese: '团队', pinyin: 'tuánduì', english: 'team', partOfSpeech: 'noun', exampleChinese: '我们的团队很小。', examplePinyin: 'Wǒmen de tuánduì hěn xiǎo.', exampleEnglish: 'Our team is small.' },
      { chinese: '目标', pinyin: 'mùbiāo', english: 'goal; target', partOfSpeech: 'noun', exampleChinese: '今年的目标是什么？', examplePinyin: 'Jīnnián de mùbiāo shì shénme?', exampleEnglish: 'What is this year’s goal?' },
      { chinese: '重点', pinyin: 'zhòngdiǎn', english: 'key point', partOfSpeech: 'noun', exampleChinese: '请说一下重点。', examplePinyin: 'Qǐng shuō yíxià zhòngdiǎn.', exampleEnglish: 'Please mention the key point.' },
    ],
    questions: [
      { prompt: '赵琳为什么紧张？', options: ['她迷路了', '她第一天上班', '她生病了', '她迟到了'], answer: '她第一天上班', explanation: 'It is her first day at a new company.' },
      { prompt: '赵琳后来为什么放松？', options: ['经理离开了', '工作结束了', '同事很友好', '她回家了'], answer: '同事很友好', explanation: 'Friendly colleagues help her relax.' },
    ],
    isPublished: true,
  },
  {
    slug: 'mid-autumn-lanterns', title: 'Lanterns at Mid-Autumn Festival', titleCn: '中秋节的灯笼', pinyin: 'Zhōngqiūjié de dēnglong',
    description: 'Discover a family tradition while practicing a gentle culture-focused story.', category: 'culture', level: 'intermediate',
    icon: 'celebration', color: '#F97316', isPremium: true, estimatedMinutes: 8, order: 8,
    paragraphs: [
      { chinese: '中秋节晚上，明明和奶奶一起到院子里挂灯笼。', pinyin: 'Zhōngqiūjié wǎnshang, Míngming hé nǎinai yìqǐ dào yuànzi lǐ guà dēnglong.', english: 'On the evening of Mid-Autumn Festival, Mingming hangs lanterns in the yard with his grandmother.' },
      { chinese: '奶奶一边讲月亮的故事，一边把月饼切成小块。', pinyin: 'Nǎinai yìbiān jiǎng yuèliang de gùshi, yìbiān bǎ yuèbǐng qiē chéng xiǎo kuài.', english: 'Grandmother tells a story about the moon while cutting the mooncake into small pieces.' },
      { chinese: '一家人坐在月光下分享月饼。明明觉得，和家人在一起就是最好的节日。', pinyin: 'Yì jiā rén zuò zài yuèguāng xià fēnxiǎng yuèbǐng. Míngming juéde, hé jiā rén zài yìqǐ jiù shì zuì hǎo de jiérì.', english: 'The family shares mooncakes under the moonlight. Mingming feels that being together is the best part of the festival.' },
    ],
    vocabulary: [
      { chinese: '灯笼', pinyin: 'dēnglong', english: 'lantern', partOfSpeech: 'noun', exampleChinese: '门口挂着红灯笼。', examplePinyin: 'Ménkǒu guàzhe hóng dēnglong.', exampleEnglish: 'Red lanterns hang by the door.' },
      { chinese: '一边……一边……', pinyin: 'yìbiān…yìbiān…', english: 'while doing…; and at the same time', partOfSpeech: 'pattern', exampleChinese: '她一边走路一边听音乐。', examplePinyin: 'Tā yìbiān zǒulù yìbiān tīng yīnyuè.', exampleEnglish: 'She listens to music while walking.' },
      { chinese: '分享', pinyin: 'fēnxiǎng', english: 'to share', partOfSpeech: 'verb', exampleChinese: '我们分享一个好消息。', examplePinyin: 'Wǒmen fēnxiǎng yí ge hǎo xiāoxi.', exampleEnglish: 'We share good news.' },
      { chinese: '节日', pinyin: 'jiérì', english: 'festival; holiday', partOfSpeech: 'noun', exampleChinese: '春节是重要的节日。', examplePinyin: 'Chūnjié shì zhòngyào de jiérì.', exampleEnglish: 'Spring Festival is an important holiday.' },
    ],
    questions: [
      { prompt: '明明和谁挂灯笼？', options: ['爸爸', '朋友', '奶奶', '老师'], answer: '奶奶', explanation: 'He hangs lanterns with his grandmother.' },
      { prompt: '一家人在月光下分享什么？', options: ['饺子', '月饼', '水果', '面条'], answer: '月饼', explanation: 'They share mooncakes.' },
    ],
    isPublished: true,
  },
  {
    slug: 'the-green-library', title: 'The Green Library', titleCn: '绿色图书馆', pinyin: 'lǜsè túshūguǎn',
    description: 'An intermediate reader about a community project and sharing ideas politely.', category: 'community', level: 'advanced',
    icon: 'local_library', color: '#22C55E', isPremium: false, estimatedMinutes: 9, order: 9,
    paragraphs: [
      { chinese: '旧社区中心有一间很少使用的房间，大家决定把它变成小图书馆。', pinyin: 'Jiù shèqū zhōngxīn yǒu yì jiān hěn shǎo shǐyòng de fángjiān, dàjiā juédìng bǎ tā biàn chéng xiǎo túshūguǎn.', english: 'The old community center has a room that is rarely used, so everyone decides to turn it into a small library.' },
      { chinese: '有人捐书，有人刷墙，还有人设计借书卡。', pinyin: 'Yǒurén juān shū, yǒurén shuā qiáng, hái yǒurén shèjì jièshū kǎ.', english: 'Some people donate books, some paint the walls, and others design library cards.' },
      { chinese: '开门那天，孩子们带着家人来参观。这个小房间终于成了邻居们共同的空间。', pinyin: 'Kāimén nà tiān, háizimen dàizhe jiārén lái cānguān. Zhège xiǎo fángjiān zhōngyú chéng le línjūmen gòngtóng de kōngjiān.', english: 'On opening day, children come with their families. The little room finally becomes a shared space for the neighbors.' },
    ],
    vocabulary: [
      { chinese: '社区', pinyin: 'shèqū', english: 'community', partOfSpeech: 'noun', exampleChinese: '社区组织了一个活动。', examplePinyin: 'Shèqū zǔzhī le yí ge huódòng.', exampleEnglish: 'The community organized an event.' },
      { chinese: '捐', pinyin: 'juān', english: 'to donate', partOfSpeech: 'verb', exampleChinese: '她捐了几本书。', examplePinyin: 'Tā juān le jǐ běn shū.', exampleEnglish: 'She donated several books.' },
      { chinese: '设计', pinyin: 'shèjì', english: 'to design', partOfSpeech: 'verb/noun', exampleChinese: '他负责设计海报。', examplePinyin: 'Tā fùzé shèjì hǎibào.', exampleEnglish: 'He is responsible for designing the poster.' },
      { chinese: '共同', pinyin: 'gòngtóng', english: 'shared; together', partOfSpeech: 'adjective', exampleChinese: '这是我们的共同目标。', examplePinyin: 'Zhè shì wǒmen de gòngtóng mùbiāo.', exampleEnglish: 'This is our shared goal.' },
    ],
    questions: [
      { prompt: '大家把房间变成了什么？', options: ['餐厅', '教室', '小图书馆', '商店'], answer: '小图书馆', explanation: 'They turn the room into a small library.' },
      { prompt: '谁来参观开门那天的图书馆？', options: ['只有老师', '孩子们和家人', '游客', '没有人'], answer: '孩子们和家人', explanation: 'Children arrive with their families.' },
    ],
    isPublished: true,
  },
  {
    slug: 'a-neighborhood-garden', title: 'A Neighborhood Garden', titleCn: '邻里的小花园', pinyin: 'línlǐ de xiǎo huāyuán',
    description: 'Practice describing change, cooperation and a greener neighborhood.', category: 'community', level: 'advanced',
    icon: 'yard', color: '#10B981', isPremium: true, estimatedMinutes: 9, order: 10,
    paragraphs: [
      { chinese: '小区后面原来是一块空地，常常有垃圾和灰尘。', pinyin: 'Xiǎoqū hòumiàn yuánlái shì yí kuài kòngdì, chángcháng yǒu lājī hé huīchén.', english: 'Behind the apartment complex there used to be an empty lot, often covered with rubbish and dust.' },
      { chinese: '居民开会以后，决定一起种花、种菜，并且安排每周打扫。', pinyin: 'Jūmín kāihuì yǐhòu, juédìng yìqǐ zhòng huā, zhòng cài, bìngqiě ānpái měi zhōu dǎsǎo.', english: 'After a residents’ meeting, they decide to plant flowers and vegetables together and schedule weekly cleaning.' },
      { chinese: '几个月以后，空地变成了漂亮的花园。大家不但更常聊天，也更关心自己的邻居。', pinyin: 'Jǐ ge yuè yǐhòu, kòngdì biàn chéng le piàoliang de huāyuán. Dàjiā búdàn gèng cháng liáotiān, yě gèng guānxīn zìjǐ de línjū.', english: 'A few months later, the empty lot becomes a beautiful garden. People not only chat more often, but also care more about their neighbors.' },
    ],
    vocabulary: [
      { chinese: '空地', pinyin: 'kòngdì', english: 'empty lot', partOfSpeech: 'noun', exampleChinese: '这块空地可以种树。', examplePinyin: 'Zhè kuài kòngdì kěyǐ zhòng shù.', exampleEnglish: 'Trees can be planted in this empty lot.' },
      { chinese: '居民', pinyin: 'jūmín', english: 'resident', partOfSpeech: 'noun', exampleChinese: '居民都同意这个计划。', examplePinyin: 'Jūmín dōu tóngyì zhège jìhuà.', exampleEnglish: 'All the residents agree with the plan.' },
      { chinese: '安排', pinyin: 'ānpái', english: 'to arrange; schedule', partOfSpeech: 'verb', exampleChinese: '我来安排会议。', examplePinyin: 'Wǒ lái ānpái huìyì.', exampleEnglish: 'I will arrange the meeting.' },
      { chinese: '不但……也……', pinyin: 'búdàn…yě…', english: 'not only…but also', partOfSpeech: 'pattern', exampleChinese: '她不但会说，也会写。', examplePinyin: 'Tā búdàn huì shuō, yě huì xiě.', exampleEnglish: 'She can not only speak, but also write.' },
    ],
    questions: [
      { prompt: '空地以前有什么问题？', options: ['太小', '有垃圾和灰尘', '没有水', '太远'], answer: '有垃圾和灰尘', explanation: 'The lot was often covered with rubbish and dust.' },
      { prompt: '花园建好以后，居民有什么变化？', options: ['更少见面', '更常聊天并关心邻居', '搬走了', '不再种菜'], answer: '更常聊天并关心邻居', explanation: 'The final paragraph describes both changes.' },
    ],
    isPublished: true,
  },
];

export const READING_STORY_STATS = {
  stories: READING_STORY_SEEDS.length,
  paragraphs: READING_STORY_SEEDS.reduce((sum, story) => sum + story.paragraphs.length, 0),
  vocabulary: READING_STORY_SEEDS.reduce((sum, story) => sum + story.vocabulary.length, 0),
} as const;
