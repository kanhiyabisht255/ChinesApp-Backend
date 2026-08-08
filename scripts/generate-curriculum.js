const fs = require('fs');
const path = require('path');

const outputFile = path.join(__dirname, '..', 'src', 'content', 'curriculum.ts');

const L = (hi, es, ja) => ({ hi, es, ja });

const colors = [
  '#22C55E', '#7F43FE', '#3B82F6', '#F59E0B', '#06B6D4', '#EC4899', '#EF4444', '#8B5CF6',
  '#0EA5E9', '#10B981', '#F97316', '#84CC16', '#D946EF', '#F43F5E', '#6366F1', '#14B8A6'
];

const icons = [
  'graphic_eq', 'waving_hand', 'schedule', 'restaurant', 'flight', 'auto_stories', 'business_center',
  'record_voice_over', 'school', 'emoji_food_beverage', 'pets', 'forest', 'checkroom', 'shopping_bag',
  'directions_bus', 'map', 'chat', 'favorite', 'wb_sunny', 'local_hospital', 'work', 'computer',
  'smartphone', 'movie', 'music_note', 'sports_basketball', 'book', 'attach_money', 'translate',
  'psychology', 'volunteer_activism', 'sentiment_satisfied_alt', 'local_cafe', 'hotel', 'local_airport',
  'medical_services', 'public', 'gavel', 'newspaper', 'history_edu', 'science', 'nature',
  'trending_up', 'emoji_events', 'forum', 'star', 'person', 'group', 'family_restroom'
];

const baseCourses = [
  // Phase 1: Foundation
  { slug: 'pinyin-and-tones', title: 'Pinyin & Four Tones', titleCn: '拼音和声调', hsk: 1, level: 'starter', category: 'pronunciation', premium: false, icon: 'graphic_eq', desc: 'Build clear pronunciation with initials, finals and the four Mandarin tones.' },
  { slug: 'tone-change-rules', title: 'Tone Change Rules', titleCn: '变调规则', hsk: 1, level: 'starter', category: 'pronunciation', premium: false, icon: 'graphic_eq', desc: 'Master natural tone changes in real speech.' },
  { slug: 'hello-and-greetings', title: 'Hello & Greetings', titleCn: '你好与问候', hsk: 1, level: 'starter', category: 'speaking', premium: false, icon: 'waving_hand', desc: 'Greet people and say hello confidently.' },
  { slug: 'introducing-yourself', title: 'Introducing Yourself', titleCn: '自我介绍', hsk: 1, level: 'starter', category: 'speaking', premium: false, icon: 'person', desc: 'Say your name, origin and what you do.' },
  { slug: 'numbers-0-to-100', title: 'Numbers 0–100', titleCn: '数字0到100', hsk: 1, level: 'starter', category: 'foundations', premium: false, icon: 'looks_one', desc: 'Count from zero to one hundred.' },
  { slug: 'numbers-100-to-10000', title: 'Numbers 100–10,000', titleCn: '数字100到一万', hsk: 1, level: 'starter', category: 'foundations', premium: false, icon: 'looks_two', desc: 'Handle larger numbers and prices.' },
  { slug: 'time-and-clock', title: 'Time & Clock', titleCn: '时间与钟表', hsk: 1, level: 'starter', category: 'foundations', premium: false, icon: 'schedule', desc: 'Tell time and describe daily schedules.' },
  { slug: 'days-and-dates', title: 'Days & Dates', titleCn: '日期与星期', hsk: 1, level: 'starter', category: 'foundations', premium: false, icon: 'calendar_today', desc: 'Talk about days, weeks and dates.' },
  { slug: 'months-and-seasons', title: 'Months & Seasons', titleCn: '月份与季节', hsk: 1, level: 'starter', category: 'foundations', premium: false, icon: 'wb_sunny', desc: 'Discuss months and seasons.' },
  { slug: 'money-and-prices', title: 'Money & Prices', titleCn: '钱与价格', hsk: 1, level: 'starter', category: 'foundations', premium: false, icon: 'attach_money', desc: 'Ask prices and understand currency.' },
  { slug: 'colors-and-shapes', title: 'Colors & Shapes', titleCn: '颜色与形状', hsk: 1, level: 'starter', category: 'vocabulary', premium: true, icon: 'palette', desc: 'Describe colors and shapes.' },
  { slug: 'sizes-and-measurements', title: 'Sizes & Measurements', titleCn: '大小与度量', hsk: 1, level: 'starter', category: 'vocabulary', premium: true, icon: 'straighten', desc: 'Compare size, length and quantity.' },
  { slug: 'family-members', title: 'Family Members', titleCn: '家庭成员', hsk: 1, level: 'starter', category: 'vocabulary', premium: true, icon: 'family_restroom', desc: 'Talk about relatives.' },
  { slug: 'my-home', title: 'My Home', titleCn: '我的家', hsk: 1, level: 'starter', category: 'vocabulary', premium: true, icon: 'home', desc: 'Describe rooms and furniture.' },
  { slug: 'daily-routine', title: 'Daily Routine', titleCn: '日常生活', hsk: 1, level: 'starter', category: 'vocabulary', premium: true, icon: 'today', desc: 'From morning to night.' },
  { slug: 'common-objects', title: 'Common Objects', titleCn: '常见物品', hsk: 1, level: 'starter', category: 'vocabulary', premium: true, icon: 'category', desc: 'Things around you.' },
  { slug: 'body-parts', title: 'Body Parts', titleCn: '身体部位', hsk: 1, level: 'starter', category: 'vocabulary', premium: true, icon: 'accessibility', desc: 'Name parts of the body.' },
  { slug: 'feelings-and-emotions', title: 'Feelings & Emotions', titleCn: '情感与情绪', hsk: 1, level: 'starter', category: 'vocabulary', premium: true, icon: 'mood', desc: 'Express feelings.' },
  { slug: 'weather-and-nature', title: 'Weather & Nature', titleCn: '天气与自然', hsk: 1, level: 'starter', category: 'vocabulary', premium: true, icon: 'wb_cloudy', desc: 'Talk about weather and nature.' },
  { slug: 'review-foundations', title: 'Review: Foundations', titleCn: '复习：基础', hsk: 1, level: 'starter', category: 'quiz', premium: true, icon: 'school', desc: 'Checkpoint quiz for Phase 1.' }
];

