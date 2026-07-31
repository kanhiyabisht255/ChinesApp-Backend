type LocalizedText = { hi: string; es: string; ja: string };

type UtteranceSeed = {
  chinese: string;
  pinyin: string;
  english: string;
  localized: LocalizedText;
};

type ExchangeSeed = {
  prompt: UtteranceSeed;
  response: UtteranceSeed;
};

type CoursePack = {
  slug: string;
  title: string;
  titleCn: string;
  description: string;
  localizedTitle: LocalizedText;
  localizedDescription: LocalizedText;
  hskLevel: number;
  level: 'starter' | 'beginner' | 'intermediate' | 'advanced' | 'fluent';
  category: string;
  color: string;
  icon: string;
  isPremium: boolean;
  exchanges: ExchangeSeed[];
};

const L = (hi: string, es: string, ja: string): LocalizedText => ({ hi, es, ja });

const U = (
  chinese: string,
  pinyin: string,
  english: string,
  hi: string,
  es: string,
  ja: string
): UtteranceSeed => ({ chinese, pinyin, english, localized: L(hi, es, ja) });

const X = (prompt: UtteranceSeed, response: UtteranceSeed): ExchangeSeed => ({ prompt, response });

const translationsForFields = (title: LocalizedText, description: LocalizedText) => ({
  hi: { title: title.hi, description: description.hi },
  es: { title: title.es, description: description.es },
  ja: { title: title.ja, description: description.ja },
});

