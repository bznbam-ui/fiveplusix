const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey || String(apiKey).trim() === '') {
    console.error('[contact] RESEND_API_KEY is missing or empty');
    return jsonResponse({ error: 'Server misconfiguration: RESEND_API_KEY is not set' }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (err) {
    console.error('[contact] Invalid JSON body:', err);
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim();
  const message = String(payload.message || '').trim();
  const projectType = String(payload['project-type'] || '').trim();
  const budget = String(payload.budget || '').trim();

  if (!name || !email || !message) {
    console.error('[contact] Validation failed: missing required fields');
    return jsonResponse({ error: 'Name, email, and message are required' }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('[contact] Validation failed: invalid email', email);
    return jsonResponse({ error: 'Invalid email address' }, 400);
  }

  const fromAddress = (env.RESEND_FROM || 'onboarding@resend.dev').trim();
  const toAddress = (env.CONTACT_TO || 'studio@fiveplussix.com').trim();

  console.log('[contact] Sending via Resend', {
    from: fromAddress,
    to: toAddress,
    replyTo: email,
    hasApiKey: Boolean(apiKey),
  });

  const subject = `FivePluSix enquiry — ${name}`;
  const html = `
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Project type:</strong> ${escapeHtml(projectType || '—')}</p>
    <p><strong>Budget:</strong> ${escapeHtml(budget || '—')}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
  `;

  let resendRes;
  try {
    resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress.includes('<') ? fromAddress : `FivePluSix <${fromAddress}>`,
        to: [toAddress],
        reply_to: email,
        subject,
        html,
      }),
    });
  } catch (err) {
    console.error('[contact] Resend fetch failed:', err);
    return jsonResponse({ error: 'Failed to reach email provider', details: String(err) }, 502);
  }

  const resendText = await resendRes.text();
  let resendBody;
  try {
    resendBody = resendText ? JSON.parse(resendText) : {};
  } catch {
    resendBody = { raw: resendText };
  }

  console.log('[contact] Resend response', {
    status: resendRes.status,
    body: resendBody,
  });

  if (!resendRes.ok) {
    console.error('[contact] Resend API error:', resendRes.status, resendBody);
    return jsonResponse(
      {
        error: 'Email provider rejected the request',
        status: resendRes.status,
        details: resendBody,
      },
      502
    );
  }

  return jsonResponse({ ok: true, id: resendBody.id || null }, 200);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
