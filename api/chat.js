// Vini — Towit.ai AI Chat Assistant
// Proxies to the Towit.ai chat server (powered by Google Gemini)

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

  try {
    const upstream = await fetch('http://46.225.129.231:4000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('[Towit Chat] Upstream error:', upstream.status, errText);
      return res.status(502).json({
        success: false,
        error: 'Chat is temporarily unavailable. Please try again in a moment.'
      });
    }

    const data = await upstream.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error('[Towit Chat] Proxy error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Chat is temporarily unavailable. Please try again in a moment.'
    });
  }
}