const COURSE_PACKS: CoursePack[] = [
  {
    slug: 'home-and-classroom',
    title: 'Home & Classroom Chinese',
    titleCn: '家庭和课堂中文',
    description: 'Name everyday objects and handle simple home and classroom exchanges.',
    localizedTitle: L('घर और कक्षा की चीनी', 'Chino en casa y en clase', '家と教室の中国語'),
    localizedDescription: L('घर और कक्षा की आम चीज़ों और बातचीत को सीखें।', 'Aprende objetos y conversaciones de casa y clase.', '家と教室の日常表現を学びます。'),
    hskLevel: 1,
    level: 'starter',
    category: 'foundations',
    color: '#14B8A6',
    icon: 'home_work',
    isPremium: false,
    exchanges: [
      X(
        U('这是我的房间。', 'Zhè shì wǒ de fángjiān.', 'This is my room.', 'यह मेरा कमरा है।', 'Esta es mi habitación.', 'これは私の部屋です。'),
        U('你的房间很漂亮。', 'Nǐ de fángjiān hěn piàoliang.', 'Your room is beautiful.', 'तुम्हारा कमरा बहुत सुंदर है।', 'Tu habitación es muy bonita.', 'あなたの部屋はとてもきれいです。')
      ),
      X(
        U('书在哪里？', 'Shū zài nǎlǐ?', 'Where is the book?', 'किताब कहाँ है?', '¿Dónde está el libro?', '本はどこですか。'),
        U('书在桌子上。', 'Shū zài zhuōzi shàng.', 'The book is on the table.', 'किताब मेज़ पर है।', 'El libro está sobre la mesa.', '本は机の上にあります。')
      ),
      X(
        U('请打开课本。', 'Qǐng dǎkāi kèběn.', 'Please open the textbook.', 'कृपया पाठ्यपुस्तक खोलें।', 'Abre el libro de texto, por favor.', '教科書を開いてください。'),
        U('好的，老师。', 'Hǎo de, lǎoshī.', 'Okay, teacher.', 'ठीक है, शिक्षक।', 'De acuerdo, profesor.', 'はい、先生。')
      ),
      X(
        U('我有两支笔。', 'Wǒ yǒu liǎng zhī bǐ.', 'I have two pens.', 'मेरे पास दो पेन हैं।', 'Tengo dos bolígrafos.', '私はペンを二本持っています。'),
        U('可以借我一支吗？', 'Kěyǐ jiè wǒ yì zhī ma?', 'May I borrow one?', 'क्या मैं एक उधार ले सकता/सकती हूँ?', '¿Me prestas uno?', '一本貸してもらえますか。')
      ),
    ],
  },
  {
    slug: 'core-actions-and-needs',
    title: 'Core Actions & Needs',
    titleCn: '基本动作和需要',
    description: 'Express wants, needs, abilities and requests with high-frequency phrases.',
    localizedTitle: L('ज़रूरी क्रियाएँ और जरूरतें', 'Acciones y necesidades básicas', '基本動作と必要表現'),
    localizedDescription: L('इच्छा, जरूरत, क्षमता और अनुरोध बताना सीखें।', 'Expresa deseos, necesidades, capacidades y peticiones.', '希望、必要、能力、依頼を表現します。'),
    hskLevel: 1,
    level: 'starter',
    category: 'speaking',
    color: '#22C55E',
    icon: 'directions_run',
    isPremium: false,
    exchanges: [
      X(
        U('我想喝水。', 'Wǒ xiǎng hē shuǐ.', 'I want to drink water.', 'मैं पानी पीना चाहता/चाहती हूँ।', 'Quiero beber agua.', '水を飲みたいです。'),
        U('给你。', 'Gěi nǐ.', 'Here you are.', 'ये लो।', 'Aquí tienes.', 'どうぞ。')
      ),
      X(
        U('我需要帮助。', 'Wǒ xūyào bāngzhù.', 'I need help.', 'मुझे मदद चाहिए।', 'Necesito ayuda.', '助けが必要です。'),
        U('我来帮你。', 'Wǒ lái bāng nǐ.', 'I will help you.', 'मैं आपकी मदद करता/करती हूँ।', 'Yo te ayudo.', '私が手伝います。')
      ),
      X(
        U('我会说一点儿中文。', 'Wǒ huì shuō yìdiǎnr Zhōngwén.', 'I can speak a little Chinese.', 'मैं थोड़ी चीनी बोल सकता/सकती हूँ।', 'Puedo hablar un poco de chino.', '中国語を少し話せます。'),
        U('你说得很好。', 'Nǐ shuō de hěn hǎo.', 'You speak very well.', 'आप बहुत अच्छा बोलते हैं।', 'Hablas muy bien.', 'とても上手に話しますね。')
      ),
      X(
        U('请说慢一点儿。', 'Qǐng shuō màn yìdiǎnr.', 'Please speak a little slower.', 'कृपया थोड़ा धीरे बोलें।', 'Habla un poco más despacio, por favor.', 'もう少しゆっくり話してください。'),
        U('好，我慢慢说。', 'Hǎo, wǒ mànmàn shuō.', 'Okay, I will speak slowly.', 'ठीक है, मैं धीरे बोलूँगा/बोलूँगी।', 'De acuerdo, hablaré despacio.', 'はい、ゆっくり話します。')
      ),
    ],
  },
  {
    slug: 'places-and-directions',
    title: 'Places & Simple Directions',
    titleCn: '地点和简单方向',
    description: 'Find common places and understand short step-by-step directions.',
    localizedTitle: L('जगहें और आसान दिशाएँ', 'Lugares y direcciones sencillas', '場所と簡単な道案内'),
    localizedDescription: L('आम जगहें खोजें और आसान दिशा-निर्देश समझें।', 'Encuentra lugares y comprende indicaciones sencillas.', 'よく使う場所と簡単な道案内を学びます。'),
    hskLevel: 1,
    level: 'beginner',
    category: 'travel',
    color: '#3B82F6',
    icon: 'explore',
    isPremium: false,
    exchanges: [
      X(
        U('洗手间在哪里？', 'Xǐshǒujiān zài nǎlǐ?', 'Where is the restroom?', 'शौचालय कहाँ है?', '¿Dónde está el baño?', 'トイレはどこですか。'),
        U('在那边。', 'Zài nàbian.', 'It is over there.', 'वह वहाँ है।', 'Está por allí.', 'あちらです。')
      ),
      X(
        U('地铁站远吗？', 'Dìtiě zhàn yuǎn ma?', 'Is the subway station far?', 'क्या मेट्रो स्टेशन दूर है?', '¿Está lejos la estación de metro?', '地下鉄の駅は遠いですか。'),
        U('不远，走五分钟。', 'Bù yuǎn, zǒu wǔ fēnzhōng.', 'No, it is a five-minute walk.', 'नहीं, पाँच मिनट पैदल है।', 'No, está a cinco minutos andando.', '遠くありません。歩いて五分です。')
      ),
      X(
        U('请一直往前走。', 'Qǐng yìzhí wǎng qián zǒu.', 'Please go straight ahead.', 'कृपया सीधे आगे जाएँ।', 'Sigue todo recto, por favor.', 'まっすぐ進んでください。'),
        U('然后呢？', 'Ránhòu ne?', 'And then?', 'और फिर?', '¿Y después?', 'それから？')
      ),
      X(
        U('在路口左转。', 'Zài lùkǒu zuǒ zhuǎn.', 'Turn left at the intersection.', 'चौराहे पर बाएँ मुड़ें।', 'Gira a la izquierda en el cruce.', '交差点で左に曲がってください。'),
        U('我明白了，谢谢。', 'Wǒ míngbai le, xièxie.', 'I understand, thank you.', 'मैं समझ गया/गई, धन्यवाद।', 'Entiendo, gracias.', '分かりました、ありがとうございます。')
      ),
    ],
  },
  {
    slug: 'weather-and-seasons',
    title: 'Weather & Seasons',
    titleCn: '天气和季节',
    description: 'Talk about forecasts, temperature, seasons and outdoor plans.',
    localizedTitle: L('मौसम और ऋतुएँ', 'Tiempo y estaciones', '天気と季節'),
    localizedDescription: L('मौसम, तापमान, ऋतु और बाहर की योजना पर बात करें।', 'Habla del pronóstico, la temperatura y las estaciones.', '天気予報、気温、季節、外出予定を話します。'),
    hskLevel: 2,
    level: 'beginner',
    category: 'daily-life',
    color: '#0EA5E9',
    icon: 'partly_cloudy_day',
    isPremium: false,
    exchanges: [
      X(
        U('今天天气怎么样？', 'Jīntiān tiānqì zěnmeyàng?', 'How is the weather today?', 'आज मौसम कैसा है?', '¿Qué tiempo hace hoy?', '今日の天気はどうですか。'),
        U('今天很暖和。', 'Jīntiān hěn nuǎnhuo.', 'It is warm today.', 'आज मौसम गर्म और सुहावना है।', 'Hoy hace buen tiempo y está cálido.', '今日は暖かいです。')
      ),
      X(
        U('明天会下雨吗？', 'Míngtiān huì xiàyǔ ma?', 'Will it rain tomorrow?', 'क्या कल बारिश होगी?', '¿Lloverá mañana?', '明日は雨が降りますか。'),
        U('会，记得带伞。', 'Huì, jìde dài sǎn.', 'Yes, remember to take an umbrella.', 'हाँ, छाता ले जाना याद रखना।', 'Sí, recuerda llevar paraguas.', 'はい、傘を忘れないでください。')
      ),
      X(
        U('你喜欢哪个季节？', 'Nǐ xǐhuan nǎge jìjié?', 'Which season do you like?', 'आपको कौन-सी ऋतु पसंद है?', '¿Qué estación te gusta?', 'どの季節が好きですか。'),
        U('我最喜欢秋天。', 'Wǒ zuì xǐhuan qiūtiān.', 'I like autumn the most.', 'मुझे पतझड़ सबसे ज्यादा पसंद है।', 'Me gusta más el otoño.', '秋が一番好きです。')
      ),
      X(
        U('外面风很大。', 'Wàimiàn fēng hěn dà.', 'It is very windy outside.', 'बाहर बहुत तेज़ हवा है।', 'Hace mucho viento fuera.', '外は風がとても強いです。'),
        U('我们待在里面吧。', 'Wǒmen dāi zài lǐmiàn ba.', 'Let us stay inside.', 'चलो अंदर ही रहते हैं।', 'Quedémonos dentro.', '中にいましょう。')
      ),
    ],
  },
  {
    slug: 'shopping-and-clothes',
    title: 'Shopping & Clothes',
    titleCn: '购物和衣服',
    description: 'Ask about price, size, fitting and discounts while shopping.',
    localizedTitle: L('खरीदारी और कपड़े', 'Compras y ropa', '買い物と服'),
    localizedDescription: L('कीमत, आकार, ट्रायल और छूट के बारे में पूछें।', 'Pregunta precios, tallas, probadores y descuentos.', '値段、サイズ、試着、割引について話します。'),
    hskLevel: 2,
    level: 'beginner',
    category: 'shopping',
    color: '#EC4899',
    icon: 'checkroom',
    isPremium: true,
    exchanges: [
      X(
        U('这件衣服多少钱？', 'Zhè jiàn yīfu duōshao qián?', 'How much is this item of clothing?', 'यह कपड़ा कितने का है?', '¿Cuánto cuesta esta prenda?', 'この服はいくらですか。'),
        U('一百二十块。', 'Yì bǎi èrshí kuài.', 'It is 120 yuan.', 'एक सौ बीस युआन।', 'Cuesta ciento veinte yuanes.', '百二十元です。')
      ),
      X(
        U('有大一点儿的吗？', 'Yǒu dà yìdiǎnr de ma?', 'Do you have a larger one?', 'क्या थोड़ा बड़ा आकार है?', '¿Tiene una talla más grande?', 'もう少し大きいものはありますか。'),
        U('有，请试试这件。', 'Yǒu, qǐng shìshi zhè jiàn.', 'Yes, please try this one.', 'हाँ, इसे पहनकर देखें।', 'Sí, pruébate esta.', 'はい、こちらを試してください。')
      ),
      X(
        U('我可以试穿吗？', 'Wǒ kěyǐ shìchuān ma?', 'May I try it on?', 'क्या मैं इसे पहनकर देख सकता/सकती हूँ?', '¿Puedo probármelo?', '試着してもいいですか。'),
        U('可以，试衣间在右边。', 'Kěyǐ, shìyījiān zài yòubian.', 'Yes, the fitting room is on the right.', 'हाँ, ट्रायल रूम दाईं ओर है।', 'Sí, el probador está a la derecha.', 'はい、試着室は右側です。')
      ),
      X(
        U('太贵了，便宜一点儿吧。', 'Tài guì le, piányi yìdiǎnr ba.', 'It is too expensive; please make it cheaper.', 'बहुत महंगा है, थोड़ा कम कर दीजिए।', 'Es demasiado caro; bájelo un poco.', '高すぎます。少し安くしてください。'),
        U('好，给你打九折。', 'Hǎo, gěi nǐ dǎ jiǔ zhé.', 'Okay, I will give you ten percent off.', 'ठीक है, आपको दस प्रतिशत छूट दूँगा।', 'De acuerdo, te hago un diez por ciento de descuento.', '分かりました。一割引きにします。')
      ),
    ],
  },
  {
    slug: 'health-and-body',
    title: 'Health & Body',
    titleCn: '健康和身体',
    description: 'Describe symptoms, understand medicine instructions and discuss recovery.',
    localizedTitle: L('स्वास्थ्य और शरीर', 'Salud y cuerpo', '健康と身体'),
    localizedDescription: L('लक्षण, दवा और आराम से जुड़ी बातचीत सीखें।', 'Describe síntomas y comprende instrucciones médicas.', '症状、薬、休養について話します。'),
    hskLevel: 2,
    level: 'beginner',
    category: 'health',
    color: '#EF4444',
    icon: 'medical_services',
    isPremium: true,
    exchanges: [
      X(
        U('你哪里不舒服？', 'Nǐ nǎlǐ bù shūfu?', 'Where do you feel unwell?', 'आपको कहाँ परेशानी है?', '¿Dónde te duele o te sientes mal?', 'どこが具合悪いですか。'),
        U('我头疼。', 'Wǒ tóuténg.', 'I have a headache.', 'मेरे सिर में दर्द है।', 'Me duele la cabeza.', '頭が痛いです。')
      ),
      X(
        U('你发烧了吗？', 'Nǐ fāshāo le ma?', 'Do you have a fever?', 'क्या आपको बुखार है?', '¿Tienes fiebre?', '熱がありますか。'),
        U('没有，只是有点儿累。', 'Méiyǒu, zhǐshì yǒudiǎnr lèi.', 'No, I am just a little tired.', 'नहीं, बस थोड़ा थका/थकी हूँ।', 'No, solo estoy un poco cansado.', 'いいえ、少し疲れているだけです。')
      ),
      X(
        U('这药一天吃几次？', 'Zhè yào yì tiān chī jǐ cì?', 'How many times a day should I take this medicine?', 'यह दवा दिन में कितनी बार लेनी है?', '¿Cuántas veces al día tomo esta medicina?', 'この薬は一日に何回飲みますか。'),
        U('一天三次，饭后吃。', 'Yì tiān sān cì, fànhòu chī.', 'Three times a day, after meals.', 'दिन में तीन बार, खाने के बाद।', 'Tres veces al día, después de comer.', '一日三回、食後に飲んでください。')
      ),
      X(
        U('你应该多休息。', 'Nǐ yīnggāi duō xiūxi.', 'You should rest more.', 'आपको ज्यादा आराम करना चाहिए।', 'Deberías descansar más.', 'もっと休んだほうがいいです。'),
        U('好的，我知道了。', 'Hǎo de, wǒ zhīdào le.', 'Okay, I understand.', 'ठीक है, मैं समझ गया/गई।', 'De acuerdo, entendido.', 'はい、分かりました。')
      ),
    ],
  },
  {
    slug: 'hobbies-and-weekends',
    title: 'Hobbies & Weekends',
    titleCn: '爱好和周末',
    description: 'Talk about interests, sports, invitations and weekend plans.',
    localizedTitle: L('शौक और सप्ताहांत', 'Aficiones y fines de semana', '趣味と週末'),
    localizedDescription: L('शौक, खेल और सप्ताहांत की योजनाओं पर बात करें।', 'Habla de aficiones, deportes y planes de fin de semana.', '趣味、スポーツ、週末の予定を話します。'),
    hskLevel: 2,
    level: 'beginner',
    category: 'social',
    color: '#8B5CF6',
    icon: 'sports_esports',
    isPremium: true,
    exchanges: [
      X(
        U('你周末喜欢做什么？', 'Nǐ zhōumò xǐhuan zuò shénme?', 'What do you like to do on weekends?', 'आप सप्ताहांत में क्या करना पसंद करते हैं?', '¿Qué te gusta hacer los fines de semana?', '週末は何をするのが好きですか。'),
        U('我喜欢爬山。', 'Wǒ xǐhuan páshān.', 'I like hiking.', 'मुझे पहाड़ चढ़ना पसंद है।', 'Me gusta hacer senderismo.', '山登りが好きです。')
      ),
      X(
        U('你会打篮球吗？', 'Nǐ huì dǎ lánqiú ma?', 'Can you play basketball?', 'क्या आप बास्केटबॉल खेल सकते हैं?', '¿Sabes jugar al baloncesto?', 'バスケットボールができますか。'),
        U('会一点儿。', 'Huì yìdiǎnr.', 'A little.', 'थोड़ा-सा।', 'Un poco.', '少しできます。')
      ),
      X(
        U('我们一起看电影吧。', 'Wǒmen yìqǐ kàn diànyǐng ba.', 'Let us watch a movie together.', 'चलो साथ में फिल्म देखते हैं।', 'Veamos una película juntos.', '一緒に映画を見ましょう。'),
        U('好啊，几点见？', 'Hǎo a, jǐ diǎn jiàn?', 'Sure, what time shall we meet?', 'ठीक है, कितने बजे मिलें?', 'Claro, ¿a qué hora quedamos?', 'いいですね、何時に会いますか。')
      ),
      X(
        U('最近我在学画画。', 'Zuìjìn wǒ zài xué huàhuà.', 'Recently I have been learning to paint.', 'हाल में मैं चित्र बनाना सीख रहा/रही हूँ।', 'Últimamente estoy aprendiendo a pintar.', '最近、絵を習っています。'),
        U('听起来很有意思。', 'Tīng qǐlái hěn yǒuyìsi.', 'That sounds interesting.', 'यह दिलचस्प लगता है।', 'Suena muy interesante.', '面白そうですね。')
      ),
    ],
  },
  {
    slug: 'city-transport',
    title: 'City Transport',
    titleCn: '城市交通',
    description: 'Use buses, trains, taxis and transfers confidently in a Chinese-speaking city.',
    localizedTitle: L('शहर का यातायात', 'Transporte urbano', '都市交通'),
    localizedDescription: L('बस, ट्रेन, टैक्सी और बदलाव की बातचीत सीखें।', 'Usa autobuses, trenes, taxis y transbordos.', 'バス、電車、タクシー、乗り換えを学びます。'),
    hskLevel: 3,
    level: 'intermediate',
    category: 'travel',
    color: '#06B6D4',
    icon: 'directions_bus',
    isPremium: true,
    exchanges: [
      X(
        U('去火车站坐哪路车？', 'Qù huǒchēzhàn zuò nǎ lù chē?', 'Which bus goes to the railway station?', 'रेलवे स्टेशन जाने के लिए कौन-सी बस लें?', '¿Qué autobús va a la estación de tren?', '駅へ行くには何番のバスですか。'),
        U('坐二路公交车。', 'Zuò èr lù gōngjiāochē.', 'Take bus number two.', 'नंबर दो बस लें।', 'Toma el autobús número dos.', '二番のバスに乗ってください。')
      ),
      X(
        U('下一站是哪里？', 'Xià yí zhàn shì nǎlǐ?', 'What is the next stop?', 'अगला स्टॉप कौन-सा है?', '¿Cuál es la próxima parada?', '次の駅はどこですか。'),
        U('下一站是人民广场。', 'Xià yí zhàn shì Rénmín Guǎngchǎng.', 'The next stop is People’s Square.', 'अगला स्टॉप पीपल्स स्क्वायर है।', 'La próxima parada es la Plaza del Pueblo.', '次は人民広場です。')
      ),
      X(
        U('我坐错车了。', 'Wǒ zuò cuò chē le.', 'I took the wrong vehicle.', 'मैं गलत गाड़ी में बैठ गया/गई।', 'Me he subido al transporte equivocado.', '乗る車を間違えました。'),
        U('你可以在前面换车。', 'Nǐ kěyǐ zài qiánmiàn huàn chē.', 'You can transfer ahead.', 'आप आगे गाड़ी बदल सकते हैं।', 'Puedes hacer transbordo más adelante.', 'この先で乗り換えられます。')
      ),
      X(
        U('请问，打车要多久？', 'Qǐngwèn, dǎchē yào duōjiǔ?', 'How long does it take by taxi?', 'टैक्सी से कितना समय लगेगा?', '¿Cuánto se tarda en taxi?', 'タクシーでどのくらいかかりますか。'),
        U('大概二十分钟。', 'Dàgài èrshí fēnzhōng.', 'About twenty minutes.', 'लगभग बीस मिनट।', 'Unos veinte minutos.', 'だいたい二十分です。')
      ),
    ],
  },
  {
    slug: 'travel-problem-solving',
    title: 'Travel Problem Solving',
    titleCn: '旅行问题处理',
    description: 'Handle lost luggage, broken facilities, cancelled flights and getting lost.',
    localizedTitle: L('यात्रा की समस्याएँ', 'Problemas de viaje', '旅行トラブル対応'),
    localizedDescription: L('सामान, होटल, उड़ान और रास्ता भटकने की समस्याएँ संभालें।', 'Resuelve problemas de equipaje, hotel, vuelos y orientación.', '荷物、ホテル、欠航、迷子の問題に対応します。'),
    hskLevel: 3,
    level: 'intermediate',
    category: 'travel',
    color: '#F97316',
    icon: 'support_agent',
    isPremium: true,
    exchanges: [
      X(
        U('我的行李不见了。', 'Wǒ de xíngli bùjiàn le.', 'My luggage is missing.', 'मेरा सामान गायब है।', 'Mi equipaje ha desaparecido.', '荷物が見つかりません。'),
        U('请填写这张表。', 'Qǐng tiánxiě zhè zhāng biǎo.', 'Please fill in this form.', 'कृपया यह फॉर्म भरें।', 'Rellene este formulario, por favor.', 'この用紙に記入してください。')
      ),
      X(
        U('房间的空调坏了。', 'Fángjiān de kōngtiáo huài le.', 'The room’s air conditioner is broken.', 'कमरे का एयर कंडीशनर खराब है।', 'El aire acondicionado de la habitación está roto.', '部屋のエアコンが壊れています。'),
        U('我马上请人来修。', 'Wǒ mǎshàng qǐng rén lái xiū.', 'I will send someone to repair it immediately.', 'मैं तुरंत किसी को ठीक करने भेजता/भेजती हूँ।', 'Enviaré a alguien a repararlo enseguida.', 'すぐに修理の人を呼びます。')
      ),
      X(
        U('我的航班取消了。', 'Wǒ de hángbān qǔxiāo le.', 'My flight was cancelled.', 'मेरी उड़ान रद्द हो गई।', 'Mi vuelo ha sido cancelado.', '私の便が欠航になりました。'),
        U('我们可以帮您改签。', 'Wǒmen kěyǐ bāng nín gǎiqiān.', 'We can help you rebook.', 'हम आपकी नई बुकिंग कर सकते हैं।', 'Podemos ayudarle a cambiar la reserva.', '便の変更をお手伝いできます。')
      ),
      X(
        U('我迷路了，可以帮我吗？', 'Wǒ mílù le, kěyǐ bāng wǒ ma?', 'I am lost; can you help me?', 'मैं रास्ता भटक गया/गई हूँ, क्या आप मदद करेंगे?', 'Me he perdido, ¿puede ayudarme?', '道に迷いました。助けてもらえますか。'),
        U('当然，你要去哪里？', 'Dāngrán, nǐ yào qù nǎlǐ?', 'Of course. Where do you want to go?', 'ज़रूर, आपको कहाँ जाना है?', 'Claro. ¿Adónde quieres ir?', 'もちろんです。どこへ行きたいですか。')
      ),
    ],
  },
  {
    slug: 'social-invitations',
    title: 'Social Invitations',
    titleCn: '社交邀请',
    description: 'Invite people, accept or decline politely, and arrange social plans.',
    localizedTitle: L('सामाजिक निमंत्रण', 'Invitaciones sociales', '誘いと予定'),
    localizedDescription: L('लोगों को बुलाएँ, विनम्रता से जवाब दें और योजना बनाएँ।', 'Invita, acepta o rechaza con cortesía y organiza planes.', '人を誘い、丁寧に返事し、予定を決めます。'),
    hskLevel: 3,
    level: 'intermediate',
    category: 'social',
    color: '#A855F7',
    icon: 'celebration',
    isPremium: true,
    exchanges: [
      X(
        U('周六你有空吗？', 'Zhōuliù nǐ yǒu kòng ma?', 'Are you free on Saturday?', 'क्या आप शनिवार को खाली हैं?', '¿Estás libre el sábado?', '土曜日は空いていますか。'),
        U('下午有空。', 'Xiàwǔ yǒu kòng.', 'I am free in the afternoon.', 'मैं दोपहर में खाली हूँ।', 'Estoy libre por la tarde.', '午後は空いています。')
      ),
      X(
        U('想来我家吃饭吗？', 'Xiǎng lái wǒ jiā chīfàn ma?', 'Would you like to eat at my home?', 'क्या आप मेरे घर खाना खाने आना चाहेंगे?', '¿Quieres venir a comer a mi casa?', 'うちに食事に来ませんか。'),
        U('好啊，需要我带什么？', 'Hǎo a, xūyào wǒ dài shénme?', 'Sure. Should I bring anything?', 'ज़रूर, मुझे क्या लाना चाहिए?', 'Claro. ¿Tengo que llevar algo?', 'いいですね。何か持っていきましょうか。')
      ),
      X(
        U('对不起，我今天来不了。', 'Duìbuqǐ, wǒ jīntiān lái bu liǎo.', 'Sorry, I cannot come today.', 'माफ़ कीजिए, मैं आज नहीं आ सकता/सकती।', 'Lo siento, hoy no puedo ir.', 'すみません、今日は行けません。'),
        U('没关系，我们改天见。', 'Méi guānxi, wǒmen gǎitiān jiàn.', 'No problem; let us meet another day.', 'कोई बात नहीं, किसी और दिन मिलेंगे।', 'No pasa nada; nos vemos otro día.', '大丈夫です。また別の日に会いましょう。')
      ),
      X(
        U('聚会几点开始？', 'Jùhuì jǐ diǎn kāishǐ?', 'What time does the party start?', 'पार्टी कितने बजे शुरू होगी?', '¿A qué hora empieza la fiesta?', '集まりは何時に始まりますか。'),
        U('晚上七点开始。', 'Wǎnshang qī diǎn kāishǐ.', 'It starts at seven in the evening.', 'शाम सात बजे शुरू होगी।', 'Empieza a las siete de la tarde.', '夜七時に始まります。')
      ),
    ],
  },
  {
    slug: 'study-and-work',
    title: 'Study & Work Routines',
    titleCn: '学习和工作日常',
    description: 'Discuss deadlines, clarification, overtime and priorities.',
    localizedTitle: L('पढ़ाई और काम की दिनचर्या', 'Rutinas de estudio y trabajo', '勉強と仕事の日常'),
    localizedDescription: L('समय-सीमा, स्पष्टीकरण, ओवरटाइम और प्राथमिकताओं पर बात करें।', 'Habla de plazos, aclaraciones, horas extra y prioridades.', '締切、説明、残業、優先事項を話します。'),
    hskLevel: 3,
    level: 'intermediate',
    category: 'work',
    color: '#6366F1',
    icon: 'school',
    isPremium: true,
    exchanges: [
      X(
        U('这个作业什么时候交？', 'Zhège zuòyè shénme shíhou jiāo?', 'When is this assignment due?', 'यह असाइनमेंट कब जमा करना है?', '¿Cuándo hay que entregar esta tarea?', 'この宿題はいつ提出しますか。'),
        U('下周一以前。', 'Xià zhōuyī yǐqián.', 'Before next Monday.', 'अगले सोमवार से पहले।', 'Antes del próximo lunes.', '来週の月曜日までです。')
      ),
      X(
        U('我没听懂这个问题。', 'Wǒ méi tīngdǒng zhège wèntí.', 'I did not understand this question.', 'मैं यह प्रश्न नहीं समझा/समझी।', 'No entendí esta pregunta.', 'この質問が聞き取れませんでした。'),
        U('我再解释一遍。', 'Wǒ zài jiěshì yí biàn.', 'I will explain it again.', 'मैं फिर से समझाता/समझाती हूँ।', 'Lo explicaré otra vez.', 'もう一度説明します。')
      ),
      X(
        U('你今天要加班吗？', 'Nǐ jīntiān yào jiābān ma?', 'Do you have to work overtime today?', 'क्या आपको आज ओवरटाइम करना है?', '¿Tienes que hacer horas extra hoy?', '今日は残業しますか。'),
        U('要，我有一个报告要完成。', 'Yào, wǒ yǒu yí ge bàogào yào wánchéng.', 'Yes, I have a report to finish.', 'हाँ, मुझे एक रिपोर्ट पूरी करनी है।', 'Sí, tengo que terminar un informe.', 'はい、レポートを仕上げなければなりません。')
      ),
      X(
        U('我们先讨论重点吧。', 'Wǒmen xiān tǎolùn zhòngdiǎn ba.', 'Let us discuss the key points first.', 'चलो पहले मुख्य बातों पर चर्चा करें।', 'Hablemos primero de los puntos clave.', 'まず要点を話し合いましょう。'),
        U('好，这样更有效率。', 'Hǎo, zhèyàng gèng yǒu xiàolǜ.', 'Okay, that is more efficient.', 'ठीक है, यह ज्यादा प्रभावी होगा।', 'Bien, así será más eficiente.', 'はい、そのほうが効率的です。')
      ),
    ],
  },
  {
    slug: 'opinions-and-comparisons',
    title: 'Opinions & Comparisons',
    titleCn: '观点和比较',
    description: 'Evaluate ideas, compare changes and agree or disagree tactfully.',
    localizedTitle: L('राय और तुलना', 'Opiniones y comparaciones', '意見と比較'),
    localizedDescription: L('विचारों का मूल्यांकन करें, तुलना करें और विनम्र असहमति जताएँ।', 'Evalúa ideas, compara cambios y discrepa con tacto.', '考えを評価し、比較し、丁寧に賛否を伝えます。'),
    hskLevel: 4,
    level: 'intermediate',
    category: 'conversation',
    color: '#7C3AED',
    icon: 'compare_arrows',
    isPremium: true,
    exchanges: [
      X(
        U('你觉得这个方案怎么样？', 'Nǐ juéde zhège fāng’àn zěnmeyàng?', 'What do you think of this plan?', 'आपको यह योजना कैसी लगती है?', '¿Qué te parece este plan?', 'この案をどう思いますか。'),
        U('我觉得很实际。', 'Wǒ juéde hěn shíjì.', 'I think it is very practical.', 'मुझे यह बहुत व्यावहारिक लगता है।', 'Me parece muy práctico.', 'とても現実的だと思います。')
      ),
      X(
        U('和以前相比，现在方便多了。', 'Hé yǐqián xiāngbǐ, xiànzài fāngbiàn duō le.', 'Compared with before, it is much more convenient now.', 'पहले की तुलना में अब बहुत सुविधाजनक है।', 'Comparado con antes, ahora es mucho más cómodo.', '以前と比べて、今はずっと便利です。'),
        U('是的，效率也提高了。', 'Shì de, xiàolǜ yě tígāo le.', 'Yes, efficiency has also improved.', 'हाँ, कार्यक्षमता भी बढ़ी है।', 'Sí, la eficiencia también ha mejorado.', 'はい、効率も上がりました。')
      ),
      X(
        U('我同意你的看法。', 'Wǒ tóngyì nǐ de kànfǎ.', 'I agree with your view.', 'मैं आपकी राय से सहमत हूँ।', 'Estoy de acuerdo con tu opinión.', 'あなたの意見に賛成です。'),
        U('谢谢，不过还有一个问题。', 'Xièxie, búguò hái yǒu yí ge wèntí.', 'Thank you, but there is still one issue.', 'धन्यवाद, लेकिन अभी एक समस्या बाकी है।', 'Gracias, pero todavía queda un problema.', 'ありがとうございます。ただ、まだ一つ問題があります。')
      ),
      X(
        U('我不完全同意。', 'Wǒ bù wánquán tóngyì.', 'I do not completely agree.', 'मैं पूरी तरह सहमत नहीं हूँ।', 'No estoy completamente de acuerdo.', '完全には同意できません。'),
        U('没关系，说说你的理由。', 'Méi guānxi, shuōshuo nǐ de lǐyóu.', 'That is okay; tell me your reasons.', 'कोई बात नहीं, अपना कारण बताइए।', 'No pasa nada; dime tus razones.', '大丈夫です。理由を聞かせてください。')
      ),
    ],
  },
  {
    slug: 'emotions-and-relationships',
    title: 'Emotions & Relationships',
    titleCn: '情绪和关系',
    description: 'Recognize feelings, offer support and resolve misunderstandings.',
    localizedTitle: L('भावनाएँ और रिश्ते', 'Emociones y relaciones', '感情と人間関係'),
    localizedDescription: L('भावनाएँ समझें, सहारा दें और गलतफहमियाँ सुलझाएँ।', 'Reconoce emociones, ofrece apoyo y resuelve malentendidos.', '感情を理解し、支え、誤解を解きます。'),
    hskLevel: 4,
    level: 'intermediate',
    category: 'social',
    color: '#DB2777',
    icon: 'favorite',
    isPremium: true,
    exchanges: [
      X(
        U('你看起来有点儿担心。', 'Nǐ kàn qǐlái yǒudiǎnr dānxīn.', 'You look a little worried.', 'आप थोड़े चिंतित लग रहे हैं।', 'Pareces un poco preocupado.', '少し心配そうですね。'),
        U('因为明天有面试。', 'Yīnwèi míngtiān yǒu miànshì.', 'Because I have an interview tomorrow.', 'क्योंकि कल मेरा इंटरव्यू है।', 'Porque mañana tengo una entrevista.', '明日、面接があるからです。')
      ),
      X(
        U('别给自己太大压力。', 'Bié gěi zìjǐ tài dà yālì.', 'Do not put too much pressure on yourself.', 'अपने ऊपर ज्यादा दबाव मत डालिए।', 'No te pongas tanta presión.', '自分にプレッシャーをかけすぎないで。'),
        U('谢谢你安慰我。', 'Xièxie nǐ ānwèi wǒ.', 'Thank you for comforting me.', 'मुझे सांत्वना देने के लिए धन्यवाद।', 'Gracias por consolarme.', '慰めてくれてありがとう。')
      ),
      X(
        U('我们之间有一点误会。', 'Wǒmen zhījiān yǒu yìdiǎn wùhuì.', 'There is a small misunderstanding between us.', 'हमारे बीच थोड़ी गलतफहमी है।', 'Hay un pequeño malentendido entre nosotros.', '私たちの間に少し誤解があります。'),
        U('那我们好好谈一谈吧。', 'Nà wǒmen hǎohāo tán yi tán ba.', 'Then let us talk it through carefully.', 'तो चलो अच्छे से बात करते हैं।', 'Entonces hablemos con calma.', 'では、きちんと話し合いましょう。')
      ),
      X(
        U('我很珍惜这段友谊。', 'Wǒ hěn zhēnxī zhè duàn yǒuyì.', 'I value this friendship very much.', 'मैं इस दोस्ती को बहुत महत्व देता/देती हूँ।', 'Valoro mucho esta amistad.', 'この友情をとても大切にしています。'),
        U('我也是。', 'Wǒ yě shì.', 'So do I.', 'मैं भी।', 'Yo también.', '私もです。')
      ),
    ],
  },
  {
    slug: 'technology-and-media',
    title: 'Technology & Media',
    titleCn: '科技和媒体',
    description: 'Use apps, solve connection problems and discuss reliable information.',
    localizedTitle: L('तकनीक और मीडिया', 'Tecnología y medios', 'テクノロジーとメディア'),
    localizedDescription: L('ऐप, नेटवर्क, खबर और डिजिटल आदतों पर बात करें।', 'Habla de aplicaciones, redes, noticias y hábitos digitales.', 'アプリ、通信、ニュース、デジタル習慣を話します。'),
    hskLevel: 4,
    level: 'intermediate',
    category: 'technology',
    color: '#2563EB',
    icon: 'devices',
    isPremium: true,
    exchanges: [
      X(
        U('这个应用怎么使用？', 'Zhège yìngyòng zěnme shǐyòng?', 'How do I use this app?', 'इस ऐप का उपयोग कैसे करें?', '¿Cómo se usa esta aplicación?', 'このアプリはどう使いますか。'),
        U('先注册一个账号。', 'Xiān zhùcè yí ge zhànghào.', 'First register an account.', 'पहले एक खाता रजिस्टर करें।', 'Primero registra una cuenta.', 'まずアカウントを登録してください。')
      ),
      X(
        U('我的网络总是断。', 'Wǒ de wǎngluò zǒngshì duàn.', 'My internet connection keeps dropping.', 'मेरा इंटरनेट बार-बार कटता है।', 'Mi conexión a internet se corta constantemente.', 'インターネットがいつも切れます。'),
        U('你试过重启路由器吗？', 'Nǐ shìguo chóngqǐ lùyóuqì ma?', 'Have you tried restarting the router?', 'क्या आपने राउटर फिर से चालू किया?', '¿Has probado a reiniciar el router?', 'ルーターを再起動してみましたか。')
      ),
      X(
        U('这条新闻可靠吗？', 'Zhè tiáo xīnwén kěkào ma?', 'Is this news reliable?', 'क्या यह खबर भरोसेमंद है?', '¿Es fiable esta noticia?', 'このニュースは信頼できますか。'),
        U('最好再查一个来源。', 'Zuìhǎo zài chá yí ge láiyuán.', 'It is best to check another source.', 'किसी दूसरे स्रोत को भी जाँचना बेहतर है।', 'Es mejor comprobar otra fuente.', '別の情報源も確認したほうがいいです。')
      ),
      X(
        U('我想减少看手机的时间。', 'Wǒ xiǎng jiǎnshǎo kàn shǒujī de shíjiān.', 'I want to reduce my screen time.', 'मैं फोन देखने का समय कम करना चाहता/चाहती हूँ।', 'Quiero reducir el tiempo que miro el móvil.', 'スマホを見る時間を減らしたいです。'),
        U('可以先关掉通知。', 'Kěyǐ xiān guāndiào tōngzhī.', 'You can start by turning off notifications.', 'पहले नोटिफिकेशन बंद कर सकते हैं।', 'Puedes empezar desactivando las notificaciones.', 'まず通知をオフにするといいです。')
      ),
    ],
  },
  {
    slug: 'services-and-complaints',
    title: 'Services & Complaints',
    titleCn: '服务和投诉',
    description: 'Report problems, request returns and negotiate a clear resolution.',
    localizedTitle: L('सेवाएँ और शिकायतें', 'Servicios y reclamaciones', 'サービスと苦情'),
    localizedDescription: L('समस्या बताएँ, वापसी माँगें और समाधान तय करें।', 'Informa problemas, solicita devoluciones y acuerda soluciones.', '問題を伝え、返品を求め、解決策を決めます。'),
    hskLevel: 4,
    level: 'intermediate',
    category: 'daily-life',
    color: '#EA580C',
    icon: 'record_voice_over',
    isPremium: true,
    exchanges: [
      X(
        U('我对这个服务不太满意。', 'Wǒ duì zhège fúwù bú tài mǎnyì.', 'I am not very satisfied with this service.', 'मैं इस सेवा से बहुत संतुष्ट नहीं हूँ।', 'No estoy muy satisfecho con este servicio.', 'このサービスにはあまり満足していません。'),
        U('很抱歉，哪里出了问题？', 'Hěn bàoqiàn, nǎlǐ chū le wèntí?', 'I am sorry. What went wrong?', 'माफ़ कीजिए, क्या समस्या हुई?', 'Lo siento. ¿Qué problema hubo?', '申し訳ありません。何が問題でしたか。')
      ),
      X(
        U('我订的东西还没到。', 'Wǒ dìng de dōngxi hái méi dào.', 'The item I ordered has not arrived yet.', 'मेरी ऑर्डर की चीज़ अभी तक नहीं आई।', 'Lo que pedí todavía no ha llegado.', '注文した物がまだ届いていません。'),
        U('我帮您查一下物流。', 'Wǒ bāng nín chá yíxià wùliú.', 'I will check the delivery status for you.', 'मैं आपके लिए डिलीवरी की स्थिति देखता/देखती हूँ।', 'Voy a comprobar el envío.', '配送状況を確認します。')
      ),
      X(
        U('这个产品可以退吗？', 'Zhège chǎnpǐn kěyǐ tuì ma?', 'Can this product be returned?', 'क्या यह उत्पाद वापस किया जा सकता है?', '¿Se puede devolver este producto?', 'この商品は返品できますか。'),
        U('七天内可以退。', 'Qī tiān nèi kěyǐ tuì.', 'It can be returned within seven days.', 'सात दिनों के अंदर वापस कर सकते हैं।', 'Se puede devolver dentro de siete días.', '七日以内なら返品できます。')
      ),
      X(
        U('我希望尽快解决。', 'Wǒ xīwàng jǐnkuài jiějué.', 'I hope this can be resolved soon.', 'मुझे उम्मीद है यह जल्दी हल होगा।', 'Espero que se resuelva pronto.', 'できるだけ早く解決してほしいです。'),
        U('我们今天会给您答复。', 'Wǒmen jīntiān huì gěi nín dáfù.', 'We will give you an answer today.', 'हम आज आपको जवाब देंगे।', 'Le daremos una respuesta hoy.', '本日中に回答いたします。')
      ),
    ],
  },
  {
    slug: 'business-meetings',
    title: 'Business Meetings',
    titleCn: '商务会议',
    description: 'Manage agendas, evidence, ownership and delivery commitments.',
    localizedTitle: L('व्यावसायिक बैठकें', 'Reuniones de negocios', 'ビジネス会議'),
    localizedDescription: L('एजेंडा, डेटा, जिम्मेदारी और समय-सीमा संभालें।', 'Gestiona agendas, datos, responsables y compromisos.', '議題、データ、担当、納期を扱います。'),
    hskLevel: 5,
    level: 'advanced',
    category: 'business',
    color: '#4F46E5',
    icon: 'business_center',
    isPremium: true,
    exchanges: [
      X(
        U('我们先确认今天的议程。', 'Wǒmen xiān quèrèn jīntiān de yìchéng.', 'Let us first confirm today’s agenda.', 'पहले आज का एजेंडा पक्का कर लेते हैं।', 'Confirmemos primero el orden del día.', 'まず今日の議題を確認しましょう。'),
        U('第一项是项目进度。', 'Dì yī xiàng shì xiàngmù jìndù.', 'The first item is project progress.', 'पहला बिंदु परियोजना की प्रगति है।', 'El primer punto es el avance del proyecto.', '最初の項目はプロジェクトの進捗です。')
      ),
      X(
        U('这个决定需要更多数据支持。', 'Zhège juédìng xūyào gèng duō shùjù zhīchí.', 'This decision needs more supporting data.', 'इस निर्णय के लिए और डेटा चाहिए।', 'Esta decisión necesita más datos de apoyo.', 'この決定にはさらにデータが必要です。'),
        U('我会补充最新数据。', 'Wǒ huì bǔchōng zuìxīn shùjù.', 'I will add the latest data.', 'मैं नवीनतम डेटा जोड़ दूँगा/दूँगी।', 'Añadiré los datos más recientes.', '最新のデータを追加します。')
      ),
      X(
        U('谁负责跟进这件事？', 'Shéi fùzé gēnjìn zhè jiàn shì?', 'Who is responsible for following this up?', 'इस काम की आगे की जिम्मेदारी किसकी है?', '¿Quién se encarga del seguimiento?', 'この件のフォローは誰が担当しますか。'),
        U('我来负责。', 'Wǒ lái fùzé.', 'I will take responsibility.', 'मैं जिम्मेदारी लेता/लेती हूँ।', 'Yo me encargo.', '私が担当します。')
      ),
      X(
        U('我们能在周五前完成吗？', 'Wǒmen néng zài zhōuwǔ qián wánchéng ma?', 'Can we finish before Friday?', 'क्या हम शुक्रवार से पहले पूरा कर सकते हैं?', '¿Podemos terminar antes del viernes?', '金曜日までに完成できますか。'),
        U('如果资源够，应该可以。', 'Rúguǒ zīyuán gòu, yīnggāi kěyǐ.', 'If we have enough resources, we should be able to.', 'संसाधन पर्याप्त हों तो कर सकते हैं।', 'Si hay recursos suficientes, debería ser posible.', 'リソースが十分なら可能だと思います。')
      ),
    ],
  },
  {
    slug: 'presentations-and-data',
    title: 'Presentations & Data',
    titleCn: '演讲和数据',
    description: 'Present trends, comparisons, structure and evidence clearly.',
    localizedTitle: L('प्रस्तुति और डेटा', 'Presentaciones y datos', 'プレゼンとデータ'),
    localizedDescription: L('रुझान, तुलना, मुख्य बिंदु और स्रोत स्पष्ट रूप से बताएँ।', 'Presenta tendencias, comparaciones, puntos y fuentes.', '傾向、比較、要点、根拠を明確に示します。'),
    hskLevel: 5,
    level: 'advanced',
    category: 'business',
    color: '#0891B2',
    icon: 'query_stats',
    isPremium: true,
    exchanges: [
      X(
        U('从图表可以看出，销量在增长。', 'Cóng túbiǎo kěyǐ kànchū, xiāoliàng zài zēngzhǎng.', 'The chart shows that sales are growing.', 'चार्ट से दिखता है कि बिक्री बढ़ रही है।', 'El gráfico muestra que las ventas están creciendo.', 'グラフから売上が伸びていることが分かります。'),
        U('增长主要来自线上渠道。', 'Zēngzhǎng zhǔyào láizì xiànshàng qúdào.', 'The growth mainly comes from online channels.', 'वृद्धि मुख्यतः ऑनलाइन चैनलों से आई है।', 'El crecimiento proviene principalmente de los canales en línea.', '成長は主にオンライン経由です。')
      ),
      X(
        U('与去年相比，成本下降了百分之八。', 'Yǔ qùnián xiāngbǐ, chéngběn xiàjiàng le bǎifēnzhī bā.', 'Compared with last year, costs fell by eight percent.', 'पिछले साल की तुलना में लागत आठ प्रतिशत घटी।', 'Frente al año pasado, los costes bajaron un ocho por ciento.', '昨年と比べてコストは八パーセント下がりました。'),
        U('这是一个积极的变化。', 'Zhè shì yí ge jījí de biànhuà.', 'This is a positive change.', 'यह एक सकारात्मक बदलाव है।', 'Es un cambio positivo.', 'これは前向きな変化です。')
      ),
      X(
        U('接下来我想说明三个重点。', 'Jiēxiàlái wǒ xiǎng shuōmíng sān ge zhòngdiǎn.', 'Next I would like to explain three key points.', 'अब मैं तीन मुख्य बिंदु बताना चाहता/चाहती हूँ।', 'A continuación explicaré tres puntos clave.', '次に三つの要点を説明します。'),
        U('请继续。', 'Qǐng jìxù.', 'Please continue.', 'कृपया जारी रखें।', 'Continúa, por favor.', '続けてください。')
      ),
      X(
        U('如果有问题，欢迎随时提问。', 'Rúguǒ yǒu wèntí, huānyíng suíshí tíwèn.', 'If you have questions, please ask at any time.', 'कोई प्रश्न हो तो कभी भी पूछिए।', 'Si tienen preguntas, pueden hacerlas en cualquier momento.', '質問があれば、いつでもお聞きください。'),
        U('我想了解数据来源。', 'Wǒ xiǎng liǎojiě shùjù láiyuán.', 'I would like to know the data source.', 'मैं डेटा का स्रोत जानना चाहता/चाहती हूँ।', 'Me gustaría conocer la fuente de los datos.', 'データの出所を知りたいです。')
      ),
    ],
  },
  {
    slug: 'culture-and-society',
    title: 'Culture & Society',
    titleCn: '文化和社会',
    description: 'Discuss traditions, regional differences, development and preservation.',
    localizedTitle: L('संस्कृति और समाज', 'Cultura y sociedad', '文化と社会'),
    localizedDescription: L('परंपरा, क्षेत्रीय अंतर, विकास और संरक्षण पर चर्चा करें।', 'Habla de tradiciones, diferencias regionales y conservación.', '伝統、地域差、発展、保護について話します。'),
    hskLevel: 5,
    level: 'advanced',
    category: 'culture',
    color: '#B45309',
    icon: 'temple_buddhist',
    isPremium: true,
    exchanges: [
      X(
        U('这个传统有什么特别的意义？', 'Zhège chuántǒng yǒu shénme tèbié de yìyì?', 'What special meaning does this tradition have?', 'इस परंपरा का विशेष अर्थ क्या है?', '¿Qué significado especial tiene esta tradición?', 'この伝統にはどんな特別な意味がありますか。'),
        U('它代表团圆和祝福。', 'Tā dàibiǎo tuányuán hé zhùfú.', 'It represents reunion and good wishes.', 'यह मिलन और शुभकामनाओं का प्रतीक है।', 'Representa la reunión y los buenos deseos.', '団らんと祝福を表しています。')
      ),
      X(
        U('不同地区的习惯差别很大。', 'Bùtóng dìqū de xíguàn chābié hěn dà.', 'Customs differ greatly between regions.', 'अलग क्षेत्रों की आदतों में बड़ा अंतर है।', 'Las costumbres varían mucho entre regiones.', '地域によって習慣が大きく異なります。'),
        U('这正是文化有趣的地方。', 'Zhè zhèng shì wénhuà yǒuqù de dìfang.', 'That is exactly what makes culture interesting.', 'यही संस्कृति को रोचक बनाता है।', 'Eso es precisamente lo interesante de la cultura.', 'そこが文化の面白いところです。')
      ),
      X(
        U('城市发展带来了哪些变化？', 'Chéngshì fāzhǎn dàilái le nǎxiē biànhuà?', 'What changes has urban development brought?', 'शहरी विकास से क्या बदलाव आए हैं?', '¿Qué cambios ha traído el desarrollo urbano?', '都市の発展はどんな変化をもたらしましたか。'),
        U('生活更方便，但压力也更大。', 'Shēnghuó gèng fāngbiàn, dàn yālì yě gèng dà.', 'Life is more convenient, but pressure is also greater.', 'जीवन सुविधाजनक हुआ है, लेकिन दबाव भी बढ़ा है।', 'La vida es más cómoda, pero también hay más presión.', '生活は便利になりましたが、ストレスも増えました。')
      ),
      X(
        U('我们应该怎样保护传统文化？', 'Wǒmen yīnggāi zěnyàng bǎohù chuántǒng wénhuà?', 'How should we protect traditional culture?', 'हमें पारंपरिक संस्कृति की रक्षा कैसे करनी चाहिए?', '¿Cómo debemos proteger la cultura tradicional?', '伝統文化をどう守るべきですか。'),
        U('教育和社区参与都很重要。', 'Jiàoyù hé shèqū cānyù dōu hěn zhòngyào.', 'Education and community participation are both important.', 'शिक्षा और समुदाय की भागीदारी दोनों महत्वपूर्ण हैं।', 'La educación y la participación comunitaria son importantes.', '教育と地域の参加がどちらも重要です。')
      ),
    ],
  },
  {
    slug: 'debate-and-reasoning',
    title: 'Debate & Reasoning',
    titleCn: '辩论和推理',
    description: 'Build nuanced arguments, challenge evidence and identify shared goals.',
    localizedTitle: L('बहस और तर्क', 'Debate y razonamiento', '討論と論理'),
    localizedDescription: L('सूक्ष्म तर्क बनाएँ, प्रमाण जाँचें और साझा लक्ष्य खोजें।', 'Construye argumentos, cuestiona pruebas y busca objetivos comunes.', '論点を組み立て、根拠を検討し、共通目標を探します。'),
    hskLevel: 6,
    level: 'fluent',
    category: 'fluency',
    color: '#9333EA',
    icon: 'forum',
    isPremium: true,
    exchanges: [
      X(
        U('这个观点看似合理，但忽略了长期影响。', 'Zhège guāndiǎn kànsì hélǐ, dàn hūlüè le chángqī yǐngxiǎng.', 'This view seems reasonable but ignores the long-term impact.', 'यह विचार उचित लगता है, पर दीर्घकालिक प्रभाव को नजरअंदाज करता है।', 'Esta opinión parece razonable, pero ignora el impacto a largo plazo.', 'この見方は合理的に見えますが、長期的な影響を無視しています。'),
        U('那你认为主要风险是什么？', 'Nà nǐ rènwéi zhǔyào fēngxiǎn shì shénme?', 'Then what do you think the main risk is?', 'तो आपके अनुसार मुख्य जोखिम क्या है?', 'Entonces, ¿cuál crees que es el principal riesgo?', 'では、主なリスクは何だと思いますか。')
      ),
      X(
        U('我们不能只根据个别例子下结论。', 'Wǒmen bù néng zhǐ gēnjù gèbié lìzi xià jiélùn.', 'We cannot draw a conclusion from isolated examples alone.', 'हम केवल कुछ उदाहरणों से निष्कर्ष नहीं निकाल सकते।', 'No podemos sacar conclusiones solo de casos aislados.', '個別の例だけで結論を出すことはできません。'),
        U('同意，还需要更全面的数据。', 'Tóngyì, hái xūyào gèng quánmiàn de shùjù.', 'Agreed; we also need more comprehensive data.', 'सहमत, हमें अधिक व्यापक डेटा चाहिए।', 'De acuerdo; también hacen falta datos más completos.', '同意します。より包括的なデータが必要です。')
      ),
      X(
        U('即使成本较高，这项投资仍然值得。', 'Jíshǐ chéngběn jiào gāo, zhè xiàng tóuzī réngrán zhíde.', 'Even if the cost is high, this investment is still worthwhile.', 'लागत अधिक होने पर भी यह निवेश उचित है।', 'Aunque el coste sea alto, la inversión sigue mereciendo la pena.', 'コストが高くても、この投資には価値があります。'),
        U('前提是收益能够持续。', 'Qiántí shì shōuyì nénggòu chíxù.', 'Provided that the returns can be sustained.', 'शर्त यह है कि लाभ लगातार मिलता रहे।', 'Siempre que los beneficios puedan mantenerse.', '収益が持続することが前提です。')
      ),
      X(
        U('与其争论立场，不如先明确共同目标。', 'Yǔqí zhēnglùn lìchǎng, bùrú xiān míngquè gòngtóng mùbiāo.', 'Rather than argue over positions, we should first clarify our shared goal.', 'पक्षों पर बहस करने से बेहतर है पहले साझा लक्ष्य तय करें।', 'En vez de discutir posturas, aclaremos primero el objetivo común.', '立場を争うより、まず共通の目標を明確にしましょう。'),
        U('这样更容易找到解决方案。', 'Zhèyàng gèng róngyì zhǎodào jiějué fāng’àn.', 'That makes it easier to find a solution.', 'इससे समाधान खोजना आसान होगा।', 'Así será más fácil encontrar una solución.', 'そのほうが解決策を見つけやすくなります。')
      ),
    ],
  },
  {
    slug: 'idioms-and-natural-speech',
    title: 'Idioms & Natural Speech',
    titleCn: '成语和自然表达',
    description: 'Understand natural reactions, idiomatic chunks and experience-based expressions.',
    localizedTitle: L('मुहावरे और स्वाभाविक भाषा', 'Modismos y habla natural', '成語と自然な表現'),
    localizedDescription: L('स्वाभाविक प्रतिक्रिया, मुहावरे और अनुभव आधारित अभिव्यक्ति सीखें।', 'Aprende reacciones naturales, modismos y expresiones de experiencia.', '自然な反応、成語、経験を表す言い回しを学びます。'),
    hskLevel: 6,
    level: 'fluent',
    category: 'fluency',
    color: '#BE123C',
    icon: 'record_voice_over',
    isPremium: true,
    exchanges: [
      X(
        U('这件事急也没用，慢慢来吧。', 'Zhè jiàn shì jí yě méi yòng, mànmàn lái ba.', 'Rushing will not help; take it step by step.', 'जल्दी करने से फायदा नहीं, धीरे-धीरे करें।', 'Tener prisa no ayuda; vayamos paso a paso.', '焦っても仕方ありません。ゆっくり進めましょう。'),
        U('你说得对，我有点儿着急了。', 'Nǐ shuō de duì, wǒ yǒudiǎnr zháojí le.', 'You are right; I became a little impatient.', 'आप सही हैं, मैं थोड़ा अधीर हो गया/गई था।', 'Tienes razón; me puse un poco impaciente.', 'その通りです。少し焦っていました。')
      ),
      X(
        U('他做事总是说到做到。', 'Tā zuòshì zǒngshì shuō dào zuò dào.', 'He always keeps his word.', 'वह हमेशा अपनी बात पूरी करता है।', 'Siempre cumple lo que promete.', '彼はいつも約束を守ります。'),
        U('难怪大家都信任他。', 'Nánguài dàjiā dōu xìnrèn tā.', 'No wonder everyone trusts him.', 'इसीलिए सब उस पर भरोसा करते हैं।', 'No es de extrañar que todos confíen en él.', 'だから皆が彼を信頼するのですね。')
      ),
      X(
        U('计划突然改变，我有点儿措手不及。', 'Jìhuà tūrán gǎibiàn, wǒ yǒudiǎnr cuòshǒubùjí.', 'The plan changed suddenly, and I was caught off guard.', 'योजना अचानक बदली और मैं तैयार नहीं था/थी।', 'El plan cambió de repente y me tomó por sorpresa.', '計画が急に変わり、対応が間に合いませんでした。'),
        U('我们先想一个备用方案。', 'Wǒmen xiān xiǎng yí ge bèiyòng fāng’àn.', 'Let us first think of a backup plan.', 'पहले एक वैकल्पिक योजना सोचते हैं।', 'Pensemos primero en un plan alternativo.', 'まず予備の案を考えましょう。')
      ),
      X(
        U('经过这次失败，我算是吃一堑，长一智。', 'Jīngguò zhè cì shībài, wǒ suàn shì chī yí qiàn, zhǎng yí zhì.', 'After this failure, I learned a lesson from experience.', 'इस असफलता से मैंने अनुभव लेकर सीख ली।', 'Después de este fracaso, aprendí la lección por experiencia.', '今回の失敗で、一つ経験して一つ賢くなりました。'),
        U('有经验就是进步。', 'Yǒu jīngyàn jiù shì jìnbù.', 'Gaining experience is progress.', 'अनुभव मिलना ही प्रगति है।', 'Ganar experiencia ya es progresar.', '経験を得ること自体が進歩です。')
      ),
    ],
  },
];

