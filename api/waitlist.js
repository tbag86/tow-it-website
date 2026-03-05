// Vercel Serverless Function — Towit.ai Waitlist Form Handler
// Sends email to info@tow-it.ai with CC to hello@tombagshaw.co.uk and towitai.ltd@gmail.com via Resend API

export default async function handler(req, res) {
  // CORS headers for fetch-based submissions
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const {
    name,
    email,
    phone,
    business_name,
    role,
    service_type,
    vehicle_type,
    base_location,
    heard_from,
    notes,
  } = req.body || {};

  // Basic validation
  if (!name || !email || !role) {
    return res.status(400).json({ success: false, error: 'Please fill in all required fields.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }

  const isDriver = role === 'driver';
  const roleLabel = isDriver ? '🚛 Driver / Transport Company' : '🚗 Customer — Transport a Vehicle';

  // Build email HTML
  const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:#080C14;padding:28px 32px;">
      <img src="https://tow-it-website.vercel.app/logo.png" alt="Towit.ai" style="height:40px;width:auto;" />
      <p style="color:#8B96A8;font-size:14px;margin:12px 0 0;">New Waitlist Signup</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#080C14;margin:0 0 24px;font-size:20px;">New Waitlist Registration</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="background:#f8f8f8;">
          <td style="padding:12px 16px;border:1px solid #e5e5e5;font-weight:bold;width:180px;color:#444;">Full Name</td>
          <td style="padding:12px 16px;border:1px solid #e5e5e5;color:#222;">${name}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;border:1px solid #e5e5e5;font-weight:bold;color:#444;">Email</td>
          <td style="padding:12px 16px;border:1px solid #e5e5e5;color:#222;"><a href="mailto:${email}" style="color:#0066cc;">${email}</a></td>
        </tr>
        <tr style="background:#f8f8f8;">
          <td style="padding:12px 16px;border:1px solid #e5e5e5;font-weight:bold;color:#444;">Phone / WhatsApp</td>
          <td style="padding:12px 16px;border:1px solid #e5e5e5;color:#222;">${phone || '<em style="color:#999;">Not provided</em>'}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;border:1px solid #e5e5e5;font-weight:bold;color:#444;">Business Name</td>
          <td style="padding:12px 16px;border:1px solid #e5e5e5;color:#222;">${business_name || '<em style="color:#999;">Not provided</em>'}</td>
        </tr>
        <tr style="background:#f8f8f8;">
          <td style="padding:12px 16px;border:1px solid #e5e5e5;font-weight:bold;color:#444;">Role</td>
          <td style="padding:12px 16px;border:1px solid #e5e5e5;color:#222;"><strong>${roleLabel}</strong></td>
        </tr>
        ${isDriver ? `
        <tr style="background:#f8f8f8;">
          <td style="padding:12px 16px;border:1px solid #e5e5e5;font-weight:bold;color:#444;">Vehicle / Equipment</td>
          <td style="padding:12px 16px;border:1px solid #e5e5e5;color:#222;">${vehicle_type || '<em style="color:#999;">Not specified</em>'}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;border:1px solid #e5e5e5;font-weight:bold;color:#444;">Base Location</td>
          <td style="padding:12px 16px;border:1px solid #e5e5e5;color:#222;">${base_location || '<em style="color:#999;">Not specified</em>'}</td>
        </tr>
        ` : `
        <tr style="background:#f8f8f8;">
          <td style="padding:12px 16px;border:1px solid #e5e5e5;font-weight:bold;color:#444;">Service Interested In</td>
          <td style="padding:12px 16px;border:1px solid #e5e5e5;color:#222;">${service_type || '<em style="color:#999;">Not specified</em>'}</td>
        </tr>
        `}
        <tr style="background:#f8f8f8;">
          <td style="padding:12px 16px;border:1px solid #e5e5e5;font-weight:bold;color:#444;">How They Found Us</td>
          <td style="padding:12px 16px;border:1px solid #e5e5e5;color:#222;">${heard_from || '<em style="color:#999;">Not specified</em>'}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;border:1px solid #e5e5e5;font-weight:bold;color:#444;">Additional Notes</td>
          <td style="padding:12px 16px;border:1px solid #e5e5e5;color:#222;">${notes || '<em style="color:#999;">None</em>'}</td>
        </tr>
      </table>
      <div style="margin-top:24px;padding:16px;background:#f0fdf4;border-left:4px solid #00E88F;border-radius:4px;">
        <p style="margin:0;font-size:13px;color:#555;">Submitted via Towit.ai waitlist form · ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // No email service configured — log and acknowledge gracefully
    console.log('[Towit Waitlist] Submission received (RESEND_API_KEY not set):', {
      name, email, phone, business_name, role, service_type, vehicle_type, base_location, heard_from, notes
    });
    return res.status(200).json({ success: true });
  }

  try {
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Towit.ai Waitlist <noreply@towit.ai>',
        to: ['info@tow-it.ai'],
        cc: ['hello@tombagshaw.co.uk', 'towitai.ltd@gmail.com'],
        subject: `New Waitlist Signup — ${name} (${isDriver ? 'Driver' : 'Customer'})`,
        html: emailHtml,
        reply_to: email,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('[Towit Waitlist] Resend API error:', errorText);
      return res.status(500).json({ success: false, error: 'Unable to send confirmation. Please try again.' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Towit Waitlist] Error:', err);
    return res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
}
