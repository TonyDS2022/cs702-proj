/**
 * posts.js
 *
 * 36 seed posts (30 exposure + 6 new-only distractors) across the 10 categories
 * used in the Ruiz et al. paper:
 *   Art, Cooking, Learning, Sports, Personal Development,
 *   Entrepreneurship, Technology, Yoga, Research, Hobbies
 *
 * Images use picsum.photos (free, no attribution needed) with fixed seeds so
 * the same image always maps to the same post.
 *
 * isExposure: true  → shown during the browsing session
 * isExposure: false → shown ONLY in the memory test as "new" distractors
 */

const POSTS = [
  // ── ART ──────────────────────────────────────────────────────────────────
  {
    id: 'art-01', category: 'Art', isExposure: true,
    username: 'r/painting',
    handle: 'u/LisaMcIntosh',
    timeAgo: '3 hours ago',
    image: 'https://picsum.photos/seed/art01/600/400',
    title: 'Crafting My Own Dinner Plate',
    body: 'Decided to make my own dinner plate out of clay. Used a spinning wheel to shape it. Picked earthy colors for painting. Put it in a hot oven to make it strong. Now my plate is ready—not just for meals, but for stories and smiles too.',
  },
  {
    id: 'art-02', category: 'Art', isExposure: true,
    username: 'r/drawing',
    handle: 'u/MarcoFerri',
    timeAgo: '5 hours ago',
    image: 'https://picsum.photos/seed/art02/600/400',
    title: 'Six Months of Watercolor Practice',
    body: 'Started painting in January with zero experience. Today I finished my 24th piece and I can actually see the progress. The key was painting every single day, even when it looked terrible. Sharing my January vs. June comparison below.',
  },
  {
    id: 'art-03', category: 'Art', isExposure: false,
    username: 'r/sculpting',
    handle: 'u/NadiaKowalski',
    timeAgo: '1 day ago',
    image: 'https://picsum.photos/seed/art03/600/400',
    title: 'First Bronze Cast – Lost Wax Method',
    body: 'After months of prep work, my studio finally let me try lost-wax casting. The surface texture came out better than expected. Already designing the next piece.',
  },

  // ── COOKING ──────────────────────────────────────────────────────────────
  {
    id: 'cook-01', category: 'Cooking', isExposure: true,
    username: 'r/cooking',
    handle: 'u/AnaBenitez',
    timeAgo: '2 hours ago',
    image: 'https://picsum.photos/seed/cook01/600/400',
    title: 'Homemade Sourdough – Finally Nailed the Crust',
    body: 'After 12 failed loaves I finally got that crispy crackling crust. The secret was a Dutch oven and a longer cold ferment in the fridge (18 hours). Recipe in the comments for anyone who wants it.',
  },
  {
    id: 'cook-02', category: 'Cooking', isExposure: true,
    username: 'r/mealprep',
    handle: 'u/TomaszWiecek',
    timeAgo: '4 hours ago',
    image: 'https://picsum.photos/seed/cook02/600/400',
    title: 'Sunday Meal Prep: 5 Lunches in 45 Minutes',
    body: 'Grain bowl base (quinoa + roasted veg), three different protein toppings, and two sauces. Mix and match all week. Total cost was around €15 for 5 meals. Breakdown in the thread.',
  },
  {
    id: 'cook-03', category: 'Cooking', isExposure: false,
    username: 'r/baking',
    handle: 'u/PriyaMehta',
    timeAgo: '6 hours ago',
    image: 'https://picsum.photos/seed/cook03/600/400',
    title: 'Japanese Milk Bread: Tangzhong Method',
    body: 'Used the tangzhong starter (flour + water paste) for the first time. The texture is cloud-soft even on day three. This is now my permanent sandwich bread recipe.',
  },

  // ── LEARNING ─────────────────────────────────────────────────────────────
  {
    id: 'learn-01', category: 'Learning', isExposure: true,
    username: 'r/learnprogramming',
    handle: 'u/BeauFernandez',
    timeAgo: '7 hours ago',
    image: 'https://picsum.photos/seed/learn01/600/400',
    title: 'Learned a New GeoGuessr Trick!',
    body: 'So last week I decided to become better at GeoGuessr. It turns out the quality of the image can give you many clues. In short: there are a few factors you can narrow down with that simple fact. I will be posting my GeoGuessr learning journey here, so follow if interested!',
  },
  {
    id: 'learn-02', category: 'Learning', isExposure: true,
    username: 'r/getdisciplined',
    handle: 'u/YukiTanaka',
    timeAgo: '9 hours ago',
    image: 'https://picsum.photos/seed/learn02/600/400',
    title: 'How I Passed My JLPT N3 in 8 Months',
    body: 'Started from hiragana. Used Anki for vocabulary (20 cards/day), immersion podcasts during commutes, and handwriting practice for kanji. The speaking component is what surprised me most—shadowing really works.',
  },
  {
    id: 'learn-03', category: 'Learning', isExposure: false,
    username: 'r/math',
    handle: 'u/OliverGrant',
    timeAgo: '11 hours ago',
    image: 'https://picsum.photos/seed/learn03/600/400',
    title: 'Revisiting Calculus at 35 – Week 8 Update',
    body: 'Never understood derivatives in high school. Eight weeks of YouTube + Khan Academy later and I just solved my first related-rates problem. Late blooming is still blooming.',
  },

  // ── SPORTS ───────────────────────────────────────────────────────────────
  {
    id: 'sport-01', category: 'Sports', isExposure: true,
    username: 'r/running',
    handle: 'u/KarolinaB',
    timeAgo: '1 hour ago',
    image: 'https://picsum.photos/seed/sport01/600/400',
    title: 'Sub-2-Hour Half Marathon – Crossed It Off the List',
    body: 'Trained for 16 weeks using the 80/20 plan (mostly easy miles, two quality sessions per week). Finished in 1:58:34. The last 3 km were brutal but I held on. Next goal: full marathon in October.',
  },
  {
    id: 'sport-02', category: 'Sports', isExposure: true,
    username: 'r/climbing',
    handle: 'u/DanielOsei',
    timeAgo: '3 hours ago',
    image: 'https://picsum.photos/seed/sport02/600/400',
    title: 'Lead Climbing Outdoors for the First Time',
    body: "Took the transition from gym to crag last weekend. Route reading is a completely different skill when the holds aren't color-coded. Fell twice but clipped all the draws. Cannot wait to go back.",
  },
  {
    id: 'sport-03', category: 'Sports', isExposure: false,
    username: 'r/cycling',
    handle: 'u/FinnMurphy',
    timeAgo: '5 hours ago',
    image: 'https://picsum.photos/seed/sport03/600/400',
    title: '100 km Gravel Ride – Lessons Learned',
    body: 'Fueling every 45 minutes made a bigger difference than I expected. Also: tire pressure matters more on gravel than road. Wrote up a full debrief for anyone planning their first century.',
  },

  // ── PERSONAL DEVELOPMENT ─────────────────────────────────────────────────
  {
    id: 'pd-01', category: 'Personal Development', isExposure: true,
    username: 'r/selfimprovement',
    handle: 'u/SophieLeroy',
    timeAgo: '2 hours ago',
    image: 'https://picsum.photos/seed/pd01/600/400',
    title: 'One Year of Daily Journaling – What Changed',
    body: 'I started because I was anxious all the time. A year in, I re-read the first entries and barely recognize that version of myself. Three things that actually helped: morning pages, weekly review, and writing without editing.',
  },
  {
    id: 'pd-02', category: 'Personal Development', isExposure: true,
    username: 'r/productivity',
    handle: 'u/IsaacNwosu',
    timeAgo: '6 hours ago',
    image: 'https://picsum.photos/seed/pd02/600/400',
    title: 'Why I Quit the Inbox-Zero Obsession',
    body: 'Spending 40 minutes a day on email to hit zero was costing me two deep-work sessions per week. I now check twice a day, ignore <24-hour non-urgent messages, and my output actually improved.',
  },
  {
    id: 'pd-03', category: 'Personal Development', isExposure: false,
    username: 'r/habits',
    handle: 'u/AmiraEid',
    timeAgo: '8 hours ago',
    image: 'https://picsum.photos/seed/pd03/600/400',
    title: 'The 2-Minute Rule Actually Works – 90-Day Report',
    body: 'If it takes less than 2 minutes, do it now. Sounds trivial but applying this religiously cleared a backlog of micro-tasks that were giving me low-grade stress for months.',
  },

  // ── ENTREPRENEURSHIP ─────────────────────────────────────────────────────
  {
    id: 'ent-01', category: 'Entrepreneurship', isExposure: true,
    username: 'r/startups',
    handle: 'u/GunnerPankraz',
    timeAgo: '4 hours ago',
    image: 'https://picsum.photos/seed/ent01/600/400',
    title: 'Embarking on a New Journey: Launching EcoTech Innovations',
    body: 'Exciting News! Today marks the beginning of a new chapter as I officially launch my startup, EcoTech Innovations. The journey from ideation to execution has been an exhilarating adventure, and I\'m thrilled to share the vision behind this endeavour.',
  },
  {
    id: 'ent-02', category: 'Entrepreneurship', isExposure: true,
    username: 'r/entrepreneur',
    handle: 'u/RachelChung',
    timeAgo: '10 hours ago',
    image: 'https://picsum.photos/seed/ent02/600/400',
    title: 'Hit €10k MRR – Here\'s What Actually Worked',
    body: 'No growth hacks. The three things: weekly customer calls to identify churn risk, a referral program with real incentives, and ruthlessly cutting features no one paid for. Full breakdown in the post.',
  },
  {
    id: 'ent-03', category: 'Entrepreneurship', isExposure: false,
    username: 'r/smallbusiness',
    handle: 'u/MarcosVila',
    timeAgo: '1 day ago',
    image: 'https://picsum.photos/seed/ent03/600/400',
    title: 'From Freelancer to Agency in 18 Months',
    body: 'The hardest part wasn\'t getting clients—it was learning to delegate. I kept doing the work myself instead of building systems. Once I accepted that \'good enough\' from a team beats \'perfect\' from me alone, everything shifted.',
  },

  // ── TECHNOLOGY ───────────────────────────────────────────────────────────
  {
    id: 'tech-01', category: 'Technology', isExposure: true,
    username: 'r/technology',
    handle: 'u/DevPrakash',
    timeAgo: '2 hours ago',
    image: 'https://picsum.photos/seed/tech01/600/400',
    title: 'Launched My First App!',
    body: 'After three months of evenings and weekends, my personal finance tracker just went live on the App Store. Built with React Native and a Node backend. 47 downloads in the first day—small number but huge feeling.',
  },
  {
    id: 'tech-02', category: 'Technology', isExposure: true,
    username: 'r/webdev',
    handle: 'u/SaraVogel',
    timeAgo: '5 hours ago',
    image: 'https://picsum.photos/seed/tech02/600/400',
    title: 'Why I Switched from REST to tRPC',
    body: 'Type safety end-to-end without writing a single schema file. The DX improvement is real. If your frontend and backend share a TypeScript codebase, the migration is worth the afternoon it takes.',
  },
  {
    id: 'tech-03', category: 'Technology', isExposure: false,
    username: 'r/programming',
    handle: 'u/KimJinsu',
    timeAgo: '7 hours ago',
    image: 'https://picsum.photos/seed/tech03/600/400',
    title: 'Built a Terminal Dashboard for My Home Server',
    body: 'Using Bubble Tea (Go TUI library). Shows CPU, RAM, disk, and network stats with color-coded graphs. Took a Sunday afternoon and I now check it more than my phone.',
  },

  // ── YOGA ─────────────────────────────────────────────────────────────────
  {
    id: 'yoga-01', category: 'Yoga', isExposure: true,
    username: 'r/yoga',
    handle: 'u/ClaraPaez',
    timeAgo: '3 hours ago',
    image: 'https://picsum.photos/seed/yoga01/600/400',
    title: '30-Day Morning Yoga Challenge – Day 30 ✓',
    body: 'Started this to fix back pain from desk work. The back pain is mostly gone but the unexpected win is that I fall asleep in under 10 minutes now. I\'ll keep going beyond 30 days. Happy to share the sequence I followed.',
  },
  {
    id: 'yoga-02', category: 'Yoga', isExposure: true,
    username: 'r/flexibility',
    handle: 'u/MiloHansen',
    timeAgo: '8 hours ago',
    image: 'https://picsum.photos/seed/yoga02/600/400',
    title: 'Finally Got My Full Splits – 14 Months In',
    body: 'Consistency over intensity. I stretched every single evening for about 8–12 minutes. The last 10% of range was the hardest and took the longest. Video comparison in the comments.',
  },
  {
    id: 'yoga-03', category: 'Yoga', isExposure: false,
    username: 'r/meditation',
    handle: 'u/FreyaLindgren',
    timeAgo: '12 hours ago',
    image: 'https://picsum.photos/seed/yoga03/600/400',
    title: 'Integrating Pranayama with Yin Practice',
    body: 'Holding poses for 3–5 minutes while using box breathing completely changes the experience. The parasympathetic shift is noticeable within the first sequence. Sharing my favorite 45-min flow.',
  },

  // ── RESEARCH ─────────────────────────────────────────────────────────────
  {
    id: 'res-01', category: 'Research', isExposure: true,
    username: 'r/science',
    handle: 'u/DrLenaHoffman',
    timeAgo: '6 hours ago',
    image: 'https://picsum.photos/seed/res01/600/400',
    title: 'Our Lab Just Published in Nature Communications',
    body: 'Three years of data collection and two rounds of peer review later—our paper on deep-sea microbial communities is out. Open access. Link in bio for anyone interested in ocean biogeochemistry.',
  },
  {
    id: 'res-02', category: 'Research', isExposure: true,
    username: 'r/datascience',
    handle: 'u/CarlosBravo',
    timeAgo: '9 hours ago',
    image: 'https://picsum.photos/seed/res02/600/400',
    title: 'Why Your Accuracy Metric is Lying to You',
    body: 'On a dataset that\'s 95% class A, a model that predicts A every time gets 95% accuracy. This post walks through precision, recall, F1, and AUC with visual examples so you\'ll never fall for it again.',
  },
  {
    id: 'res-03', category: 'Research', isExposure: false,
    username: 'r/psychology',
    handle: 'u/ElsaFischer',
    timeAgo: '1 day ago',
    image: 'https://picsum.photos/seed/res03/600/400',
    title: 'The Replication Crisis in Plain Language',
    body: 'More than half of psychology studies couldn\'t be reproduced in a large-scale effort. This thread explains why it happened, what\'s changed since, and how to read findings more critically.',
  },

  // ── HOBBIES ──────────────────────────────────────────────────────────────
  {
    id: 'hob-01', category: 'Hobbies', isExposure: true,
    username: 'r/woodworking',
    handle: 'u/PatrikStrom',
    timeAgo: '4 hours ago',
    image: 'https://picsum.photos/seed/hob01/600/400',
    title: 'Built My First Bookshelf – Mortise and Tenon Joints',
    body: 'No screws. The joinery holds the whole thing together. Took twice as long as a screw build would have but the satisfaction is on another level. Using white oak with a linseed oil finish.',
  },
  {
    id: 'hob-02', category: 'Hobbies', isExposure: true,
    username: 'r/boardgames',
    handle: 'u/JessicaNair',
    timeAgo: '7 hours ago',
    image: 'https://picsum.photos/seed/hob02/600/400',
    title: 'Designed My Own Board Game – Playtesting Round 5',
    body: 'It started as a napkin sketch two years ago. Five rounds of playtesting have completely changed the victory conditions and card economy. Still feels broken in 4-player mode. Documenting the whole design process here.',
  },
  {
    id: 'hob-03', category: 'Hobbies', isExposure: false,
    username: 'r/birdwatching',
    handle: 'u/TeresaQuinn',
    timeAgo: '10 hours ago',
    image: 'https://picsum.photos/seed/hob03/600/400',
    title: 'Life List Hit 300 – Spotted a Black Stork',
    body: 'Saw my first Black Stork at a marshland reserve this morning. Incredibly rare this far west. The silent glide over the water was one of those moments I\'ll remember for years.',
  },
];

/** The 30 posts shown during the exposure (browsing) phase */
export const EXPOSURE_POSTS = POSTS.filter(p => p.isExposure);

/** All 36 posts (used to build the memory recognition test) */
export const ALL_POSTS = POSTS;

/**
 * Returns a shuffled memory test pool:
 *   - 20 randomly sampled exposure posts (marked as "old")
 *   - all 6 distractor posts            (marked as "new")
 * Shuffled so "old" and "new" items are intermixed.
 */
export function buildMemoryTestPool(seenPostIds) {
  const seenSet = new Set(seenPostIds);

  const oldItems = EXPOSURE_POSTS
    .filter(p => seenSet.has(p.id))
    .slice(0, 20)
    .map(p => ({ ...p, memoryLabel: 'old' }));

  const newItems = POSTS
    .filter(p => !p.isExposure)
    .map(p => ({ ...p, memoryLabel: 'new' }));

  const pool = [...oldItems, ...newItems];
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

export default POSTS;