const LESSON_TYPES = ['dialogue', 'vocabulary', 'listening', 'grammar', 'reading', 'dialogue', 'quiz', 'listening'] as const;

const localizedCourseOutcomes = {
  hi: {
    outcome1: '8 उपयोगी अभिव्यक्तियों में महारत हासिल करें',
    outcome2: '48 इंटरैक्टिव अभ्यास पूरे करें',
    outcome3: 'AI रोल-प्ले में भाषा का उपयोग करें',
  },
  es: {
    outcome1: 'Domina 8 expresiones prácticas',
    outcome2: 'Completa 48 actividades interactivas',
    outcome3: 'Usa el idioma en juegos de rol con IA',
  },
  ja: {
    outcome1: '実用表現を8個習得する',
    outcome2: '48のインタラクティブ練習を完了する',
    outcome3: 'AIロールプレイで表現を使う',
  },
};

export const EXPANDED_COURSE_SEEDS = COURSE_PACKS.map((pack, index) => ({
  slug: pack.slug,
  title: pack.title,
  titleCn: pack.titleCn,
  hskLevel: pack.hskLevel,
  description: pack.description,
  color: pack.color,
  icon: pack.icon,
  isPremium: pack.isPremium,
  order: index + 9,
  level: pack.level,
  category: pack.category,
  accessTier: pack.isPremium ? 'premium' : 'free',
  outcomes: ['Master 8 practical expressions', 'Complete 48 interactive activities', 'Use the language in AI role-play'],
  supportedLanguages: ['en', 'hi', 'es', 'ja'],
  isPublished: true,
  translations: {
    ...translationsForFields(pack.localizedTitle, pack.localizedDescription),
    hi: { ...translationsForFields(pack.localizedTitle, pack.localizedDescription).hi, ...localizedCourseOutcomes.hi },
    es: { ...translationsForFields(pack.localizedTitle, pack.localizedDescription).es, ...localizedCourseOutcomes.es },
    ja: { ...translationsForFields(pack.localizedTitle, pack.localizedDescription).ja, ...localizedCourseOutcomes.ja },
  },
}));

