import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildEnquiryEmail, sendEnquiryEmail } from '../src/lib/email.js';

const e = { name: 'Meena <script>', email: 'meena@salon.in', phone: '98765 43210', company: 'Glow & Co', websiteType: 'Salon / beauty', package: 'premium', budget: '', description: 'Line one\n<b>bold?</b>', additional: '' };
const mail = { apiKey: 'xkeysib-test', fromEmail: 'imirinnnb@gmail.com', fromName: 'IK Studio', to: ['imirinnnb@gmail.com', 'kaviyashree2408@gmail.com'] };

test('email content includes every field and escapes HTML', () => {
  const m = buildEnquiryEmail(e, { receivedAt: new Date('2026-09-30T06:00:00Z') });
  assert.equal(m.subject, 'New website enquiry: Glow & Co (Premium)');
  assert.ok(m.html.includes('Meena &lt;script&gt;'));
  assert.ok(m.html.includes('&lt;b&gt;bold?&lt;/b&gt;'));
  assert.ok(!m.html.includes('<script>'));
  assert.ok(m.html.includes('https://wa.me/919876543210'));
  for (const s of ['meena@salon.in', '98765 43210', 'Salon / beauty', 'Premium', '11:30']) assert.ok(m.text.includes(s), s);
});

test('Brevo request: endpoint, api-key header, sender, both recipients, reply-to customer', async () => {
  const orig = globalThis.fetch;
  let call;
  globalThis.fetch = async (url, init) => { call = { url, init, body: JSON.parse(init.body) }; return new Response(JSON.stringify({ messageId: '<abc@smtp-relay>' }), { status: 201 }); };
  try {
    const r = await sendEnquiryEmail(mail, e);
    assert.deepEqual(r, { ok: true, messageId: '<abc@smtp-relay>' });
    assert.equal(call.url, 'https://api.brevo.com/v3/smtp/email');
    assert.equal(call.init.headers['api-key'], 'xkeysib-test');
    assert.deepEqual(call.body.sender, { name: 'IK Studio', email: 'imirinnnb@gmail.com' });
    assert.deepEqual(call.body.to, [{ email: 'imirinnnb@gmail.com' }, { email: 'kaviyashree2408@gmail.com' }]);
    assert.deepEqual(call.body.replyTo, { email: 'meena@salon.in', name: 'Meena <script>' });
    assert.ok(call.body.htmlContent && call.body.textContent && call.body.subject);

    globalThis.fetch = async () => new Response(JSON.stringify({ code: 'unauthorized', message: 'Key not found' }), { status: 401 });
    const bad = await sendEnquiryEmail(mail, e);
    assert.equal(bad.ok, false);
    assert.match(bad.error, /401: Key not found/);

    globalThis.fetch = async () => { throw new TypeError('fetch failed'); };
    assert.equal((await sendEnquiryEmail(mail, e)).ok, false);
    assert.equal((await sendEnquiryEmail(null, e)).ok, false);
  } finally { globalThis.fetch = orig; }
});
