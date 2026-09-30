import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createMemoryStore } from '../src/store/memoryStore.js';

const good = { name: 'Meena', email: 'Meena@Salon.in', phone: '98765 43210', company: 'Glow Salon', websiteType: 'Salon / beauty', package: 'basic', budget: '₹8,000 – ₹10,000', description: 'We need a website for our salon with gallery.' };
let server; let base; let store; const forwarded = []; const emailed = [];
let n = 0;
const post = async (body, path = '/api/enquiries') => {
  const res = await fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-test-ip': `10.1.1.${++n}` }, body: typeof body === 'string' ? body : JSON.stringify(body) });
  return { status: res.status, body: await res.json().catch(() => null) };
};
const settle = () => new Promise((r) => setTimeout(r, 50));

before(async () => {
  store = createMemoryStore();
  const forward = async (crm, e) => { forwarded.push(e); return e.company === 'Fail Co' ? { ok: false, error: 'down' } : { ok: true, leadId: 'lead123' }; };
  const notify = async (mail, e) => { emailed.push({ mail, e }); return e.company === 'Mail Fail' ? { ok: false, error: 'Brevo answered 401' } : { ok: true, messageId: 'm1' }; };
  const mail = { apiKey: 'xkeysib-test', fromEmail: 'imirinnnb@gmail.com', fromName: 'IK Studio', to: ['imirinnnb@gmail.com', 'kaviyashree2408@gmail.com'] };
  server = createApp({ store, crm: { url: 'http://crm.test', key: 'k' }, mail, forward, notify, corsOrigins: ['http://localhost:5173'] }).listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

test('valid enquiry is stored, answered 201, then forwarded to the CRM', async () => {
  const r = await post({ ...good, role: 'admin', crmStatus: 'sent' });
  assert.equal(r.status, 201);
  await settle();
  const row = [...store.rows.values()].find((x) => x.company === 'Glow Salon');
  assert.equal(row.email, 'meena@salon.in');
  assert.equal('role' in row, false);
  assert.equal(row.crmStatus, 'sent');
  assert.equal(row.crmLeadId, 'lead123');
  assert.equal(forwarded.length, 1);
  assert.equal(row.emailStatus, 'sent');
  assert.deepEqual(emailed[0].mail.to, ['imirinnnb@gmail.com', 'kaviyashree2408@gmail.com']);
});

test('email failure is recorded for resending and does not affect the visitor', async () => {
  assert.equal((await post({ ...good, company: 'Mail Fail' })).status, 201);
  await settle();
  const row = [...store.rows.values()].find((x) => x.company === 'Mail Fail');
  assert.equal(row.emailStatus, 'failed');
  assert.match(row.emailError, /401/);
  assert.equal(row.crmStatus, 'sent');
});

test('CRM failure keeps the enquiry and marks it for resending', async () => {
  assert.equal((await post({ ...good, company: 'Fail Co' })).status, 201);
  await settle();
  const row = [...store.rows.values()].find((x) => x.company === 'Fail Co');
  assert.equal(row.crmStatus, 'failed');
  assert.equal((await store.unsent()).length, 1);
});

test('validation errors come back per field', async () => {
  const r = await post({ name: 'A', email: 'x', phone: '1', package: 'gold', description: 'short' });
  assert.equal(r.status, 422);
  assert.deepEqual(Object.keys(r.body.errors).sort(), ['description', 'email', 'name', 'package', 'phone', 'websiteType']);
});

test('honeypot submissions are dropped silently', async () => {
  const before = store.rows.size;
  assert.equal((await post({ ...good, website: 'spam' })).status, 201);
  assert.equal(store.rows.size, before);
});

test('bad JSON and unknown routes', async () => {
  assert.equal((await post('{nope')).status, 400);
  assert.equal((await post(good, '/api/admin/leads')).status, 404);
});