const lessonPromptTranslations = (utterance: UtteranceSeed, counterpart: UtteranceSeed) => ({
  title: L(`बोलें: ${utterance.localized.hi}`, `Di: ${utterance.localized.es}`, `話す：${utterance.localized.ja}`),
  description: L(
    'इस अभिव्यक्ति को सुनें, समझें और वास्तविक बातचीत में बोलें।',
    'Escucha, comprende y usa esta expresión en una conversación real.',
    'この表現を聞き、理解し、実際の会話で使います。'
  ),
  objective1: L('अर्थ और स्थिति को पहचानें', 'Reconoce el significado y el contexto', '意味と場面を理解する'),
  objective2: L('सही स्वर और लय के साथ बोलें', 'Habla con tonos y ritmo correctos', '正しい声調とリズムで話す'),
  objective3: L(`जवाब से जोड़ें: ${counterpart.localized.hi}`, `Conecta con: ${counterpart.localized.es}`, `応答とつなげる：${counterpart.localized.ja}`),
});

export const EXPANDED_LESSON_SEEDS = COURSE_PACKS.flatMap(pack => {
  const utterances = pack.exchanges.flatMap(exchange => [exchange.prompt, exchange.response]);

  return utterances.map((utterance, utteranceIndex) => {
    const exchange = pack.exchanges[Math.floor(utteranceIndex / 2)];
    const counterpart = utteranceIndex % 2 === 0 ? exchange.response : exchange.prompt;
    const practiceWords = [0, 1, 2, 3].map(offset => utterances[(utteranceIndex + offset) % utterances.length]);
    const englishOptions = Array.from(new Set(practiceWords.map(item => item.english)));
    const chineseOptions = Array.from(new Set([counterpart, ...practiceWords].map(item => item.chinese))).slice(0, 4);
    const localized = lessonPromptTranslations(utterance, counterpart);

    return {
      courseSlug: pack.slug,
      slug: `${pack.slug}-${String(utteranceIndex + 1).padStart(2, '0')}`,
      title: `Speak: ${utterance.english}`,
      titleCn: utterance.chinese,
      pinyin: utterance.pinyin,
      description: 'Listen, understand and use this expression in a realistic exchange.',
      order: utteranceIndex + 1,
      type: LESSON_TYPES[utteranceIndex],
      estimatedMinutes: Math.min(12, 7 + pack.hskLevel),
      xpReward: pack.isPremium && utteranceIndex > 0 ? 30 : 20,
      isPremium: pack.isPremium && utteranceIndex > 0,
      isPublished: true,
      objectives: ['Recognize meaning and context', 'Speak with accurate tones and rhythm', 'Connect the line to a natural reply'],
      vocab: practiceWords.map(item => ({
        chinese: item.chinese,
        pinyin: item.pinyin,
        english: item.english,
        partOfSpeech: 'expression',
        translations: item.localized,
      })),
      grammarPoints: [],
      sentences: [utterance, counterpart].map(item => ({
        chinese: item.chinese,
        pinyin: item.pinyin,
        english: item.english,
        translations: item.localized,
      })),
      exercises: [
        {
          type: 'multiple_choice',
          prompt: `What does ${utterance.chinese} mean?`,
          promptChinese: utterance.chinese,
          options: englishOptions,
          answer: utterance.english,
          explanation: `${utterance.chinese} (${utterance.pinyin}) means “${utterance.english}”.`,
          translations: L(`${utterance.chinese} का सही अर्थ चुनें।`, `Elige el significado correcto de ${utterance.chinese}.`, `${utterance.chinese} の正しい意味を選んでください。`),
        },
        {
          type: 'listen_select',
          prompt: 'Listen and choose the correct meaning.',
          promptChinese: utterance.chinese,
          options: englishOptions,
          answer: utterance.english,
          explanation: utterance.pinyin,
          translations: L('सुनें और सही अर्थ चुनें।', 'Escucha y elige el significado correcto.', '音声を聞いて正しい意味を選んでください。'),
        },
        {
          type: 'speak',
          prompt: 'Say the expression aloud and compare your pronunciation.',
          promptChinese: utterance.chinese,
          options: [],
          answer: utterance.chinese,
          explanation: utterance.pinyin,
          translations: L('अभिव्यक्ति बोलें और अपना उच्चारण जाँचें।', 'Di la expresión y compara tu pronunciación.', '表現を声に出し、発音を確認してください。'),
        },
        {
          type: 'translate',
          prompt: `Translate into Chinese: ${utterance.english}`,
          options: [],
          answer: utterance.chinese,
          explanation: utterance.pinyin,
          translations: L(`चीनी में अनुवाद करें: ${utterance.localized.hi}`, `Traduce al chino: ${utterance.localized.es}`, `中国語に訳してください：${utterance.localized.ja}`),
        },
        {
          type: 'reorder',
          prompt: 'Rebuild the Chinese line in the correct order.',
          promptChinese: utterance.chinese,
          options: [],
          answer: utterance.chinese,
          explanation: utterance.pinyin,
          translations: L('चीनी वाक्य को सही क्रम में बनाएँ।', 'Reconstruye la frase china en el orden correcto.', '中国語の文を正しい順番に並べてください。'),
        },
        {
          type: 'multiple_choice',
          prompt: `Choose the matching line for: ${utterance.chinese}`,
          promptChinese: utterance.chinese,
          options: chineseOptions,
          answer: counterpart.chinese,
          explanation: `${utterance.chinese} — ${counterpart.chinese}`,
          translations: L('इस पंक्ति के लिए स्वाभाविक जवाब चुनें।', 'Elige la respuesta natural para esta frase.', 'この文に合う自然な応答を選んでください。'),
        },
      ],
      translations: {
        hi: { title: localized.title.hi, description: localized.description.hi, objective1: localized.objective1.hi, objective2: localized.objective2.hi, objective3: localized.objective3.hi },
        es: { title: localized.title.es, description: localized.description.es, objective1: localized.objective1.es, objective2: localized.objective2.es, objective3: localized.objective3.es },
        ja: { title: localized.title.ja, description: localized.description.ja, objective1: localized.objective1.ja, objective2: localized.objective2.ja, objective3: localized.objective3.ja },
      },
    };
  });
});