// Generate more courses to reach 150
const extra = [];
const titles = [
  ['Food Basics','食物基础', 'emoji_food_beverage'], ['Fruits & Vegetables','水果蔬菜', 'nutrition'], ['Drinks & Beverages','饮料', 'local_cafe'],
  ['Meat & Seafood','肉类海鲜', 'set_meal'], ['Ordering Food','点餐', 'restaurant'], ['Cooking Verbs','烹饪动词', 'outdoor_grill'],
  ['Tastes & Flavors','味道', 'thumb_up'], ['Pets','宠物', 'pets'], ['Wild Animals','野生动物', 'lion'],
  ['Farm Animals','农场动物', 'agriculture'], ['Plants & Trees','植物树木', 'forest'], ['Land & Water','山水', 'terrain'],
  ['Clothing Basics','衣服基础', 'checkroom'], ['Accessories','配饰', 'watch'], ['Shopping Phrases','购物用语', 'shopping_bag'],
  ['Land Transport','陆地交通', 'directions_bus'], ['Air & Rail Transport','飞机火车', 'flight'], ['Directions','问路', 'map'],
  ['Places in City','城市地点', 'location_city'], ['Review: Essentials','复习：基础词汇', 'school'],
  ['Making Friends','交朋友', 'group'], ['Hobbies & Interests','爱好', 'interests'], ['Sports & Exercise','运动', 'sports_basketball'],
  ['Music & Movies','音乐电影', 'movie'], ['Books & Reading','阅读', 'menu_book'], ['Technology & Phones','科技手机', 'smartphone'],
  ['Social Media','社交媒体', 'share'], ['Work - Jobs','工作与职业', 'work'], ['Work - Office Talk','办公室对话', 'business_center'],
  ['Work - Meetings','工作会议', 'groups'], ['School & Education','学校教育', 'school'], ['Travel Planning','旅行计划', 'flight_takeoff'],
  ['Hotel Check-in','酒店入住', 'hotel'], ['Airport & Flight','机场航班', 'local_airport'], ['Restaurant Deep Dive','餐厅深入', 'restaurant'],
  ['Shopping Malls','购物中心', 'storefront'], ['Doctor Visit','看医生', 'medical_services'], ['Emergencies','紧急情况', 'emergency'],
  ['Bank & Money','银行金钱', 'account_balance'], ['Review: Conversations','复习：对话', 'school'],
  ['Sentence Structure','句子结构', 'text_fields'], ['Question Words','疑问词', 'help'], ['Question Particles','疑问助词', 'chat'],
  ['Negation','否定', 'block'], ['Past Tense','过去时', 'history'], ['Future Tense','将来时', 'update'],
  ['Continuous Actions','进行动作', 'motion_photos_on'], ['Completed Actions','完成动作', 'task_alt'], ['Comparisons','比较', 'compare_arrows'],
  ['Superlatives','最高级', 'emoji_events'], ['Measure Words','量词', 'scale'], ['Location Words','方位词', 'place'],
  ['Direction Words','趋向词', 'navigation'], ['Time Expressions','时间表达', 'schedule'], ['Conditional','条件句', 'rule'],
  ['Because & So','因为所以', 'link'], ['Although & But','虽然但是', 'contrast'], ['When & While','当的时候', 'timelapse'],
  ['Giving Reasons','给理由', 'psychology'], ['Review: Grammar','复习：语法', 'school'],
  ['Describing People','描述人', 'portrait'], ['Describing Places','描述地方', 'landscape'], ['Describing Events','描述事件', 'event'],
  ['Making Plans','制定计划', 'event_note'], ['Giving Advice','提建议', 'lightbulb'], ['Expressing Opinions','表达观点', 'record_voice_over'],
  ['Agreeing & Disagreeing','同意反对', 'thumbs_up_down'], ['Compliments','称赞', 'star'], ['Complaints','抱怨', 'sentiment_dissatisfied'],
  ['Apologies & Forgiveness','道歉原谅', 'volunteer_activism'], ['Invitations','邀请', 'mail'], ['Refusing Politely','礼貌拒绝', 'front_hand'],
  ['Telephone Chinese','电话中文', 'phone'], ['Texting & Chat','短信聊天', 'message'], ['Formal vs Informal','正式非正式', 'switch_account'],
  ['Regional Differences','地区差异', 'public'], ['Young People Slang','年轻人俚语', 'emoji_people'], ['Internet Language','网络语言', 'wifi'],
  ['Chengyu Basics','成语基础', 'menu_book'], ['Review: Intermediate','复习：中级', 'school'],
  ['Business Meetings','商务会议', 'corporate_fare'], ['Presentations','演讲', 'present_to_all'], ['Negotiations','谈判', 'handshake'],
  ['Job Interviews','面试', 'badge'], ['Marketing & Sales','市场营销', 'campaign'], ['Financial Terms','金融术语', 'trending_up'],
  ['Legal Language','法律语言', 'gavel'], ['News & Media','新闻媒体', 'newspaper'], ['Politics & Society','政治社会', 'account_balance'],
  ['History & Culture','历史文化', 'museum'], ['Philosophy & Religion','哲学宗教', 'psychology_alt'], ['Arts & Literature','文学艺术', 'brush'],
  ['Science & Technology','科技', 'science'], ['Environment','环境', 'nature'], ['Education Systems','教育体系', 'cast_for_education'],
  ['Healthcare System','医疗系统', 'local_hospital'], ['Real Estate','房地产', 'apartment'], ['Entertainment Industry','娱乐业', 'theater_comedy'],
  ['Tourism Deep Dive','旅游深入', 'tour'], ['Review: Advanced','复习：高级', 'school'],
  ['Character Basics','汉字基础', 'edit'], ['Character Formation','汉字构成', 'text_snippet'], ['Reading Signs','看标识', 'signpost'],
  ['Reading Menus','看菜单', 'menu_book'], ['Reading Messages','看信息', 'chat_bubble'], ['Short Stories 1','短篇小说1', 'auto_stories'],
  ['Short Stories 2','短篇小说2', 'auto_stories'], ['Famous Fables','著名寓言', 'star'], ['Modern Stories','现代故事', 'book'],
  ['Poetry Basics','诗歌基础', 'format_quote'], ['Tang Poetry','唐诗', 'menu_book'], ['News Articles','新闻文章', 'newspaper'],
  ['Blogs & Social','博客社交', 'rss_feed'], ['Business Documents','商务文件', 'description'], ['Review: Reading','复习：阅读', 'school'],
  ['Natural Flow','自然流利', 'record_voice_over'], ['Storytelling','讲故事', 'auto_stories'], ['Debating','辩论', 'chat'],
  ['Humor & Jokes','幽默笑话', 'mood'], ['Idioms Mastery','成语精通', 'school'], ['Proverbs & Sayings','谚语俗语', 'format_quote'],
  ['Emotional Expression','情感表达', 'favorite'], ['Persuasion','说服', 'campaign'], ['Cultural Nuances','文化细微', 'public'],
  ['Professional Fluency','职业流利', 'business_center'], ['Media Fluency','媒体流利', 'newspaper'], ['Dialect Awareness','方言意识', 'language'],
  ['Classical References','古典引用', 'history_edu'], ['Mastery Challenge','精通挑战', 'military_tech'], ['The Fluent Speaker','流利讲者', 'emoji_events']
];

let order = 21;
for (const [title, titleCn, icon] of titles) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const phase = order <= 40 ? 'beginner' : order <= 60 ? 'intermediate' : order <= 80 ? 'intermediate' : order <= 100 ? 'intermediate' : order <= 120 ? 'advanced' : 'fluent';
  const level = order <= 20 ? 'starter' : order <= 40 ? 'beginner' : order <= 60 ? 'intermediate' : order <= 100 ? 'intermediate' : order <= 120 ? 'advanced' : 'fluent';
  const hsk = order <= 20 ? 1 : order <= 40 ? 2 : order <= 60 ? 3 : order <= 80 ? 3 : order <= 100 ? 4 : order <= 120 ? 5 : 6;
  extra.push({ slug, title, titleCn, hsk, level, phase, category: 'vocabulary', premium: true, icon, desc: `Learn ${title.toLowerCase()} in Chinese.` });
  order++;
}

const allCourses = [...baseCourses, ...extra];
console.log(`Generated ${allCourses.length} courses`);
