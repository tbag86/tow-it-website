// Vini — Towit.ai AI Chat Assistant
// Self-contained rule-based conversational bot. No external API calls needed.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { messages } = req.body || {};

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, error: 'Messages array required' });
  }

  // Get the latest user message
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  if (!lastUserMsg) {
    return res.status(400).json({ success: false, error: 'No user message found' });
  }

  const userText = lastUserMsg.content.toLowerCase().trim();
  const turnCount = messages.filter(m => m.role === 'assistant').length;

  const reply = getViniReply(userText, turnCount, messages);

  return res.status(200).json({ success: true, message: reply });
}

// ─── Vini's brain ────────────────────────────────────────────────────────────

function getViniReply(text, turn, history) {

  // ── Greetings ──
  if (matches(text, ['hello', 'hi', 'hey', 'morning', 'afternoon', 'evening', 'hiya', 'yo'])) {
    const greets = [
      "Hey there! 👋 Great to have you here. I'm Vini, Towit.ai's assistant. We're building the UK's first AI-powered vehicle transport network. Are you looking to move a vehicle, or are you a driver/transporter looking for work?",
      "Hi! Welcome to Towit.ai 😊 We're the UK's first AI-powered vehicle transport platform — still in pre-launch but growing fast. What brings you here today?",
    ];
    return pick(greets);
  }

  // ── How does it work ──
  if (matches(text, ['how does it work', 'how does this work', 'how it works', 'what is this', 'what do you do', 'explain', 'tell me more', 'what is towit', 'how does towit work'])) {
    return "It's brilliantly simple! 🚗 You send a WhatsApp message telling us what you need — pick-up and drop-off, vehicle details — and our AI gives you an instant quote. Book it, and we match you with a vetted, insured transport partner. You get real-time updates all the way. No app, no forms, just a WhatsApp message. We're in pre-launch right now — want to grab your spot on the waitlist?\n[SHOW_WAITLIST_BUTTON]";
  }

  // ── Pricing ──
  if (matches(text, ['price', 'pricing', 'cost', 'how much', 'charge', 'rate', 'fee', 'cheap', 'expensive', 'quote', 'per mile'])) {
    return "Pricing is per mile, which keeps things transparent 💰 At launch: **Standard** is £1.75/mile, **Pro** (dealers & frequent users) is £1.50/mile, and **Enterprise** is a custom rate for high-volume fleet work. No hidden fees — what you're quoted is what you pay. Want to lock in early access?\n[SHOW_WAITLIST_BUTTON]";
  }

  // ── For dealers / trade ──
  if (matches(text, ['dealer', 'dealership', 'trade', 'auction', 'fleet', 'multiple', 'bulk', 'cars regularly', 'lots of cars', 'many vehicles'])) {
    return "Perfect — Towit.ai was built with dealers in mind 🏎️ Our Pro tier at £1.50/mile is designed for dealers and frequent movers. Auction collections, stock movements, customer deliveries — all handled through one WhatsApp number with full tracking. Enterprise pricing is available for larger fleets too. Shall I get you on the waitlist for early access?\n[SHOW_WAITLIST_BUTTON]";
  }

  // ── For drivers / transporters ──
  if (matches(text, ['driver', 'transporter', 'transport company', 'carrier', 'work', 'job', 'earn', 'income', 'join as', 'sign up as driver', 'i drive', 'i transport', 'we transport', 'recovery', 'truck'])) {
    return "Great news — we're building our driver and transport network right now! 🚚 As a Towit.ai transport partner, you get a consistent stream of matched jobs, no chasing for work, transparent per-mile pay, and flexibility to work on your terms. Whether you're a solo transporter or a company with multiple trucks, there's a place for you. Join the waitlist and we'll be in touch as we expand into your area.\n[SHOW_WAITLIST_BUTTON]";
  }

  // ── When launching / available ──
  if (matches(text, ['when', 'launch', 'live', 'available', 'release', 'open', 'start', 'begin', 'ready', 'go live', 'coming soon'])) {
    return "We're launching later this year and things are moving fast! 🚀 The waitlist is growing daily and early members will get priority access — possibly at better rates too. It only takes 30 seconds to secure your spot. Want to jump on?\n[SHOW_WAITLIST_BUTTON]";
  }

  // ── WhatsApp ──
  if (matches(text, ['whatsapp', 'phone', 'app', 'download', 'mobile', 'no app', 'no download'])) {
    return "No app downloads needed! 📱 Towit.ai runs entirely through WhatsApp — something everyone already has. Just send a message, get a quote, confirm, and track your vehicle. We kept it simple on purpose because the best tech is the kind you don't notice. Join the waitlist to be first to get our WhatsApp number when we launch.\n[SHOW_WAITLIST_BUTTON]";
  }

  // ── Waitlist / sign up ──
  if (matches(text, ['waitlist', 'sign up', 'join', 'register', 'early access', 'how to sign', 'get access', 'interested', 'sounds good', 'love it', 'great'])) {
    return "Brilliant! 🎉 Just hit the button below and it only takes about 30 seconds — name, email, mobile, and what you'll use Towit.ai for. We'll be in touch as soon as we launch in your area!\n[SHOW_WAITLIST_BUTTON]";
  }

  // ── Where / coverage / UK ──
  if (matches(text, ['where', 'location', 'uk', 'england', 'scotland', 'wales', 'nationwide', 'north', 'south', 'london', 'manchester', 'birmingham', 'coverage', 'area', 'region'])) {
    return "We cover the whole of the UK 🇬🇧 — England, Scotland, and Wales. Our transport partner network spans the entire country, so whether you're in London or Inverness, we've got you covered. We're launching nationwide, not just in select cities. Secure your spot on the waitlist and we'll confirm coverage in your area!\n[SHOW_WAITLIST_BUTTON]";
  }

  // ── Safety / trust / vetted ──
  if (matches(text, ['safe', 'trust', 'insured', 'vetted', 'legit', 'reliable', 'damage', 'insurance', 'guarantee', 'quality', 'professional'])) {
    return "Safety is everything to us 🛡️ Every transport partner in our network is fully vetted, insured, and professionally rated. We don't let just anyone onto the platform — drivers are screened and reviewed. Your vehicle is tracked in real-time throughout the journey, and you've got 24/7 AI support if anything comes up. Would you like to join the waitlist?\n[SHOW_WAITLIST_BUTTON]";
  }

  // ── International ──
  if (matches(text, ['international', 'europe', 'abroad', 'overseas', 'import', 'export', 'france', 'spain', 'germany'])) {
    return "Yes, we handle international vehicle transport too! 🌍 Imports, exports, and cross-border movements across Europe. It's a service we're building out from launch. The core platform launches in the UK first — join the waitlist and you'll be updated on all the services as they go live.\n[SHOW_WAITLIST_BUTTON]";
  }

  // ── Tracking ──
  if (matches(text, ['track', 'tracking', 'where is my car', 'live', 'real time', 'update', 'notification'])) {
    return "Real-time tracking is built in from day one 📍 You'll get updates throughout the journey — collection confirmed, en route, delivered. All through WhatsApp, no app needed. Peace of mind the whole way. Sound good? Join the waitlist to be first on the platform!\n[SHOW_WAITLIST_BUTTON]";
  }

  // ── AI / technology ──
  if (matches(text, ['ai', 'artificial intelligence', 'technology', 'tech', 'how is it powered', 'smart', 'automated', 'algorithm'])) {
    return "The AI is what makes Towit.ai different 🤖 It handles instant quoting, smart job matching (right driver, right equipment, right location), route optimisation, and 24/7 customer support — all automatically. No middlemen, no call centres, no waiting. It makes transport faster and cheaper for everyone. Excited? Grab your spot on the waitlist!\n[SHOW_WAITLIST_BUTTON]";
  }

  // ── Negative / concerns ──
  if (matches(text, ['not sure', 'not interested', 'no thanks', 'maybe later', 'not right now', 'think about it'])) {
    return "No worries at all! 😊 If you ever need a vehicle moved or want to know more, I'm here. You can also join the waitlist at any point — it's completely free and no commitment required. Anything else I can help with?";
  }

  // ── Thanks / bye ──
  if (matches(text, ['thanks', 'thank you', 'cheers', 'bye', 'goodbye', 'see you', 'ta', 'perfect', 'brilliant'])) {
    return "You're welcome! 👋 If you ever want to move a vehicle or have more questions, just pop back. Don't forget you can join our waitlist — it's free and takes 30 seconds!\n[SHOW_WAITLIST_BUTTON]";
  }

  // ── Frustrated / not working ──
  if (matches(text, ['not working', 'broken', 'bug', 'error', 'issue', 'problem', 'help', 'stuck'])) {
    return "Sorry to hear that! 🙁 We're still in pre-launch so things are being polished. If you'd like to share feedback, joining the waitlist is the best way — early members help shape the platform. Alternatively, feel free to drop us a message directly via the WhatsApp button on the site.\n[SHOW_WAITLIST_BUTTON]";
  }

  // ── Fallback — turn 1 or 2 ──
  if (turn < 2) {
    return "Great question! Towit.ai is the UK's first AI-powered vehicle transport platform — instant quotes, vetted drivers, and all managed through WhatsApp. We're in pre-launch right now. Are you looking to move a vehicle, or are you a transport professional looking for work?";
  }

  // ── Fallback — later turns, nudge toward waitlist ──
  const fallbacks = [
    "That's a good one — I want to make sure I give you the right answer. The best thing to do is join our waitlist and we'll be in touch with everything you need to know! It only takes 30 seconds. 😊\n[SHOW_WAITLIST_BUTTON]",
    "Hmm, I want to be honest — I'm not sure I have the perfect answer for that one! But if you join our waitlist, our team will be able to help you directly when we launch. It's free and takes 30 seconds.\n[SHOW_WAITLIST_BUTTON]",
    "That's something our team can help you with properly when we launch! Join the waitlist and be among the first to get access — plus you can ask anything you like then. 🚗\n[SHOW_WAITLIST_BUTTON]",
  ];
  return pick(fallbacks);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function matches(text, keywords) {
  return keywords.some(kw => text.includes(kw));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
