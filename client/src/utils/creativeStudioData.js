// ── Hook Frameworks ──────────────────────────────────────────────────────────
export const HOOK_FRAMEWORKS = [
  {
    id: 'pov',
    name: 'POV',
    description: 'First-person perspective that creates immersion',
    template: 'POV: you finally found {product_benefit}',
    examples: [
      'POV: you finally found a sunscreen that doesn\'t leave white cast',
      'POV: your morning routine just got 10x faster',
      'POV: you stopped wasting money on {competitor_category}',
    ],
  },
  {
    id: 'tiktok_made_me',
    name: 'TikTok Made Me Buy',
    description: 'Social proof format — implies viral product',
    template: 'TikTok made me buy this {product_type} and...',
    examples: [
      'TikTok made me buy this and I\'m never going back',
      'TikTok made me try this skincare routine and WOW',
      'I finally bought the thing TikTok wouldn\'t stop showing me',
    ],
  },
  {
    id: 'gatekeeping',
    name: 'Gatekeeping',
    description: 'Creates FOMO — sharing a secret',
    template: 'I\'ve been gatekeeping this {product_type}...',
    examples: [
      'I\'ve been gatekeeping this for months but you NEED to know',
      'Stop gatekeeping! This changed everything for me',
      'The product I\'ve been gatekeeping from everyone',
    ],
  },
  {
    id: 'if_you_struggle',
    name: 'If You Struggle With...',
    description: 'Problem-aware targeting — calls out pain point',
    template: 'If you struggle with {pain_point}, watch this',
    examples: [
      'If you struggle with acne scars, listen up',
      'If you can\'t sleep at night, you need this',
      'If your kitchen always looks messy, try this hack',
    ],
  },
  {
    id: 'unpopular_opinion',
    name: 'Unpopular Opinion',
    description: 'Contrarian take that stops the scroll',
    template: 'Unpopular opinion: {contrarian_take}',
    examples: [
      'Unpopular opinion: you don\'t need expensive skincare',
      'Unpopular opinion: most people do {activity} wrong',
      'Unpopular opinion: this $20 product beats the $200 one',
    ],
  },
  {
    id: 'wait_for_it',
    name: 'Wait For It',
    description: 'Curiosity loop — keeps viewers watching',
    template: 'Watch what happens when I {action}... wait for it',
    examples: [
      'I put this on my face and wait for the 10 second mark',
      'Watch till the end... you won\'t believe the difference',
      'Before and after — wait for it',
    ],
  },
  {
    id: 'things_i_wish',
    name: 'Things I Wish I Knew',
    description: 'Authority/wisdom format — educational angle',
    template: 'Things I wish I knew before {activity}',
    examples: [
      'Things I wish I knew before starting my skincare journey',
      '3 things nobody tells you about {topic}',
      'What I wish someone told me about {product_category}',
    ],
  },
  {
    id: 'green_screen',
    name: 'Green Screen / React',
    description: 'React to content — high engagement format',
    template: '[Reacting to] {content_description}',
    examples: [
      'Reacting to my followers\' routines',
      'Let me show you why this went viral',
      'I tested every viral product so you don\'t have to',
    ],
  },
  {
    id: 'storytime',
    name: 'Storytime',
    description: 'Narrative hook — personal story format',
    template: 'Storytime: how {personal_story}',
    examples: [
      'Storytime: how I cleared my skin in 2 weeks',
      'The craziest thing happened when I tried this',
      'Story time: I found this at a random store and...',
    ],
  },
  {
    id: 'direct_cta',
    name: 'Direct CTA',
    description: 'Straight to the point — works for retargeting',
    template: 'Stop scrolling — {value_prop}',
    examples: [
      'Stop scrolling if you want clearer skin',
      'Drop everything — this sale ends tonight',
      'You\'re about to discover your new favorite {product}',
    ],
  },
];

