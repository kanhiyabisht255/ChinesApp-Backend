import type { IListeningLesson } from '../types';

export type ListeningLessonSeed = Omit<IListeningLesson, '_id' | 'createdAt' | 'source' | 'contentVersion'>;

const lesson = (value: ListeningLessonSeed): ListeningLessonSeed => value;

/** Original, graded listening scripts written for ChinesApp. */
export const LISTENING_LESSON_SEEDS: ListeningLessonSeed[] = [
  lesson({
    slug: 'morning-before-class', title: 'Morning Before Class', titleCn: '上课前的早上', pinyin: 'shàngkè qián de zǎoshang',
    description: 'Catch familiar times and routine verbs in a short exchange before Chinese class.', category: 'daily-life', level: 'beginner', hskLevel: 1,
    icon: 'wb_sunny', color: '#F59E0B', isPremium: false, estimatedMinutes: 5, xpReward: 20, order: 1,
    preListenTip: 'Listen once without reading. Focus only on the time and where Lin is going.',
    segments: [
      { speaker: 'speakerA', speakerName: '安娜', chinese: '早上好！你几点起床？', pinyin: 'Zǎoshang hǎo! Nǐ jǐ diǎn qǐchuáng?', english: 'Good morning! What time do you get up?' },
      { speaker: 'speakerB', speakerName: '林', chinese: '我七点起床，八点去学校。', pinyin: 'Wǒ qī diǎn qǐchuáng, bā diǎn qù xuéxiào.', english: 'I get up at seven and go to school at eight.' },
      { speaker: 'speakerA', speakerName: '安娜', chinese: '好，我们八点半上课。', pinyin: 'Hǎo, wǒmen bā diǎn bàn shàngkè.', english: 'Good, our class starts at eight thirty.' },
    ],
    focusWords: [
      { chinese: '起床', pinyin: 'qǐchuáng', english: 'get up' },
      { chinese: '学校', pinyin: 'xuéxiào', english: 'school' },
      { chinese: '上课', pinyin: 'shàngkè', english: 'attend class' },
    ],
    questions: [
      { type: 'gist', prompt: 'What are they mainly discussing?', options: ['A morning schedule', 'Buying books', 'Cooking dinner', 'The weather'], answer: 'A morning schedule', explanation: 'They exchange wake-up, school and class times.' },
      { type: 'detail', prompt: '林几点去学校？', options: ['七点', '八点', '八点半', '九点'], answer: '八点', explanation: '林 says 八点去学校.', replaySegmentIndex: 1 },
      { type: 'dictation', prompt: 'Type the class time you hear in Chinese.', options: [], answer: '八点半', explanation: '安娜 says 八点半上课.', replaySegmentIndex: 2 },
    ],
    isPublished: true,
  }),
  lesson({
    slug: 'choosing-fruit', title: 'Choosing Fruit', titleCn: '买什么水果', pinyin: 'mǎi shénme shuǐguǒ',
    description: 'Recognize fruit names, quantities and a simple price at a neighborhood shop.', category: 'shopping', level: 'beginner', hskLevel: 1,
    icon: 'shopping_basket', color: '#22C55E', isPremium: false, estimatedMinutes: 5, xpReward: 20, order: 2,
    preListenTip: 'Listen for two fruit names and one number. Do not worry about every word.',
    segments: [
      { speaker: 'speakerA', speakerName: '顾客', chinese: '你好，我要三个苹果。', pinyin: 'Nǐ hǎo, wǒ yào sān ge píngguǒ.', english: 'Hello, I would like three apples.' },
      { speaker: 'speakerB', speakerName: '店员', chinese: '好的。你也要香蕉吗？', pinyin: 'Hǎo de. Nǐ yě yào xiāngjiāo ma?', english: 'Sure. Would you also like bananas?' },
      { speaker: 'speakerA', speakerName: '顾客', chinese: '不要，谢谢。苹果十块钱。', pinyin: 'Bú yào, xièxie. Píngguǒ shí kuài qián.', english: 'No, thank you. The apples are ten yuan.' },
    ],
    focusWords: [
      { chinese: '苹果', pinyin: 'píngguǒ', english: 'apple' },
      { chinese: '香蕉', pinyin: 'xiāngjiāo', english: 'banana' },
      { chinese: '块钱', pinyin: 'kuài qián', english: 'yuan (spoken)' },
    ],
    questions: [
      { type: 'gist', prompt: 'Where does this conversation happen?', options: ['At a fruit shop', 'At school', 'On a bus', 'At home'], answer: 'At a fruit shop', explanation: 'A customer orders apples and discusses bananas and price.' },
      { type: 'detail', prompt: '顾客要几个苹果？', options: ['一个', '两个', '三个', '十个'], answer: '三个', explanation: 'The customer says 我要三个苹果.', replaySegmentIndex: 0 },
      { type: 'dictation', prompt: 'Type the fruit the customer does not want.', options: [], answer: '香蕉', explanation: 'The shop assistant offers 香蕉 and the customer says 不要.', replaySegmentIndex: 1 },
    ],
    isPublished: true,
  }),
  lesson({
    slug: 'finding-the-classroom', title: 'Finding the Classroom', titleCn: '教室在哪里', pinyin: 'jiàoshì zài nǎlǐ',
    description: 'Follow a tiny direction exchange using floors, left and room numbers.', category: 'school', level: 'beginner', hskLevel: 1,
    icon: 'school', color: '#3B82F6', isPremium: false, estimatedMinutes: 5, xpReward: 20, order: 3,
    preListenTip: 'Listen for a floor number and the final classroom number.',
    segments: [
      { speaker: 'speakerA', speakerName: '学生', chinese: '请问，中文教室在哪里？', pinyin: 'Qǐngwèn, Zhōngwén jiàoshì zài nǎlǐ?', english: 'Excuse me, where is the Chinese classroom?' },
      { speaker: 'speakerB', speakerName: '老师', chinese: '在二楼。上楼以后往左走。', pinyin: 'Zài èr lóu. Shàng lóu yǐhòu wǎng zuǒ zǒu.', english: 'It is on the second floor. Go left after going upstairs.' },
      { speaker: 'speakerB', speakerName: '老师', chinese: '二零五教室就在右边。', pinyin: 'Èr líng wǔ jiàoshì jiù zài yòubiān.', english: 'Classroom 205 is right there on the right.' },
    ],
    focusWords: [
      { chinese: '二楼', pinyin: 'èr lóu', english: 'second floor' },
      { chinese: '往左走', pinyin: 'wǎng zuǒ zǒu', english: 'go left' },
      { chinese: '右边', pinyin: 'yòubiān', english: 'right side' },
    ],
    questions: [
      { type: 'gist', prompt: 'What does the student need?', options: ['Directions to a classroom', 'A new textbook', 'A bus ticket', 'Lunch'], answer: 'Directions to a classroom', explanation: 'The student asks 教室在哪里.' },
      { type: 'detail', prompt: '教室在几楼？', options: ['一楼', '二楼', '三楼', '五楼'], answer: '二楼', explanation: 'The teacher says 在二楼.', replaySegmentIndex: 1 },
      { type: 'dictation', prompt: 'Type the classroom number in Chinese digits.', options: [], answer: '二零五', explanation: 'The final line identifies room 205.', replaySegmentIndex: 2 },
    ],
    isPublished: true,
  }),
  lesson({
    slug: 'bus-stop-change', title: 'A Bus Stop Change', titleCn: '公交站变了', pinyin: 'gōngjiāo zhàn biàn le',
    description: 'Understand a short transit announcement about a temporary stop change.', category: 'travel', level: 'elementary', hskLevel: 2,
    icon: 'directions_bus', color: '#06B6D4', isPremium: false, estimatedMinutes: 6, xpReward: 22, order: 4,
    preListenTip: 'Announcements repeat key information. Catch the bus number, old stop and new stop.',
    segments: [
      { speaker: 'narrator', speakerName: '广播', chinese: '各位乘客请注意，十八路公交车临时改变路线。', pinyin: 'Gèwèi chéngkè qǐng zhùyì, shíbā lù gōngjiāo chē línshí gǎibiàn lùxiàn.', english: 'Passengers, please note: bus 18 is temporarily changing its route.' },
      { speaker: 'narrator', speakerName: '广播', chinese: '今天不停人民路站，请在公园东门下车。', pinyin: 'Jīntiān bù tíng Rénmín Lù zhàn, qǐng zài Gōngyuán Dōngmén xià chē.', english: 'Today it will not stop at Renmin Road; please get off at the park east gate.' },
      { speaker: 'narrator', speakerName: '广播', chinese: '给您带来不便，非常抱歉。', pinyin: 'Gěi nín dàilái búbiàn, fēicháng bàoqiàn.', english: 'We apologize for the inconvenience.' },
    ],
    focusWords: [
      { chinese: '临时', pinyin: 'línshí', english: 'temporary' },
      { chinese: '改变路线', pinyin: 'gǎibiàn lùxiàn', english: 'change route' },
      { chinese: '下车', pinyin: 'xià chē', english: 'get off' },
    ],
    questions: [
      { type: 'gist', prompt: 'What is the announcement about?', options: ['A route change', 'A late flight', 'A lost phone', 'A ticket sale'], answer: 'A route change', explanation: 'Bus 18 temporarily changes its route.' },
      { type: 'detail', prompt: '乘客应该在哪儿下车？', options: ['人民路站', '火车站', '公园东门', '学校门口'], answer: '公园东门', explanation: 'The announcement says 请在公园东门下车.', replaySegmentIndex: 1 },
      { type: 'dictation', prompt: 'Type the bus number in Chinese.', options: [], answer: '十八路', explanation: 'The first line identifies 十八路公交车.', replaySegmentIndex: 0 },
    ],
    isPublished: true,
  }),
  lesson({
    slug: 'ordering-lunch', title: 'Ordering Lunch', titleCn: '午饭点餐', pinyin: 'wǔfàn diǎncān',
    description: 'Hear a complete restaurant order with a preference, drink and total price.', category: 'food', level: 'elementary', hskLevel: 2,
    icon: 'restaurant', color: '#F97316', isPremium: false, estimatedMinutes: 6, xpReward: 22, order: 5,
    preListenTip: 'Build a mental order: main dish, special request, drink, total.',
    segments: [
      { speaker: 'speakerA', speakerName: '服务员', chinese: '您好，请问想吃点什么？', pinyin: 'Nín hǎo, qǐngwèn xiǎng chī diǎn shénme?', english: 'Hello, what would you like to eat?' },
      { speaker: 'speakerB', speakerName: '顾客', chinese: '我要一碗牛肉面，不要辣，再来一杯热茶。', pinyin: 'Wǒ yào yì wǎn niúròu miàn, bú yào là, zài lái yì bēi rè chá.', english: 'I would like a bowl of beef noodles, not spicy, and a cup of hot tea.' },
      { speaker: 'speakerA', speakerName: '服务员', chinese: '好的，一共三十八块钱。', pinyin: 'Hǎo de, yígòng sānshíbā kuài qián.', english: 'Okay, the total is thirty-eight yuan.' },
    ],
    focusWords: [
      { chinese: '一碗', pinyin: 'yì wǎn', english: 'a bowl of' },
      { chinese: '不要辣', pinyin: 'bú yào là', english: 'not spicy' },
      { chinese: '一共', pinyin: 'yígòng', english: 'in total' },
    ],
    questions: [
      { type: 'gist', prompt: 'What is the customer doing?', options: ['Ordering lunch', 'Booking a hotel', 'Returning clothes', 'Calling a doctor'], answer: 'Ordering lunch', explanation: 'The exchange is a restaurant order.' },
      { type: 'detail', prompt: '顾客的面要辣吗？', options: ['要很辣', '要一点辣', '不要辣', '没有说'], answer: '不要辣', explanation: 'The customer clearly says 不要辣.', replaySegmentIndex: 1 },
      { type: 'dictation', prompt: 'Type the total price in Chinese.', options: [], answer: '三十八块钱', explanation: 'The server gives the total as 三十八块钱.', replaySegmentIndex: 2 },
    ],
    isPublished: true,
  }),
  lesson({
    slug: 'weekend-photo-plan', title: 'A Weekend Photo Plan', titleCn: '周末拍照计划', pinyin: 'zhōumò pāizhào jìhuà',
    description: 'Follow friends choosing a day, meeting point and backup plan for bad weather.', category: 'social', level: 'elementary', hskLevel: 2,
    icon: 'photo_camera', color: '#A855F7', isPremium: false, estimatedMinutes: 6, xpReward: 22, order: 6,
    preListenTip: 'Listen for when, where and what happens if it rains.',
    segments: [
      { speaker: 'speakerA', speakerName: '小雨', chinese: '周六我们去湖边拍照，好吗？', pinyin: 'Zhōuliù wǒmen qù húbiān pāizhào, hǎo ma?', english: 'Shall we take photos by the lake on Saturday?' },
      { speaker: 'speakerB', speakerName: '大卫', chinese: '好啊！上午九点在地铁站见。', pinyin: 'Hǎo a! Shàngwǔ jiǔ diǎn zài dìtiě zhàn jiàn.', english: 'Sure! Let us meet at the subway station at nine in the morning.' },
      { speaker: 'speakerA', speakerName: '小雨', chinese: '如果下雨，我们就去美术馆。', pinyin: 'Rúguǒ xiàyǔ, wǒmen jiù qù měishùguǎn.', english: 'If it rains, we will go to the art museum.' },
    ],
    focusWords: [
      { chinese: '湖边', pinyin: 'húbiān', english: 'lakeside' },
      { chinese: '地铁站', pinyin: 'dìtiě zhàn', english: 'subway station' },
      { chinese: '如果……就……', pinyin: 'rúguǒ…jiù…', english: 'if…then…' },
    ],
    questions: [
      { type: 'gist', prompt: 'What are the friends planning?', options: ['A photo outing', 'An exam', 'A business meeting', 'A meal at home'], answer: 'A photo outing', explanation: 'They plan to take photos by the lake.' },
      { type: 'detail', prompt: '他们在哪儿见面？', options: ['湖边', '地铁站', '美术馆', '学校'], answer: '地铁站', explanation: 'David says 在地铁站见.', replaySegmentIndex: 1 },
      { type: 'dictation', prompt: 'Type their rainy-day destination.', options: [], answer: '美术馆', explanation: 'If it rains, they will go to the art museum.', replaySegmentIndex: 2 },
    ],
    isPublished: true,
  }),
  lesson({
    slug: 'changing-a-doctor-appointment', title: 'Changing an Appointment', titleCn: '改看病时间', pinyin: 'gǎi kànbìng shíjiān',
    description: 'Understand a phone call that changes a medical appointment and confirms details.', category: 'health', level: 'intermediate', hskLevel: 3,
    icon: 'medical_services', color: '#EF4444', isPremium: true, estimatedMinutes: 7, xpReward: 25, order: 7,
    preListenTip: 'Write down the original problem, the new day and the new time.',
    segments: [
      { speaker: 'speakerA', speakerName: '病人', chinese: '您好，我明天下午要出差，不能来看医生。', pinyin: 'Nín hǎo, wǒ míngtiān xiàwǔ yào chūchāi, bù néng lái kàn yīshēng.', english: 'Hello, I have a business trip tomorrow afternoon and cannot see the doctor.' },
      { speaker: 'speakerB', speakerName: '护士', chinese: '没问题。星期五上午十点还有时间。', pinyin: 'Méi wèntí. Xīngqīwǔ shàngwǔ shí diǎn hái yǒu shíjiān.', english: 'No problem. There is still an opening at ten Friday morning.' },
      { speaker: 'speakerA', speakerName: '病人', chinese: '可以，请帮我改到星期五。', pinyin: 'Kěyǐ, qǐng bāng wǒ gǎi dào xīngqīwǔ.', english: 'That works. Please change it to Friday.' },
    ],
    focusWords: [
      { chinese: '出差', pinyin: 'chūchāi', english: 'go on a business trip' },
      { chinese: '还有时间', pinyin: 'hái yǒu shíjiān', english: 'still have an opening' },
      { chinese: '改到', pinyin: 'gǎi dào', english: 'change to' },
    ],
    questions: [
      { type: 'gist', prompt: 'Why does the patient call?', options: ['To change an appointment', 'To ask for medicine', 'To report an emergency', 'To pay a bill'], answer: 'To change an appointment', explanation: 'A business trip conflicts with the original appointment.' },
      { type: 'detail', prompt: '新的时间是什么时候？', options: ['周四下午十点', '周五上午十点', '周五下午两点', '周六上午'], answer: '周五上午十点', explanation: 'The nurse offers Friday at 10 a.m.', replaySegmentIndex: 1 },
      { type: 'dictation', prompt: 'Type the reason the patient cannot come.', options: [], answer: '出差', explanation: 'The patient says 要出差.', replaySegmentIndex: 0 },
    ],
    isPublished: true,
  }),
  lesson({
    slug: 'missed-the-fast-train', title: 'The Missed Train', titleCn: '没赶上高铁', pinyin: 'méi gǎnshàng gāotiě',
    description: 'Follow a station conversation about a missed train, ticket change and platform.', category: 'travel', level: 'intermediate', hskLevel: 3,
    icon: 'train', color: '#0EA5E9', isPremium: true, estimatedMinutes: 7, xpReward: 25, order: 8,
    preListenTip: 'Listen for the cause, the replacement departure time and platform number.',
    segments: [
      { speaker: 'speakerA', speakerName: '乘客', chinese: '路上堵车，我没赶上九点的高铁。', pinyin: 'Lùshang dǔchē, wǒ méi gǎnshàng jiǔ diǎn de gāotiě.', english: 'Traffic was jammed, so I missed the nine o’clock high-speed train.' },
      { speaker: 'speakerB', speakerName: '工作人员', chinese: '我可以帮您改签十点二十的车。', pinyin: 'Wǒ kěyǐ bāng nín gǎiqiān shí diǎn èrshí de chē.', english: 'I can change your ticket to the 10:20 train.' },
      { speaker: 'speakerB', speakerName: '工作人员', chinese: '请拿好新车票，十五分钟后到六号站台。', pinyin: 'Qǐng ná hǎo xīn chēpiào, shíwǔ fēnzhōng hòu dào liù hào zhàntái.', english: 'Please take your new ticket and go to platform six in fifteen minutes.' },
    ],
    focusWords: [
      { chinese: '堵车', pinyin: 'dǔchē', english: 'traffic jam' },
      { chinese: '赶上', pinyin: 'gǎnshàng', english: 'catch; make it in time' },
      { chinese: '改签', pinyin: 'gǎiqiān', english: 'change a ticket' },
    ],
    questions: [
      { type: 'gist', prompt: 'What solution does the staff offer?', options: ['Change the ticket', 'Refund a hotel', 'Call a taxi', 'Cancel all trains'], answer: 'Change the ticket', explanation: 'The staff offers to 改签 the ticket.' },
      { type: 'detail', prompt: '新车几点开？', options: ['九点', '十点', '十点二十', '十点五十'], answer: '十点二十', explanation: 'The replacement train leaves at 10:20.', replaySegmentIndex: 1 },
      { type: 'dictation', prompt: 'Type the platform number in Chinese.', options: [], answer: '六号站台', explanation: 'The passenger must go to platform six.', replaySegmentIndex: 2 },
    ],
    isPublished: true,
  }),
  lesson({
    slug: 'apartment-water-repair', title: 'A Water Repair', titleCn: '公寓水管维修', pinyin: 'gōngyù shuǐguǎn wéixiū',
    description: 'Understand a tenant reporting a leak and arranging a repair visit.', category: 'home', level: 'intermediate', hskLevel: 3,
    icon: 'plumbing', color: '#14B8A6', isPremium: true, estimatedMinutes: 7, xpReward: 25, order: 9,
    preListenTip: 'Identify the broken item, the affected room and when help will arrive.',
    segments: [
      { speaker: 'speakerA', speakerName: '住户', chinese: '您好，厨房的水管一直漏水，地上都湿了。', pinyin: 'Nín hǎo, chúfáng de shuǐguǎn yìzhí lòushuǐ, dìshang dōu shī le.', english: 'Hello, the kitchen pipe keeps leaking and the floor is all wet.' },
      { speaker: 'speakerB', speakerName: '物业', chinese: '请先关掉水。维修师傅下午三点以前会到。', pinyin: 'Qǐng xiān guān diào shuǐ. Wéixiū shīfu xiàwǔ sān diǎn yǐqián huì dào.', english: 'Please turn off the water first. The repair worker will arrive before 3 p.m.' },
      { speaker: 'speakerA', speakerName: '住户', chinese: '好的，我会在家等他，谢谢。', pinyin: 'Hǎo de, wǒ huì zài jiā děng tā, xièxie.', english: 'Okay, I will wait for him at home. Thank you.' },
    ],
    focusWords: [
      { chinese: '水管', pinyin: 'shuǐguǎn', english: 'water pipe' },
      { chinese: '漏水', pinyin: 'lòushuǐ', english: 'leak water' },
      { chinese: '维修师傅', pinyin: 'wéixiū shīfu', english: 'repair worker' },
    ],
    questions: [
      { type: 'gist', prompt: 'What problem is being reported?', options: ['A leaking pipe', 'A broken window', 'No electricity', 'A noisy neighbor'], answer: 'A leaking pipe', explanation: 'The kitchen pipe keeps leaking.' },
      { type: 'detail', prompt: '维修师傅什么时候到？', options: ['中午以前', '下午三点以前', '晚上七点', '明天早上'], answer: '下午三点以前', explanation: 'The property manager says 下午三点以前会到.', replaySegmentIndex: 1 },
      { type: 'dictation', prompt: 'Type the room with the problem.', options: [], answer: '厨房', explanation: 'The leak is in the kitchen.', replaySegmentIndex: 0 },
    ],
    isPublished: true,
  }),
  lesson({
    slug: 'weekly-project-update', title: 'Weekly Project Update', titleCn: '每周项目汇报', pinyin: 'měi zhōu xiàngmù huìbào',
    description: 'Track completed work, a delay and the next deadline in a concise team update.', category: 'work', level: 'intermediate', hskLevel: 4,
    icon: 'work', color: '#6366F1', isPremium: true, estimatedMinutes: 8, xpReward: 28, order: 10,
    preListenTip: 'Organize the report into three boxes: done, blocked, next.',
    segments: [
      { speaker: 'speakerA', speakerName: '项目经理', chinese: '本周我们完成了用户调查，也整理了主要需求。', pinyin: 'Běn zhōu wǒmen wánchéng le yònghù diàochá, yě zhěnglǐ le zhǔyào xūqiú.', english: 'This week we completed user research and organized the main requirements.' },
      { speaker: 'speakerA', speakerName: '项目经理', chinese: '但是设计稿晚了两天，开发工作还不能开始。', pinyin: 'Dànshì shèjì gǎo wǎn le liǎng tiān, kāifā gōngzuò hái bù néng kāishǐ.', english: 'But the design draft is two days late, so development still cannot begin.' },
      { speaker: 'speakerA', speakerName: '项目经理', chinese: '我们计划星期三确认设计，星期五完成第一版。', pinyin: 'Wǒmen jìhuà xīngqīsān quèrèn shèjì, xīngqīwǔ wánchéng dì yī bǎn.', english: 'We plan to confirm the design Wednesday and finish the first version Friday.' },
    ],
    focusWords: [
      { chinese: '用户调查', pinyin: 'yònghù diàochá', english: 'user research' },
      { chinese: '设计稿', pinyin: 'shèjì gǎo', english: 'design draft' },
      { chinese: '第一版', pinyin: 'dì yī bǎn', english: 'first version' },
    ],
    questions: [
      { type: 'gist', prompt: 'What is the main purpose of the audio?', options: ['A project status update', 'A job offer', 'A product advertisement', 'A travel warning'], answer: 'A project status update', explanation: 'It reports progress, a delay and next deadlines.' },
      { type: 'detail', prompt: '为什么开发还不能开始？', options: ['没有用户', '设计稿晚了', '经理出差', '预算太高'], answer: '设计稿晚了', explanation: 'Development is blocked because the design draft is late.', replaySegmentIndex: 1 },
      { type: 'dictation', prompt: 'Type the day the first version should be finished.', options: [], answer: '星期五', explanation: 'The final deadline is Friday.', replaySegmentIndex: 2 },
    ],
    isPublished: true,
  }),
  lesson({
    slug: 'museum-audio-guide', title: 'Museum Audio Guide', titleCn: '博物馆语音导览', pinyin: 'bówùguǎn yǔyīn dǎolǎn',
    description: 'Follow an exhibit introduction linking an object, its history and daily use.', category: 'culture', level: 'intermediate', hskLevel: 4,
    icon: 'museum', color: '#D97706', isPremium: true, estimatedMinutes: 8, xpReward: 28, order: 11,
    preListenTip: 'Listen for what the object is, how old it is and why it mattered.',
    segments: [
      { speaker: 'narrator', speakerName: '导览', chinese: '您面前的青铜灯来自两千多年前。', pinyin: 'Nín miànqián de qīngtóng dēng láizì liǎng qiān duō nián qián.', english: 'The bronze lamp before you dates from more than two thousand years ago.' },
      { speaker: 'narrator', speakerName: '导览', chinese: '它不但可以照明，还能减少房间里的烟。', pinyin: 'Tā búdàn kěyǐ zhàomíng, hái néng jiǎnshǎo fángjiān lǐ de yān.', english: 'It could not only provide light but also reduce smoke in the room.' },
      { speaker: 'narrator', speakerName: '导览', chinese: '这个设计说明古人已经很重视生活环境。', pinyin: 'Zhège shèjì shuōmíng gǔrén yǐjīng hěn zhòngshì shēnghuó huánjìng.', english: 'The design shows that ancient people already cared greatly about their living environment.' },
    ],
    focusWords: [
      { chinese: '青铜', pinyin: 'qīngtóng', english: 'bronze' },
      { chinese: '照明', pinyin: 'zhàomíng', english: 'provide lighting' },
      { chinese: '重视', pinyin: 'zhòngshì', english: 'attach importance to' },
    ],
    questions: [
      { type: 'gist', prompt: 'What exhibit is described?', options: ['An ancient bronze lamp', 'A modern painting', 'A silk coat', 'A stone bridge'], answer: 'An ancient bronze lamp', explanation: 'The guide introduces a 青铜灯.' },
      { type: 'detail', prompt: '这盏灯除了照明，还能做什么？', options: ['发出音乐', '减少烟', '保存食物', '测量时间'], answer: '减少烟', explanation: 'The second line says it can reduce smoke.', replaySegmentIndex: 1 },
      { type: 'dictation', prompt: 'Type the phrase meaning “more than two thousand years ago”.', options: [], answer: '两千多年前', explanation: 'That phrase gives the lamp’s age.', replaySegmentIndex: 0 },
    ],
    isPublished: true,
  }),
  lesson({
    slug: 'summer-storm-warning', title: 'Summer Storm Warning', titleCn: '夏季暴雨提醒', pinyin: 'xiàjì bàoyǔ tíxǐng',
    description: 'Extract timing, affected areas and safety advice from a public weather bulletin.', category: 'news', level: 'intermediate', hskLevel: 4,
    icon: 'thunderstorm', color: '#64748B', isPremium: true, estimatedMinutes: 8, xpReward: 28, order: 12,
    preListenTip: 'Public warnings front-load facts. Catch when, where and the recommended action.',
    segments: [
      { speaker: 'narrator', speakerName: '天气预报', chinese: '受台风影响，今晚八点以后本市将出现暴雨。', pinyin: 'Shòu táifēng yǐngxiǎng, jīnwǎn bā diǎn yǐhòu běn shì jiāng chūxiàn bàoyǔ.', english: 'Due to the typhoon, heavy rain will hit the city after 8 p.m. tonight.' },
      { speaker: 'narrator', speakerName: '天气预报', chinese: '南部山区可能发生洪水，部分道路会临时关闭。', pinyin: 'Nánbù shānqū kěnéng fāshēng hóngshuǐ, bùfen dàolù huì línshí guānbì.', english: 'Flooding may occur in the southern mountains and some roads will temporarily close.' },
      { speaker: 'narrator', speakerName: '天气预报', chinese: '请市民减少外出，并及时关注交通信息。', pinyin: 'Qǐng shìmín jiǎnshǎo wàichū, bìng jíshí guānzhù jiāotōng xìnxī.', english: 'Residents should avoid going out and follow transport updates.' },
    ],
    focusWords: [
      { chinese: '受……影响', pinyin: 'shòu…yǐngxiǎng', english: 'be affected by' },
      { chinese: '洪水', pinyin: 'hóngshuǐ', english: 'flood' },
      { chinese: '减少外出', pinyin: 'jiǎnshǎo wàichū', english: 'go out less' },
    ],
    questions: [
      { type: 'gist', prompt: 'What should listeners prepare for?', options: ['Heavy rain and disruption', 'A heat wave', 'An earthquake drill', 'Snow'], answer: 'Heavy rain and disruption', explanation: 'The bulletin warns of heavy rain, floods and road closures.' },
      { type: 'detail', prompt: '哪个地区可能发生洪水？', options: ['市中心', '北部海边', '南部山区', '机场附近'], answer: '南部山区', explanation: 'Flood risk is highest in the southern mountains.', replaySegmentIndex: 1 },
      { type: 'dictation', prompt: 'Type the time after which heavy rain is expected.', options: [], answer: '今晚八点以后', explanation: 'The first line gives 今晚八点以后.', replaySegmentIndex: 0 },
    ],
    isPublished: true,
  }),
  lesson({
    slug: 'interview-product-role', title: 'Interview for a Product Role', titleCn: '产品岗位面试', pinyin: 'chǎnpǐn gǎngwèi miànshì',
    description: 'Follow a candidate explaining experience, a difficult decision and measurable impact.', category: 'work', level: 'advanced', hskLevel: 5,
    icon: 'badge', color: '#7C3AED', isPremium: true, estimatedMinutes: 9, xpReward: 30, order: 13,
    preListenTip: 'Track the answer structure: background, action, result.',
    segments: [
      { speaker: 'speakerA', speakerName: '面试官', chinese: '请介绍一个你负责过的复杂项目。', pinyin: 'Qǐng jièshào yí ge nǐ fùzé guo de fùzá xiàngmù.', english: 'Please describe a complex project you were responsible for.' },
      { speaker: 'speakerB', speakerName: '候选人', chinese: '我曾负责改进支付流程，最大的挑战是协调技术和客服团队。', pinyin: 'Wǒ céng fùzé gǎijìn zhīfù liúchéng, zuì dà de tiǎozhàn shì xiétiáo jìshù hé kèfú tuánduì.', english: 'I led an improvement to the payment flow; the biggest challenge was coordinating engineering and support.' },
      { speaker: 'speakerB', speakerName: '候选人', chinese: '上线以后，支付失败率下降了百分之三十，投诉也明显减少。', pinyin: 'Shàngxiàn yǐhòu, zhīfù shībài lǜ xiàjiàng le bǎifēnzhī sānshí, tóusù yě míngxiǎn jiǎnshǎo.', english: 'After launch, payment failures fell by thirty percent and complaints clearly decreased.' },
    ],
    focusWords: [
      { chinese: '协调', pinyin: 'xiétiáo', english: 'coordinate' },
      { chinese: '失败率', pinyin: 'shībài lǜ', english: 'failure rate' },
      { chinese: '明显减少', pinyin: 'míngxiǎn jiǎnshǎo', english: 'decrease noticeably' },
    ],
    questions: [
      { type: 'gist', prompt: 'What achievement does the candidate describe?', options: ['Improving a payment flow', 'Opening a restaurant', 'Teaching a class', 'Building a bridge'], answer: 'Improving a payment flow', explanation: 'The example centers on improving payments.' },
      { type: 'detail', prompt: '最大的挑战是什么？', options: ['预算不足', '协调两个团队', '没有用户', '设计新办公室'], answer: '协调两个团队', explanation: 'The candidate coordinated engineering and support.', replaySegmentIndex: 1 },
      { type: 'dictation', prompt: 'Type the improvement percentage in Chinese.', options: [], answer: '百分之三十', explanation: 'Payment failures fell by thirty percent.', replaySegmentIndex: 2 },
    ],
    isPublished: true,
  }),
  lesson({
    slug: 'city-recycling-news', title: 'City Recycling News', titleCn: '城市垃圾分类新规', pinyin: 'chéngshì lājī fēnlèi xīnguī',
    description: 'Understand a news report presenting a new policy, early results and public concerns.', category: 'news', level: 'advanced', hskLevel: 5,
    icon: 'recycling', color: '#16A34A', isPremium: true, estimatedMinutes: 9, xpReward: 30, order: 14,
    preListenTip: 'Separate the report into policy, evidence and criticism.',
    segments: [
      { speaker: 'narrator', speakerName: '记者', chinese: '本月起，全市餐馆必须把厨余垃圾和其他垃圾分开处理。', pinyin: 'Běn yuè qǐ, quán shì cānguǎn bìxū bǎ chúyú lājī hé qítā lājī fēnkāi chǔlǐ.', english: 'Starting this month, all city restaurants must separate food waste from other rubbish.' },
      { speaker: 'narrator', speakerName: '记者', chinese: '试点地区的回收量已经增加近一倍，但执行成本也有所上升。', pinyin: 'Shìdiǎn dìqū de huíshōu liàng yǐjīng zēngjiā jìn yí bèi, dàn zhíxíng chéngběn yě yǒusuǒ shàngshēng.', english: 'Recycling in pilot areas has nearly doubled, but implementation costs have also risen.' },
      { speaker: 'narrator', speakerName: '记者', chinese: '有关部门表示，将为小餐馆提供培训和设备补贴。', pinyin: 'Yǒuguān bùmén biǎoshì, jiāng wèi xiǎo cānguǎn tígōng péixùn hé shèbèi bǔtiē.', english: 'Authorities say they will provide small restaurants with training and equipment subsidies.' },
    ],
    focusWords: [
      { chinese: '厨余垃圾', pinyin: 'chúyú lājī', english: 'food waste' },
      { chinese: '试点地区', pinyin: 'shìdiǎn dìqū', english: 'pilot area' },
      { chinese: '设备补贴', pinyin: 'shèbèi bǔtiē', english: 'equipment subsidy' },
    ],
    questions: [
      { type: 'gist', prompt: 'What does the report evaluate?', options: ['A new waste-sorting rule', 'A railway project', 'School exams', 'A music festival'], answer: 'A new waste-sorting rule', explanation: 'It covers restaurant waste separation and its effects.' },
      { type: 'detail', prompt: '试点地区出现了什么结果？', options: ['回收量减少', '回收量接近翻倍', '成本下降为零', '餐馆全部关闭'], answer: '回收量接近翻倍', explanation: 'Recycling volume increased by nearly onefold.', replaySegmentIndex: 1 },
      { type: 'dictation', prompt: 'Type one support measure offered to small restaurants.', options: [], answer: '设备补贴', explanation: 'Authorities will provide training and equipment subsidies.', replaySegmentIndex: 2 },
    ],
    isPublished: true,
  }),
  lesson({
    slug: 'sleep-habits-podcast', title: 'Sleep Habits Podcast', titleCn: '睡眠习惯访谈', pinyin: 'shuìmián xíguàn fǎngtán',
    description: 'Follow an expert distinguishing sleep duration from sleep quality and giving practical advice.', category: 'health', level: 'advanced', hskLevel: 5,
    icon: 'bedtime', color: '#4F46E5', isPremium: true, estimatedMinutes: 9, xpReward: 30, order: 15,
    preListenTip: 'Listen for the misconception, the evidence and two recommendations.',
    segments: [
      { speaker: 'speakerA', speakerName: '主持人', chinese: '很多人认为睡够八小时就一定精神好，这种说法准确吗？', pinyin: 'Hěn duō rén rènwéi shuì gòu bā xiǎoshí jiù yídìng jīngshen hǎo, zhè zhǒng shuōfǎ zhǔnquè ma?', english: 'Many people think eight hours always guarantees energy. Is that accurate?' },
      { speaker: 'speakerB', speakerName: '专家', chinese: '时间很重要，但规律和质量同样关键，个人需要也不完全一样。', pinyin: 'Shíjiān hěn zhòngyào, dàn guīlǜ hé zhìliàng tóngyàng guānjiàn, gèrén xūyào yě bù wánquán yíyàng.', english: 'Duration matters, but regularity and quality are equally important, and individual needs differ.' },
      { speaker: 'speakerB', speakerName: '专家', chinese: '建议固定起床时间，睡前一小时尽量少看手机。', pinyin: 'Jiànyì gùdìng qǐchuáng shíjiān, shuìqián yì xiǎoshí jǐnliàng shǎo kàn shǒujī.', english: 'Keep a fixed wake-up time and reduce phone use during the hour before bed.' },
    ],
    focusWords: [
      { chinese: '规律', pinyin: 'guīlǜ', english: 'regular pattern' },
      { chinese: '同样关键', pinyin: 'tóngyàng guānjiàn', english: 'equally crucial' },
      { chinese: '尽量', pinyin: 'jǐnliàng', english: 'as much as possible' },
    ],
    questions: [
      { type: 'gist', prompt: 'What main idea does the expert emphasize?', options: ['Sleep quality and regularity also matter', 'Everyone needs exactly eight hours', 'Phones improve sleep', 'Wake-up time is irrelevant'], answer: 'Sleep quality and regularity also matter', explanation: 'The expert rejects a duration-only view.' },
      { type: 'detail', prompt: '专家建议固定什么？', options: ['吃饭时间', '运动地点', '起床时间', '工作内容'], answer: '起床时间', explanation: 'The advice is to fix the wake-up time.', replaySegmentIndex: 2 },
      { type: 'dictation', prompt: 'Type the phrase meaning “individual needs”.', options: [], answer: '个人需要', explanation: 'The expert notes that personal needs differ.', replaySegmentIndex: 1 },
    ],
    isPublished: true,
  }),
  lesson({
    slug: 'ai-in-education-lecture', title: 'AI in Education Lecture', titleCn: '人工智能与教育', pinyin: 'réngōng zhìnéng yǔ jiàoyù',
    description: 'Understand a balanced lecture argument about personalization, teacher judgment and data ethics.', category: 'education', level: 'advanced', hskLevel: 6,
    icon: 'psychology', color: '#8B5CF6', isPremium: true, estimatedMinutes: 10, xpReward: 35, order: 16,
    preListenTip: 'Map the lecture as opportunity, limitation and condition for responsible use.',
    segments: [
      { speaker: 'narrator', speakerName: '讲者', chinese: '人工智能能够根据学习记录提供个性化练习，这是传统课堂难以大规模实现的。', pinyin: 'Réngōng zhìnéng nénggòu gēnjù xuéxí jìlù tígōng gèxìnghuà liànxí, zhè shì chuántǒng kètáng nányǐ dà guīmó shíxiàn de.', english: 'AI can provide personalized practice from learning records, something traditional classrooms struggle to scale.' },
      { speaker: 'narrator', speakerName: '讲者', chinese: '然而，算法无法完全理解学生的情绪，也不能取代教师的专业判断。', pinyin: 'Rán ér, suànfǎ wúfǎ wánquán lǐjiě xuésheng de qíngxù, yě bù néng qǔdài jiàoshī de zhuānyè pànduàn.', english: 'However, algorithms cannot fully understand student emotions or replace teachers’ professional judgment.' },
      { speaker: 'narrator', speakerName: '讲者', chinese: '只有明确保护数据、公开使用原则，技术才能真正服务于教育公平。', pinyin: 'Zhǐyǒu míngquè bǎohù shùjù, gōngkāi shǐyòng yuánzé, jìshù cái néng zhēnzhèng fúwù yú jiàoyù gōngpíng.', english: 'Only with clear data protection and transparent rules can technology truly serve educational equity.' },
    ],
    focusWords: [
      { chinese: '个性化', pinyin: 'gèxìnghuà', english: 'personalized' },
      { chinese: '专业判断', pinyin: 'zhuānyè pànduàn', english: 'professional judgment' },
      { chinese: '教育公平', pinyin: 'jiàoyù gōngpíng', english: 'educational equity' },
    ],
    questions: [
      { type: 'gist', prompt: 'What position does the speaker take?', options: ['AI is useful with human and ethical safeguards', 'AI should replace every teacher', 'AI has no educational value', 'Data rules are unnecessary'], answer: 'AI is useful with human and ethical safeguards', explanation: 'The lecture balances benefits with human judgment and data protection.' },
      { type: 'detail', prompt: '算法不能完全理解什么？', options: ['考试成绩', '学生情绪', '课程时间', '学校预算'], answer: '学生情绪', explanation: 'The second segment names student emotions.', replaySegmentIndex: 1 },
      { type: 'dictation', prompt: 'Type the final social goal mentioned by the speaker.', options: [], answer: '教育公平', explanation: 'Responsible technology should serve educational equity.', replaySegmentIndex: 2 },
    ],
    isPublished: true,
  }),
  lesson({
    slug: 'remote-work-debate', title: 'Remote Work Debate', titleCn: '远程办公讨论', pinyin: 'yuǎnchéng bàngōng tǎolùn',
    description: 'Follow two nuanced positions on flexibility, collaboration and how performance should be measured.', category: 'work', level: 'advanced', hskLevel: 6,
    icon: 'laptop', color: '#2563EB', isPremium: true, estimatedMinutes: 10, xpReward: 35, order: 17,
    preListenTip: 'Identify each speaker’s claim, supporting reason and proposed compromise.',
    segments: [
      { speaker: 'speakerA', speakerName: '陈经理', chinese: '远程办公提高了时间安排的灵活性，也让公司能招聘不同城市的人才。', pinyin: 'Yuǎnchéng bàngōng tígāo le shíjiān ānpái de línghuóxìng, yě ràng gōngsī néng zhāopìn bùtóng chéngshì de réncái.', english: 'Remote work improves scheduling flexibility and lets companies recruit talent from different cities.' },
      { speaker: 'speakerB', speakerName: '周主管', chinese: '但长期缺少面对面交流，可能削弱团队信任，也不利于新人学习。', pinyin: 'Dàn chángqī quēshǎo miànduìmiàn jiāoliú, kěnéng xuēruò tuánduì xìnrèn, yě bù lìyú xīnrén xuéxí.', english: 'But prolonged lack of face-to-face contact may weaken trust and make learning harder for newcomers.' },
      { speaker: 'speakerA', speakerName: '陈经理', chinese: '与其规定每天在哪里工作，不如根据任务特点安排线上或线下合作。', pinyin: 'Yǔqí guīdìng měitiān zài nǎlǐ gōngzuò, bùrú gēnjù rènwu tèdiǎn ānpái xiànshàng huò xiànxià hézuò.', english: 'Rather than mandate a daily location, choose online or in-person collaboration based on the task.' },
    ],
    focusWords: [
      { chinese: '灵活性', pinyin: 'línghuóxìng', english: 'flexibility' },
      { chinese: '削弱信任', pinyin: 'xuēruò xìnrèn', english: 'weaken trust' },
      { chinese: '与其……不如……', pinyin: 'yǔqí…bùrú…', english: 'rather than…it is better to…' },
    ],
    questions: [
      { type: 'gist', prompt: 'What compromise is proposed?', options: ['Choose work mode by task needs', 'End remote work completely', 'Keep everyone remote forever', 'Measure only office hours'], answer: 'Choose work mode by task needs', explanation: 'The final proposal is task-based hybrid collaboration.' },
      { type: 'detail', prompt: '周主管担心远程办公会影响谁的学习？', options: ['客户', '新人', '经理', '学生'], answer: '新人', explanation: 'The concern specifically includes newcomers.', replaySegmentIndex: 1 },
      { type: 'dictation', prompt: 'Type the four-character phrase meaning face-to-face communication.', options: [], answer: '面对面交流', explanation: 'The second speaker discusses missing face-to-face communication.', replaySegmentIndex: 1 },
    ],
    isPublished: true,
  }),
  lesson({
    slug: 'tea-tradition-interview', title: 'Tea Tradition Interview', titleCn: '茶文化访谈', pinyin: 'chá wénhuà fǎngtán',
    description: 'Understand an interview explaining how a living tradition changes without losing its core values.', category: 'culture', level: 'advanced', hskLevel: 6,
    icon: 'emoji_food_beverage', color: '#B45309', isPremium: true, estimatedMinutes: 10, xpReward: 35, order: 18,
    preListenTip: 'Listen for the old meaning, modern change and what should remain constant.',
    segments: [
      { speaker: 'speakerA', speakerName: '主持人', chinese: '过去喝茶不仅是解渴，也是一种待客和交流感情的方式。', pinyin: 'Guòqù hē chá bùjǐn shì jiěkě, yě shì yì zhǒng dàikè hé jiāoliú gǎnqíng de fāngshì.', english: 'Tea was not only for thirst; it was also a way to host guests and build relationships.' },
      { speaker: 'speakerB', speakerName: '研究者', chinese: '现代生活节奏加快，泡茶过程变简单了，但年轻人仍在创造新的茶饮文化。', pinyin: 'Xiàndài shēnghuó jiézòu jiākuài, pàochá guòchéng biàn jiǎndān le, dàn niánqīngrén réng zài chuàngzào xīn de cháyǐn wénhuà.', english: 'Modern life is faster and brewing is simpler, yet young people continue creating new tea culture.' },
      { speaker: 'speakerB', speakerName: '研究者', chinese: '传统要延续，关键不是形式完全不变，而是尊重自然、分享和耐心。', pinyin: 'Chuántǒng yào yánxù, guānjiàn bú shì xíngshì wánquán bú biàn, ér shì zūnzhòng zìrán, fēnxiǎng hé nàixīn.', english: 'For tradition to continue, forms need not stay unchanged; respect for nature, sharing and patience are key.' },
    ],
    focusWords: [
      { chinese: '待客', pinyin: 'dàikè', english: 'entertain guests' },
      { chinese: '生活节奏', pinyin: 'shēnghuó jiézòu', english: 'pace of life' },
      { chinese: '延续', pinyin: 'yánxù', english: 'continue; carry on' },
    ],
    questions: [
      { type: 'gist', prompt: 'What is the interview’s central message?', options: ['Tradition can adapt while keeping core values', 'Tea culture has disappeared', 'Only old brewing methods are valid', 'Young people dislike tea'], answer: 'Tradition can adapt while keeping core values', explanation: 'The speaker separates changing forms from lasting values.' },
      { type: 'detail', prompt: '年轻人在做什么？', options: ['拒绝喝茶', '创造新的茶饮文化', '停止分享', '恢复所有古代形式'], answer: '创造新的茶饮文化', explanation: 'The researcher says young people are creating new tea-drink culture.', replaySegmentIndex: 1 },
      { type: 'dictation', prompt: 'Type the three values named at the end.', options: [], answer: '尊重自然、分享和耐心', explanation: 'The final line names respect for nature, sharing and patience.', replaySegmentIndex: 2 },
    ],
    isPublished: true,
  }),
];

export const LISTENING_LESSON_STATS = {
  lessons: LISTENING_LESSON_SEEDS.length,
  segments: LISTENING_LESSON_SEEDS.reduce((sum, item) => sum + item.segments.length, 0),
  questions: LISTENING_LESSON_SEEDS.reduce((sum, item) => sum + item.questions.length, 0),
  freeLessons: LISTENING_LESSON_SEEDS.filter(item => !item.isPremium).length,
} as const;
