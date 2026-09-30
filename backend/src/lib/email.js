/*
 * Enquiry notification emails, sent through Brevo's transactional email API.
 * https://developers.brevo.com/reference/sendtransacemail
 */
import { PACKAGES } from './validate.js';

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const digits = (s) => String(s || '').replace(/\D/g, '');
const waNumber = (s) => { const d = digits(s); return d.length === 10 ? `91${d}` : d; };

/** Subject, HTML and plain-text bodies for the team notification. */
export function buildEnquiryEmail(e, { receivedAt = new Date() } = {}) {
  const pkg = PACKAGES[e.package] || e.package;
  const when = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(receivedAt);
  const rows = [
    ['Name', e.name], ['Email', e.email], ['Phone', e.phone], ['Business / company', e.company || '—'],
    ['Website type', e.websiteType], ['Package', pkg], ['Budget', e.budget || '—'],
  ];
  const subject = `New website enquiry: ${e.company || e.name} (${pkg})`;

  const text = [
    `New enquiry from the IK Studio website — ${when} IST`, '',
    ...rows.map(([k, v]) => `${k}: ${v}`), '',
    'Project description:', e.description, '',
    ...(e.additional ? ['Additional requirements:', e.additional, ''] : []),
    `Reply to this email to answer ${e.name} directly.`,
  ].join('\n');

  const cell = 'padding:8px 12px;border-bottom:1px solid #E4E6EA;font-size:14px;vertical-align:top;';
  const html = `<!doctype html><html><body style="margin:0;background:#EEEFF1;font-family:Arial,Helvetica,sans-serif;color:#0F1012;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEEFF1;padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#0F1012;color:#EEEFF1;padding:20px 24px;">
  <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#A6AAB2;">IK Studio · New enquiry</div>
  <div style="font-size:22px;font-weight:bold;margin-top:6px;">${esc(e.company || e.name)}</div>
  <div style="font-size:13px;color:#A6AAB2;margin-top:4px;">${esc(when)} IST · ${esc(pkg)}</div>
</td></tr>
<tr><td style="padding:8px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${rows.map(([k, v]) => `<tr><td style="${cell}color:#6B7079;width:38%;">${esc(k)}</td><td style="${cell}">${esc(v)}</td></tr>`).join('')}
  </table>
</td></tr>
<tr><td style="padding:12px 24px;">
  <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#6B7079;">Project description</div>
  <div style="font-size:14px;line-height:1.6;margin-top:6px;white-space:pre-line;">${esc(e.description)}</div>
  ${e.additional ? `<div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#6B7079;margin-top:16px;">Additional requirements</div><div style="font-size:14px;line-height:1.6;margin-top:6px;white-space:pre-line;">${esc(e.additional)}</div>` : ''}
</td></tr>
<tr><td style="padding:8px 24px 24px;">
  <a href="mailto:${esc(e.email)}" style="display:inline-block;background:#0F1012;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:999px;font-size:14px;margin:4px 6px 4px 0;">Reply by email</a>
  <a href="tel:+${esc(waNumber(e.phone))}" style="display:inline-block;border:1px solid #0F1012;color:#0F1012;text-decoration:none;padding:9px 16px;border-radius:999px;font-size:14px;margin:4px 6px 4px 0;">Call</a>
  <a href="https://wa.me/${esc(waNumber(e.phone))}" style="display:inline-block;border:1px solid #0F1012;color:#0F1012;text-decoration:none;padding:9px 16px;border-radius:999px;font-size:14px;margin:4px 0;">WhatsApp</a>
  <div style="font-size:12px;color:#6B7079;margin-top:14px;">Replying to this email goes straight to ${esc(e.name)}.</div>
</td></tr>
</table></td></tr></table></body></html>`;

  return { subject, html, text };
}

/** Send the notification to the team. Returns { ok, messageId?, error? } and never throws. */
export async function sendEnquiryEmail(mail, enquiry, { timeoutMs = 15000 } = {}) {
  if (!mail) return { ok: false, error: 'Email is not configured.' };
  const { subject, html, text } = buildEnquiryEmail(enquiry);
  try {
    const res = await fetch(BREVO_URL, {
      method: 'POST',
      headers: { 'api-key': mail.apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: mail.fromName, email: mail.fromEmail },
        to: mail.to.map((email) => ({ email })),
        replyTo: { email: enquiry.email, name: enquiry.name },
        subject, htmlContent: html, textContent: text,
        tags: ['website-enquiry'],
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: `Brevo answered ${res.status}: ${data.message || data.code || 'error'}` };
    return { ok: true, messageId: data.messageId };
  } catch (err) {
    return { ok: false, error: err.name === 'TimeoutError' ? 'Brevo did not respond in time.' : err.message };
  }
}