// ── Ad Templates / Structures ────────────────────────────────────────────────
export const AD_TEMPLATES = [
  {
    id: 'ugc_review',
    name: 'UGC Review',
    description: 'Person-to-camera product review. Most versatile format.',
    duration: '15-30s',
    difficulty: 'Easy',
    bestFor: ['E-commerce', 'DTC', 'Beauty', 'Health'],
    scenes: [
      { time: '0-3s', type: 'hook', visual: 'Close-up of person talking to camera', audio: 'Hook line — stop the scroll', note: 'Pattern interrupt. Bold claim or question.' },
      { time: '3-8s', type: 'problem', visual: 'Show the problem / frustration', audio: 'Describe the pain point', note: 'Make it relatable. "I used to struggle with..."' },
      { time: '8-15s', type: 'solution', visual: 'Show the product + using it', audio: 'Introduce the product naturally', note: 'Don\'t sound like an ad. Be genuine.' },
      { time: '15-22s', type: 'proof', visual: 'Results / before-after / demo', audio: 'Share specific results', note: 'Numbers and specifics convert. "In just 2 weeks..."' },
      { time: '22-30s', type: 'cta', visual: 'Product shot or person endorsing', audio: 'Call to action', note: 'Urgency helps. "Link in bio" or "tap the button"' },
    ],
  },
  {
    id: 'problem_solution',
    name: 'Problem → Solution',
    description: 'Start with pain, end with your product fixing it.',
    duration: '15-20s',
    difficulty: 'Easy',
    bestFor: ['Kitchen', 'Cleaning', 'Fitness', 'Productivity'],
    scenes: [
      { time: '0-3s', type: 'hook', visual: 'Show the problem dramatically', audio: 'Frustrated tone or text overlay', note: 'Exaggerate the problem slightly for effect' },
      { time: '3-5s', type: 'transition', visual: 'Quick cut or transition effect', audio: '"But then I found this..."', note: 'Classic TikTok transition works here' },
      { time: '5-12s', type: 'demo', visual: 'Product in action solving the problem', audio: 'Explain how it works (briefly)', note: 'Show, don\'t tell. Satisfying visuals.' },
      { time: '12-15s', type: 'result', visual: 'Clean result / satisfied reaction', audio: 'React to the result', note: 'Genuine reaction sells' },
      { time: '15-20s', type: 'cta', visual: 'Product with price/offer', audio: 'CTA + urgency', note: 'Keep it casual, not salesy' },
    ],
  },
  {
    id: 'before_after',
    name: 'Before / After',
    description: 'Dramatic transformation. Extremely shareable.',
    duration: '10-20s',
    difficulty: 'Medium',
    bestFor: ['Beauty', 'Fitness', 'Home', 'Cleaning'],
    scenes: [
      { time: '0-2s', type: 'hook', visual: 'Text: "Before vs After" + before state', audio: 'Trending sound or voiceover hook', note: 'Start with the "before" to create contrast' },
      { time: '2-5s', type: 'before', visual: 'Show the "before" state clearly', audio: 'Describe current state', note: 'Make it as relatable/dramatic as possible' },
      { time: '5-8s', type: 'process', visual: 'Quick montage of using product', audio: 'Keep it fast-paced', note: 'Time-lapse or quick cuts work great' },
      { time: '8-15s', type: 'after', visual: 'Reveal the "after" — dramatic cut', audio: 'Reaction / wow moment', note: 'This is the money shot. Make it satisfying.' },
      { time: '15-20s', type: 'cta', visual: 'Product + where to buy', audio: 'Soft CTA', note: 'Let the result speak for itself' },
    ],
  },
  {
    id: 'unboxing',
    name: 'Unboxing / ASMR',
    description: 'Satisfying unboxing experience. Great for premium products.',
    duration: '15-30s',
    difficulty: 'Easy',
    bestFor: ['E-commerce', 'Subscription', 'Tech', 'Fashion'],
    scenes: [
      { time: '0-3s', type: 'hook', visual: 'Package arriving / hands on box', audio: 'ASMR sounds or "This just arrived..."', note: 'Curiosity gap — what\'s in the box?' },
      { time: '3-10s', type: 'unbox', visual: 'Opening the package, unwrapping', audio: 'Satisfying sounds + brief narration', note: 'Slow, deliberate movements. ASMR vibes.' },
      { time: '10-18s', type: 'reveal', visual: 'Show each item / product close-up', audio: 'Genuine first reactions', note: 'Authentic excitement sells' },
      { time: '18-25s', type: 'use', visual: 'Quick demo or wearing/using it', audio: 'First impressions', note: 'Show it in action immediately' },
      { time: '25-30s', type: 'cta', visual: 'Everything laid out / product hero', audio: 'Where to get it', note: 'Include any discount code' },
    ],
  },
  {
    id: 'listicle',
    name: 'Listicle / Top 3',
    description: 'Numbered list format. High completion rate.',
    duration: '20-40s',
    difficulty: 'Easy',
    bestFor: ['Any product', 'Multi-product', 'Education'],
    scenes: [
      { time: '0-3s', type: 'hook', visual: 'Text: "3 reasons you need this"', audio: 'Hook that promises value', note: 'Numbered hooks increase completion rate' },
      { time: '3-10s', type: 'point_1', visual: 'Reason #1 with visual proof', audio: 'Explain first benefit', note: 'Start with the most compelling reason' },
      { time: '10-18s', type: 'point_2', visual: 'Reason #2 with visual proof', audio: 'Explain second benefit', note: 'Build on the first point' },
      { time: '18-25s', type: 'point_3', visual: 'Reason #3 — the closer', audio: 'The "but wait there\'s more" moment', note: 'Save the most shareable reason for last' },
      { time: '25-30s', type: 'cta', visual: 'Product shot + offer', audio: 'CTA', note: '"And the best part? It\'s only $X"' },
    ],
  },
  {
    id: 'spark_native',
    name: 'Spark Ad (Native Post)',
    description: 'Looks like an organic post. Boost existing content.',
    duration: '10-60s',
    difficulty: 'Low',
    bestFor: ['Brand awareness', 'Social proof', 'Creator content'],
    scenes: [
      { time: '0-3s', type: 'hook', visual: 'Native TikTok content opening', audio: 'Natural/trending sound', note: 'Should look 100% organic, not produced' },
      { time: '3-end', type: 'content', visual: 'Organic content featuring product', audio: 'Creator\'s natural voice/style', note: 'The less it looks like an ad, the better. Let creators be themselves.' },
    ],
  },
];

