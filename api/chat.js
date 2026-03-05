// Vini — Towit.ai AI Chat Assistant
// Calls Google Gemini directly from Vercel (no intermediate server needed)

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAgAVRnD_oOV9P3Tu81Fb7tzBWGB3MJnFQ';
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

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
      return res.status(500).json({ success: false, error: 'Chat is temporarily unavailable. Please try again.' });
    }

    const geminiData = await geminiRes.json();
    const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.error('[Vini] No reply from Gemini:', JSON.stringify(geminiData).substring(0, 200));
      return res.status(500).json({ success: false, error: 'No response from AI.' });
    }

    return res.status(200).json({ success: true, message: reply });

  } catch (err) {
    console.error('[Vini] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Chat is temporarily unavailable. Please try again in a moment.'
    });
  }
}
