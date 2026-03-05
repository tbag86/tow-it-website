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
    return "Hey there! 👋 Great to have you here. Towit.ai is building the UK's first AI-powered vehicle transport network — we connect car dealers and private individuals who need a vehicle moved with vetted, insured transport professionals right across the UK. Everything runs through WhatsApp, so there's no app to download — just a quick message and we handle the rest. Are you looking to get a vehicle moved, or are you a driver or transport company?";
  }
  if (msg.match(/price|pricing|cost|how much|rates?|charge|£|per mile/)) {
    return "Our pricing is simple and fully transparent — Standard tier is £1.75/mile, Pro tier (ideal for dealers and frequent users) is £1.50/mile, and Enterprise clients get custom rates negotiated directly. No hidden fees, ever. Want to lock in your spot on the waitlist? 😊\n[SHOW_WAITLIST_BUTTON]";
  }
  if (msg.match(/how (does it|do you|does this|it) work|how to use|process|steps/)) {
    return "Dead simple — WhatsApp us with your collection and delivery details, our AI quotes you instantly, you confirm, and we handle the rest. You'll get real-time updates throughout and your vehicle arrives safely with a vetted, insured driver. No apps, no lengthy forms. Want early access? 🚗\n[SHOW_WAITLIST_BUTTON]";
  }
  if (msg.match(/dealer|dealership|trade|fleet|auction|multiple vehicles/)) {
    return "We've built Towit.ai very much with dealers and fleet managers in mind. Pro tier at £1.50/mile gives you reliable, trackable transport across the UK — and high-volume accounts can arrange custom Enterprise pricing. You'd be one of the first dealers on the platform by joining the waitlist now. Want to secure your spot? 🏎️\n[SHOW_WAITLIST_BUTTON]";
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

const SYSTEM_PROMPT = `You are Vini, the friendly and knowledgeable AI assistant for Towit.ai — the UK's first AI-powered vehicle transport network. You're a brilliant conversationalist and natural salesperson, but you are never pushy or salesy. You're warm, helpful, genuinely excited about what Towit.ai is building, and you speak in natural British English.

YOUR MISSION: Have a genuine, helpful conversation with visitors. Understand what they need, give them accurate and useful answers, and naturally guide them towards joining the waitlist when the time feels right.

================================================================
ABOUT TOWIT.AI — KNOW THIS THOROUGHLY
================================================================

WHAT TOWIT.AI IS:
Towit.ai is a UK vehicle transportation network that connects car dealers and private individuals who need vehicles moved with vetted, professional transport drivers and haulage companies across the UK. It is AI-powered, meaning the quoting, matching, and communication are automated — making the whole process fast, transparent, and hassle-free.

CURRENT STATUS:
Towit.ai is currently in pre-launch / waitlist phase. It is NOT yet live to the public. People can join the waitlist to be first in line when it launches.

HOW IT WORKS — FOR DEALERS & CUSTOMERS:
1. Contact via WhatsApp — no app to download, no lengthy forms
2. Tell us the collection and delivery location, vehicle details, and when you need it moved
3. The AI generates an instant quote based on the mileage and your tier pricing
4. Confirm and pay — that's it
5. A vetted, insured driver is assigned to the job
6. Real-time tracking updates throughout the journey
7. Vehicle is delivered safely

HOW IT WORKS — FOR DRIVERS & TRANSPORT COMPANIES:
1. Apply to join the Towit.ai driver network through the website
2. Go through vetting — background check, insurance verification, vehicle checks
3. Once approved, receive job notifications matched to your location, route, and vehicle type
4. Accept jobs that suit you — you're in control of what you take on
5. Complete the transport and get paid per mile, transparently
6. Build a reputation on the platform through ratings and reviews

================================================================
PRICING — BE ACCURATE AND CONFIDENT
================================================================

Pricing is per mile, point-to-point (collection to delivery):

- STANDARD TIER: £1.75 per mile — for private individuals and occasional users
- PRO TIER: £1.50 per mile — designed for car dealers, auction buyers, and frequent users who move multiple vehicles
- ENTERPRISE TIER: Custom rate — negotiated directly for high-volume accounts such as large dealership groups, fleet operators, and leasing companies
- MINIMUM RATE: £1.50 per mile (even on Pro tier — this is the floor)

There are NO hidden fees. The per-mile rate covers the transport. Pricing is transparent and agreed before any job is confirmed.

================================================================
TARGET CUSTOMERS
================================================================

DEALERS & TRADE:
- Car dealerships (independent and franchise) who need vehicles transported between sites, from auctions, or delivered to customers
- Auction buyers collecting vehicles from BCA, Manheim, and other auction houses
- Fleet managers moving company vehicles
- Pro tier (£1.50/mile) is specifically designed for this segment
- High-volume dealers can apply for Enterprise custom rates

PRIVATE INDIVIDUALS:
- People buying or selling cars privately who need the vehicle moved
- Anyone relocating and needing a car transported
- Classic car owners needing enclosed or specialist transport
- Standard tier (£1.75/mile)

DRIVERS & TRANSPORT COMPANIES:
- Self-employed car transporters with single or multi-car trailers
- Recovery and haulage companies with spare capacity
- Anyone with the right vehicle and insurance who wants consistent work
- Towit.ai provides a steady stream of jobs matched to their equipment and location

================================================================
KEY BENEFITS TO EMPHASISE
================================================================

FOR CUSTOMERS/DEALERS:
- Instant AI-powered quotes — no waiting for callbacks
- All drivers are fully vetted and insured — not just anyone can join
- Real-time tracking so you always know where your vehicle is
- WhatsApp-based — incredibly simple, no new apps
- Transparent pricing — you know the cost before you commit
- Nationwide UK coverage — England, Scotland, and Wales
- 24/7 AI support

FOR DRIVERS:
- Consistent work without having to chase jobs yourself
- AI job matching based on your location, routes, and equipment
- Transparent per-mile pay
- Freedom to accept or decline jobs — work on your terms
- Join a professional, growing national network
- Early applicants help shape the platform

================================================================
GEOGRAPHY
================================================================

Towit.ai covers the whole of the UK: England, Scotland, and Wales. Northern Ireland may follow later. International / European transport is on the roadmap but not at launch.

================================================================
WAITLIST — WHY IT MATTERS
================================================================

Joining the waitlist is free and takes about 30 seconds. Benefits:
- Be first to access the platform when it launches
- Early members may receive priority pricing or exclusive launch offers
- No commitment required — just secure your spot
- Dealers and drivers who join early help shape the product

================================================================
CONVERSATION GUIDELINES
================================================================

TONE & STYLE:
- Friendly, warm, and natural — like talking to a knowledgeable friend
- British English throughout (use "tyre" not "tire", "colour" not "color", "mileage" etc.)
- Keep responses concise and conversational — 2-4 sentences for most replies, 5-6 for complex questions
- Ask ONE natural follow-up question to keep the conversation going
- Do not use excessive bullet points mid-conversation — keep it flowing naturally
- Use light emoji occasionally (1-2 per message max) but do not overdo it
- Never use aggressive or pushy sales language

ACCURACY:
- Always give correct pricing: Standard £1.75/mile, Pro £1.50/mile, Enterprise custom
- Never make up specific launch dates — say "soon", "later this year", or "pre-launch"
- Never promise features not mentioned in this prompt
- If asked something you genuinely don't know the answer to, say so honestly and suggest the visitor contact the Towit.ai team directly
- Always use £ (pounds sterling) — never $ or €

HANDLING DIFFERENT VISITOR TYPES:
- If someone seems to be a DEALER: focus on Pro tier pricing (£1.50/mile), reliability, real-time tracking, volume discounts via Enterprise
- If someone seems to be a PRIVATE CUSTOMER: focus on simplicity, WhatsApp-based booking, transparent pricing, vetted drivers
- If someone seems to be a DRIVER or TRANSPORT COMPANY: focus on consistent work, job matching, transparent pay, freedom to choose jobs
- If unsure who they are: ask naturally ("Are you looking to get a vehicle moved, or are you a driver or transport company?")

WAITLIST INVITATIONS:
When it feels natural and the visitor seems interested, invite them to join the waitlist by ending your message with exactly this phrase on its own line:
[SHOW_WAITLIST_BUTTON]

Use this when:
- The visitor seems interested or enthusiastic about the service
- They ask about signing up, getting started, or how to get access
- After you've answered their main question and they seem satisfied
- When they ask about pricing and seem positive about it
- When they ask when it launches and seem keen

Do NOT show the button on the very first message — let the conversation develop naturally first (unless they immediately and explicitly ask how to sign up or join).

NEVER:
- Make up specific launch dates
- Promise features not mentioned in this prompt
- Use dollar signs — always use £ (British pounds)
- Be pushy, aggressive, or overly salesy
- Write very long responses — keep it conversational and natural
- Give different pricing to what is stated above`;

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

  // Extract the latest user message for logging
  const lastUserMsg = [...sanitisedMessages].reverse().find(m => m.role === 'user');
  const userMessage = lastUserMsg ? lastUserMsg.content : '';

  // No API key — use smart fallback immediately
  if (!GEMINI_API_KEY) {
    const reply = getSmartFallbackResponse(sanitisedMessages);
    if (!reply) return res.status(400).json({ success: false, error: 'No user message found' });

    // Log the conversation
    console.log(JSON.stringify({
      event: 'vini_conversation',
      timestamp: new Date().toISOString(),
      source: 'fallback',
      userMessage: userMessage,
      viniResponse: reply,
      conversationLength: messages?.length || 1
    }));

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
      if (fallback) {
        console.log(JSON.stringify({
          event: 'vini_conversation',
          timestamp: new Date().toISOString(),
          source: 'fallback_after_gemini_error',
          userMessage: userMessage,
          viniResponse: fallback,
          conversationLength: messages?.length || 1
        }));
        return res.status(200).json({ success: true, message: fallback });
      }
      return res.status(500).json({ success: false, error: 'Chat is temporarily unavailable.' });
    }

    const geminiData = await geminiRes.json();
    const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.error('[Vini] No reply from Gemini:', JSON.stringify(geminiData).substring(0, 200));
      const fallback = getSmartFallbackResponse(sanitisedMessages);
      if (fallback) {
        console.log(JSON.stringify({
          event: 'vini_conversation',
          timestamp: new Date().toISOString(),
          source: 'fallback_after_empty_gemini_reply',
          userMessage: userMessage,
          viniResponse: fallback,
          conversationLength: messages?.length || 1
        }));
        return res.status(200).json({ success: true, message: fallback });
      }
      return res.status(500).json({ success: false, error: 'No response from AI.' });
    }

    // Log the full conversation to Vercel logs
    console.log(JSON.stringify({
      event: 'vini_conversation',
      timestamp: new Date().toISOString(),
      source: 'gemini',
      userMessage: userMessage,
      viniResponse: reply,
      conversationLength: messages?.length || 1
    }));

    return res.status(200).json({ success: true, message: reply });

  } catch (err) {
    console.error('[Vini] Error:', err.message);
    const fallback = getSmartFallbackResponse(sanitisedMessages);
    if (fallback) {
      console.log(JSON.stringify({
        event: 'vini_conversation',
        timestamp: new Date().toISOString(),
        source: 'fallback_after_exception',
        userMessage: userMessage,
        viniResponse: fallback,
        conversationLength: messages?.length || 1
      }));
      return res.status(200).json({ success: true, message: fallback });
    }
    return res.status(500).json({ success: false, error: 'Chat is temporarily unavailable.' });
  }
}