// ── CTA Variations ───────────────────────────────────────────────────────────
export const CTA_STYLES = [
  { id: 'soft', name: 'Soft CTA', examples: ['Link in bio', 'Check it out', 'You can find it here'] },
  { id: 'urgency', name: 'Urgency', examples: ['Sale ends tonight', 'Limited stock', 'Only 100 left'] },
  { id: 'social_proof', name: 'Social Proof', examples: ['Join 50K+ happy customers', '4.9 stars with 10K reviews', 'Sold out 3x already'] },
  { id: 'discount', name: 'Discount', examples: ['Use code TIKTOK for 20% off', 'Buy 2 get 1 free', 'Free shipping today only'] },
  { id: 'fomo', name: 'FOMO', examples: ['Everyone\'s talking about this', 'This is going viral for a reason', 'Don\'t miss this'] },
];

// ── Text Overlay Styles ──────────────────────────────────────────────────────
export const TEXT_OVERLAY_STYLES = [
  { id: 'bold_white', name: 'Bold White', className: 'font-black text-white text-shadow-lg', preview: 'text-white font-black' },
  { id: 'caption_bar', name: 'Caption Bar', className: 'bg-black/80 text-white px-3 py-1 rounded', preview: 'bg-black text-white px-2 rounded' },
  { id: 'highlight', name: 'Highlighted', className: 'bg-yellow-400 text-black px-2 font-bold', preview: 'bg-yellow-400 text-black px-2 font-bold' },
  { id: 'outline', name: 'Outline', className: 'text-white font-black text-stroke', preview: 'text-white font-black' },
  { id: 'gradient', name: 'Gradient BG', className: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white px-3 py-1 rounded-full font-bold', preview: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white px-2 rounded-full font-bold' },
  { id: 'minimal', name: 'Minimal', className: 'text-white/90 text-sm font-medium', preview: 'text-white/90 font-medium' },
];
