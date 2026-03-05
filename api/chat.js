// Vini — Towit.ai AI Chat Assistant
// Uses Google Gemini when GEMINI_API_KEY env var is set; smart keyword fallback otherwise.
// NOTE: Never hardcode API keys — set GEMINI_API_KEY in Vercel environment variables.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Smart keyword-based fallback — covers all common questions without needing an API key
function getSmartFallbackResponse(messages) {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  if (!lastUserMsg) return null;

  const msg = lastUserMsg.content.toLowerCase().trim();
  const msgCount = messages.filter(m => m.role === 'user').length;

  if (msgCount === 1 && msg.match(/(^(hi|hello|hey|yo|sup|hiya|howdy))|(just seen|instagram|seen this|what (do you do|is this|is towit|are you)|tell me more|whats this|what's this)/)) {
    return "Hey there! 👋 Great to have you here. Towit.ai is building the UK's first AI-powered vehicle transport network — we connect people who need a vehicle moved with vetted, insured transport professionals right across the UK. Everything runs through WhatsApp, so there's no app to download — just a quick message and we handle the rest. Are you looking to get a vehicle moved, or are you a driver or transport company?";
  }
  if (msg.match(/price|pricing|cost|how much|rates?|charge|£|per mile/)) {
    return "Our pricing is simple and fully transparent — from launch it'll be £1.75/mile on Standard, or £1.50/mile on Pro (perfect for dealers and frequent users). Enterprise clients get custom rates. No hidden fees, ever. Want to lock in your spot on the waitlist? 😊\n[SHOW_WAITLIST_BUTTON]";
  }
  if (msg.match(/how (does it|do you|does this|it) work|how to use|process|steps/)) {
    return "Dead simple — WhatsApp us with your collection and delivery details, our AI quotes you instantly, you confirm, and we handle the rest. You'll get real-time updates throughout and your vehicle arrives safely with a vetted, insured driver. No apps, no lengthy forms. Want early access? 🚗\n[SHOW_WAITLIST_BUTTON]";
  }
  if (msg.match(/dealer|dealership|trade|fleet|auction|multiple vehicles/)) {
    return "We've built Towit.ai very much with dealers and fleet managers in mind. Pro tier at £1.50/mile gives you reliable, trackable transport — and high-volume accounts can arrange custom Enterprise pricing. You'd be one of the first dealers on the platform by joining the waitlist now. Want to secure your spot? 🏎️\n[SHOW_WAITLIST_BUTTON]";
  }
  if (msg.match(/driver|transporter|transport company|earn|work|jobs|sign up as a driver/)) {
    return "Great news for you — we're building a national network of vetted drivers and transport companies right now. You'd get a steady stream of jobs matched to your location and vehicle type, transparent per-mile pay, and the freedom to work on your own terms. No more chasing work! We're onboarding drivers early — want to get on the list? 🚛\n[SHOW_WAITLIST_BUTTON]";
  }
  if (msg.match(/when|launch|available|live|release|ready|start/)) {
    return "We're in the final stages of pre-launch — coming soon! People who sign up to the waitlist now will be the first to get access, and may get priority pricing when we go live. Want to make sure you're first in line? 🎉\n[SHOW_WAITLIST_BUTTON]";
  }
  if (msg.match(/uk|united kingdom|england|scotland|wales|coverage|where|location|nationwide/)) {
    return "We cover the whole of the UK — England, Scotland, and Wales. Wherever you need a vehicle collected from or delivered to, we've got drivers in the network to handle it. Got a specific move in mind? 🇬🇧";
  }
  if (msg.match(/international|europe|abroad|import|export/)) {
    return "International vehicle transport is on our roadmap — we're launching UK-wide first, with Europe to follow. Get on the waitlist and we'll notify you as soon as it's live. 🌍\n[SHOW_WAITLIST_BUTTON]";
  }
  if (msg.match(/whatsapp|app|download|phone/)) {
    return "No app needed — that's the beauty of it! Everything runs through WhatsApp, which you've already got on your phone. Send a message, get an instant quote, confirm, done. Simple as that 📱";
  }
  if (msg.match(/safe|insur|trust|vett|reliable|damage|claim/)) {
    return "Every driver and transport company on our network is fully vetted and insured — we don't let just anyone in. You'll have real-time tracking throughout the journey and 24/7 support if you need anything. Your vehicle is in safe hands. 🛡️";
  }
  if (msg.match(/waitlist|sign up|join|register|get access|interested|sounds good|how do i/)) {
    return "Brilliant — you won't regret it! Hit the button below to join the waitlist. Takes about 30 seconds, no commitment required, and you'll be among the first to get access when we launch. 🙌\n[SHOW_WAITLIST_BUTTON]";
  }
  if (msg.match(/great|brilliant|amazing|awesome|sounds (good|great|nice)|perfect|love it|wow|cool/)) {
    return "Really glad to hear it! 😊 We're genuinely excited about what we're building. Want to lock in your spot on the waitlist while you're here?\n[SHOW_WAITLIST_BUTTON]";
  }
  if (msg.match(/no thanks|not interested|maybe later|not now/)) {
    return "No worries at all! If you ever need a vehicle moved in the future, you know where to find us 👋";
  }
  const defaults = [
    "Good question! In a nutshell: Towit.ai makes vehicle transport in the UK dead simple — instant quotes, vetted drivers, all via WhatsApp. We're pre-launch right now. Want early access? 🚗\n[SHOW_WAITLIST_BUTTON]",
    "Happy to help! We're still pre-launch, so the best step is getting on the waitlist — early members get first access and may get priority pricing. Fancy securing your spot? 😊\n[SHOW_WAITLIST_BUTTON]",
    "Great to hear from you! The best step right now is joining our waitlist — you'll be first to know when we're live and could get some brilliant early-access perks. Interested? 👇\n[SHOW_WAITLIST_BUTTON]"
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

const SYSTEM_PROMPT = `You are Vini, the friendly and knowledgeable AI assistant for Towit.ai — the UK's first AI-powered vehicle transport network. You're a brilliant salesperson but you never come across as pushy. You're warm, helpful, and genuinely excited about what Towit.ai is building.

YOUR MISSION: Have a natural conversation with visitors and sell them on joining the waitlist. Every conversation should naturally guide toward the visitor signing up.

ABOUT TOWIT.AI:
- UK's first AI-powered vehicle transport broker
- Connects people who need vehicles moved with a vetted network of professional transport companies and drivers
- Currently in pre-launch / waitlist phase — not yet live
- The platform will be managed via WhatsApp — no apps, no forms, just a simple message
- Instant quotes powered by AI
- Vetted, insured, professional drivers and transport companies across the whole of the UK
- Real-time tracking
- 24/7 AI support
- Services: private/personal car transport, dealer/trade transport, auction collections, fleet movements, international car transport

PRICING (per mile, from launch):
- Standard: £1.75/mile
- Pro (dealers/frequent users): £1.50/mile
- Enterprise: custom rates

FOR CUSTOMERS:
- Simple — just send a WhatsApp, the AI handles everything
- Transparent pricing, no hidden fees
- Vetted and insured transport partners only
- Real-time updates throughout the journey
- Perfect for: people buying/selling cars, car dealers, auction buyers, fleet managers, anyone needing a vehicle moved

FOR DRIVERS / TRANSPORT COMPANIES:
- Consistent stream of jobs — no more chasing work
- AI matches jobs to your location and equipment type
- Transparent per-mile pricing
- Join a growing national network
- Work on your terms
- Great for: single car transporters, multi-car transporters, recovery vehicles, enclosed transporters

WHY JOIN THE WAITLIST:
- Be first to access the platform when it launches
- Early access members may get priority pricing or exclusive offers
- Help shape the product — early waitlist members' feedback matters
- No commitment required — just secure your spot

CONVERSATION STYLE:
- Friendly, warm, British English
- Keep responses concise (2-4 sentences usually, max 5-6 for complex questions)
- Ask ONE follow-up question to keep the conversation going
- Never use excessive bullet points in conversation — keep it natural
- Use light emoji occasionally but don't overdo it
- If someone is clearly interested, invite them to join the waitlist
- If someone seems hesitant, address their concern warmly

IMPORTANT — HOW TO INVITE TO WAITLIST:
When you think it's the right moment to invite someone to sign up, end your message with exactly this phrase on a new line:
[SHOW_WAITLIST_BUTTON]

This will display a "Join the Waitlist" button in the chat. Use this when:
- The visitor seems interested or enthusiastic
- They've asked about signing up / how to get started
- After you've addressed their main question/concern
- When they ask about pricing or when it launches

DO NOT show the button on the very first message, let the conversation develop naturally first (unless they immediately ask how to sign up).

NEVER:
- Make up specific launch dates (say "soon" or "later this year")
- Promise specific features that aren't mentioned above
- Use dollar signs — always use £ (pounds)
- Be overly salesy or pushy
- Write very long responses — keep it conversational`;

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

  // Sanitise messages
  const sanitisedMessages = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({
      role: m.role,
      content: String(m.content).slice(0, 2000)
    }));

  if (sanitisedMessages.length === 0) {
    return res.status(400).json({ success: false, error: 'No valid messages' });
  }

  // No API key — use smart fallback immediately
  if (!GEMINI_API_KEY) {
    const reply = getSmartFallbackResponse(sanitisedMessages);
    if (!reply) return res.status(400).json({ success: false, error: 'No user message found' });
    return res.status(200).json({ success: true, message: reply });
  }

  try {
    // Convert to Gemini format (roles: "user" | "model")
    const geminiContents = sanitisedMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const geminiPayload = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: geminiContents,
      generationConfig: {
        maxOutputTokens: 400,
        temperature: 0.8
      }
    };

    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
      signal: AbortSignal.timeout(20000)
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[Vini] Gemini error:', geminiRes.status, errText.substring(0, 200));
      // Fall back gracefully instead of showing an error
      const fallback = getSmartFallbackResponse(sanitisedMessages);
      if (fallback) return res.status(200).json({ success: true, message: fallback });
      return res.status(500).json({ success: false, error: 'Chat is temporarily unavailable.' });
    }

    const geminiData = await geminiRes.json();
    const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.error('[Vini] No reply from Gemini:', JSON.stringify(geminiData).substring(0, 200));
      const fallback = getSmartFallbackResponse(sanitisedMessages);
      if (fallback) return res.status(200).json({ success: true, message: fallback });
      return res.status(500).json({ success: false, error: 'No response from AI.' });
    }

    return res.status(200).json({ success: true, message: reply });

  } catch (err) {
    console.error('[Vini] Error:', err.message);
    const fallback = getSmartFallbackResponse(sanitisedMessages);
    if (fallback) return res.status(200).json({ success: true, message: fallback });
    return res.status(500).json({ success: false, error: 'Chat is temporarily unavailable.' });
  }
}