const difficultyForHsk = (hskLevel: number): 'beginner' | 'elementary' | 'intermediate' | 'advanced' => {
  if (hskLevel === 1) return 'beginner';
  if (hskLevel === 2) return 'elementary';
  if (hskLevel <= 4) return 'intermediate';
  return 'advanced';
};

export const EXPANDED_SCENARIO_SEEDS = COURSE_PACKS.map((pack, index) => {
  const previewExchanges = pack.exchanges.slice(0, 2);
  const localizedTitle = L(`${pack.localizedTitle.hi} रोल-प्ले`, `Role-play de ${pack.localizedTitle.es}`, `${pack.localizedTitle.ja}ロールプレイ`);
  const localizedDescription = L('AI साथी के साथ वास्तविक बातचीत का अभ्यास करें।', 'Practica una conversación realista con un compañero de IA.', 'AIパートナーと現実的な会話を練習します。');

  return {
    slug: `${pack.slug}-roleplay`,
    title: `${pack.title} Role-play`,
    titleCn: `${pack.titleCn}情景对话`,
    pinyin: 'qíngjǐng duìhuà',
    description: `Practice realistic ${pack.title.toLowerCase()} conversations with an adaptive AI partner.`,
    icon: pack.icon,
    difficulty: difficultyForHsk(pack.hskLevel),
    color: pack.color,
    isPremium: pack.isPremium,
    order: index + 13,
    estimatedMinutes: Math.min(12, 5 + pack.hskLevel),
    learningGoals: ['Respond without translating word by word', 'Use the course expressions naturally', 'Receive concise corrections after each turn'],
    systemPrompt: `Role-play ${pack.title.toLowerCase()} with the learner. Use HSK ${pack.hskLevel} language, keep each turn under two sentences, accept reasonable variations, and give one short correction only when it helps.`,
    isPublished: true,
    dialogues: previewExchanges.flatMap(exchange => [
      { speaker: 'ai', chinese: exchange.prompt.chinese, pinyin: exchange.prompt.pinyin, english: exchange.prompt.english, translations: exchange.prompt.localized },
      { speaker: 'user', chinese: exchange.response.chinese, pinyin: exchange.response.pinyin, english: exchange.response.english, translations: exchange.response.localized },
    ]),
    translations: {
      hi: { title: localizedTitle.hi, description: localizedDescription.hi, goal1: 'शब्द-दर-शब्द अनुवाद किए बिना जवाब दें', goal2: 'कोर्स की अभिव्यक्तियों का स्वाभाविक उपयोग करें', goal3: 'हर जवाब के बाद छोटा सुधार पाएँ' },
      es: { title: localizedTitle.es, description: localizedDescription.es, goal1: 'Responde sin traducir palabra por palabra', goal2: 'Usa las expresiones del curso con naturalidad', goal3: 'Recibe correcciones breves después de cada turno' },
      ja: { title: localizedTitle.ja, description: localizedDescription.ja, goal1: '一語ずつ訳さずに答える', goal2: 'コースの表現を自然に使う', goal3: '各ターン後に短い訂正を受ける' },
    },
  };
});

