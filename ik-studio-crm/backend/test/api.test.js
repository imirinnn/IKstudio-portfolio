import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createMemoryStore } from '../src/store/memoryStore.js';
import { hashPassword, signToken } from '../src/lib/auth.js';

const SECRET = 'test-secret-that-is-long-enough-1234567890';
const INTAKE = 'intake-key-for-tests-0123456789abcdef';
let server; let base; let store; let token; let irin; let kaviya;
let ipCounter = 0;
const api = async (method, path, { body, auth = true, ip } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-test-ip': ip || `10.0.0.${++ipCounter % 250}`, ...(auth && token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
};

before(async () => {
  store = createMemoryStore();
  irin = await store.createAdmin({ name: 'Irin', email: 'irin@example.com', role: 'Frontend Developer / Admin', passwordHash: await hashPassword('correct horse 42'), tokenVersion: 0, active: true });
  kaviya = await store.createAdmin({ name: 'Kaviya', email: 'kaviya@example.com', role: 'Backend Developer / Admin', passwordHash: await hashPassword('another pass 77'), tokenVersion: 0, active: true });
  const app = createApp({ store, jwtSecret: SECRET, adminEmails: ['irin@example.com'], intakeKey: INTAKE, corsOrigins: ['http://localhost:5174'] });
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

test('health is public', async () => {
  assert.equal((await api('GET', '/api/health', { auth: false })).status, 200);
});

test('CRM endpoints refuse requests without a valid token', async () => {
  for (const [m, p] of [['GET', '/api/admin/crm/bootstrap'], ['GET', '/api/admin/crm/leads'], ['POST', '/api/admin/crm/leads'], ['DELETE', '/api/admin/crm/leads/aaaaaaaaaaaaaaaaaaaaaaaa'], ['POST', '/api/admin/convert'], ['GET', '/api/admin/auth/me']]) {
    const r = await api(m, p, { auth: false, body: m === 'GET' ? undefined : {} });
    assert.equal(r.status, 401, `${m} ${p}`);
  }
  token = 'garbage.token.value';
  assert.equal((await api('GET', '/api/admin/crm/leads')).status, 401);
  token = signToken({ ...irin, id: irin.id }, { secret: 'wrong-secret-wrong-secret-wrong-secret!!', expiresIn: '1h' });
  assert.equal((await api('GET', '/api/admin/crm/leads')).status, 401);
  token = null;
});

test('login: wrong password and unknown email get the same answer; no registration route', async () => {
  const a = await api('POST', '/api/admin/auth/login', { auth: false, body: { email: 'irin@example.com', password: 'wrong' } });
  const b = await api('POST', '/api/admin/auth/login', { auth: false, body: { email: 'nobody@example.com', password: 'wrong' } });
  assert.equal(a.status, 401); assert.equal(b.status, 401);
  assert.equal(a.body.message, b.body.message);
  assert.equal((await api('POST', '/api/admin/auth/register', { auth: false, body: {} })).status, 404);
});

test('only emails on ADMIN_EMAILS can sign in or use a token', async () => {
  const r = await api('POST', '/api/admin/auth/login', { auth: false, body: { email: 'kaviya@example.com', password: 'another pass 77' } });
  assert.equal(r.status, 401, 'correct password but email not allowed');
  token = signToken(kaviya, { secret: SECRET, expiresIn: '1h' });
  assert.equal((await api('GET', '/api/admin/crm/leads')).status, 401, 'valid token for a non-allowed email');
  token = null;
});

test('login succeeds and never returns the password hash', async () => {
  const r = await api('POST', '/api/admin/auth/login', { auth: false, body: { email: ' IRIN@example.com ', password: 'correct horse 42' } });
  assert.equal(r.status, 200);
  assert.ok(r.body.token);
  assert.equal(r.body.admin.name, 'Irin');
  assert.equal(JSON.stringify(r.body).includes('passwordHash'), false);
  token = r.body.token;
  const me = await api('GET', '/api/admin/auth/me');
  assert.equal(me.status, 200);
  assert.equal(me.body.admin.email, 'irin@example.com');
});

test('login is rate limited per IP', async () => {
  let last;
  for (let i = 0; i < 11; i++) last = await api('POST', '/api/admin/auth/login', { auth: false, ip: '9.9.9.9', body: { email: 'x@y.z', password: 'nope' } });
  assert.equal(last.status, 429);
});

let leadId;
test('lead CRUD with validation, codes and status timeline', async () => {
  const bad = await api('POST', '/api/admin/crm/leads', { body: { businessName: '', email: 'x' } });
  assert.equal(bad.status, 422);
  assert.ok(bad.body.errors.businessName && bad.body.errors.email);

  const c = await api('POST', '/api/admin/crm/leads', { body: { businessName: 'ABC Gym', contactPerson: 'Ravi', phone: '98765 43210', source: 'Instagram', assignedTo: 'Kaviya', estimatedBudget: 14000, code: 'HACK' } });
  assert.equal(c.status, 201);
  assert.match(c.body.item.code, /^L-\d{4}$/);
  leadId = c.body.item.id;

  const u = await api('PATCH', `/api/admin/crm/leads/${leadId}`, { body: { status: 'Contacted', priority: 'High' } });
  assert.equal(u.status, 200);
  assert.equal(u.body.item.status, 'Contacted');
  const acts = (await api('GET', '/api/admin/crm/activities')).body.items;
  assert.ok(acts.some((a) => a.leadId === leadId && /New to Contacted/.test(a.summary) && a.by === 'Irin'));

  assert.equal((await api('PATCH', `/api/admin/crm/leads/${leadId}`, { body: { status: 'Maybe' } })).status, 422);
  assert.equal((await api('PATCH', '/api/admin/crm/leads/ffffffffffffffffffffffff', { body: { status: 'Won' } })).status, 404);
  assert.equal((await api('GET', '/api/admin/crm/secrets')).status, 404);
  assert.equal((await api('GET', '/api/admin/crm/admins')).status, 404, 'admins are not a CRM entity');
});

test('activities are attributed to the signed-in admin, not the request body', async () => {
  const r = await api('POST', '/api/admin/crm/activities', { body: { type: 'Call', summary: 'Called about pricing', leadId, by: 'Someone else' } });
  assert.equal(r.status, 201);
  assert.equal(r.body.item.by, 'Irin');
});

let clientId; let projectId; let paymentId;
test('convert a won lead into client + project + 30/30/40 payment', async () => {
  const missing = await api('POST', '/api/admin/convert', { body: { leadId } });
  assert.equal(missing.status, 422);
  const r = await api('POST', '/api/admin/convert', { body: { leadId, finalPrice: 14000, package: 'Full-Stack', deadline: '2026-11-30' } });
  assert.equal(r.status, 201);
  clientId = r.body.client.id; projectId = r.body.project.id; paymentId = r.body.payment.id;
  assert.equal(r.body.project.clientId, clientId);
  assert.equal(r.body.payment.totalValue, 14000);
  const lead = (await api('GET', `/api/admin/crm/leads/${leadId}`)).body.item;
  assert.equal(lead.status, 'Won'); assert.equal(lead.clientId, clientId);
  assert.equal((await api('POST', '/api/admin/convert', { body: { leadId, finalPrice: 1 } })).status, 409);
});

test('recording a payment adds a timeline entry', async () => {
  const r = await api('PATCH', `/api/admin/crm/payments/${paymentId}`, { body: { advancePaid: true, advanceDate: '2026-10-05' } });
  assert.equal(r.status, 200);
  const acts = (await api('GET', '/api/admin/crm/activities')).body.items;
  assert.ok(acts.some((a) => a.type === 'Payment received' && a.clientId === clientId));
});

test('cannot delete a client that still has projects or payments', async () => {
  const r = await api('DELETE', `/api/admin/crm/clients/${clientId}`);
  assert.equal(r.status, 409);
  assert.equal((await api('DELETE', `/api/admin/crm/payments/${paymentId}`)).status, 200);
  assert.equal((await api('DELETE', `/api/admin/crm/projects/${projectId}`)).status, 200);
  assert.equal((await api('DELETE', `/api/admin/crm/clients/${clientId}`)).status, 200);
});

test('bootstrap returns every collection', async () => {
  const r = await api('GET', '/api/admin/crm/bootstrap');
  assert.equal(r.status, 200);
  for (const k of ['leads', 'followups', 'deals', 'clients', 'projects', 'payments', 'tasks', 'activities']) assert.ok(Array.isArray(r.body[k]), k);
});

test('website intake needs the shared key and turns an enquiry into a New lead', async () => {
  const body = { name: 'Meena', email: 'meena@salon.in', phone: '9876543210', company: 'Glow Salon', websiteType: 'Salon / beauty', package: 'basic', budget: '₹8,000 – ₹10,000', description: 'We need a website for our salon with gallery.' };
  const send = async (key, b = body) => {
    const res = await fetch(base + '/api/intake/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-test-ip': '7.7.7.7', ...(key ? { 'X-Intake-Key': key } : {}) }, body: JSON.stringify(b) });
    return res.status;
  };
  assert.equal(await send(null), 401);
  assert.equal(await send('wrong-key'), 401);
  assert.equal(await send(INTAKE, { name: 'A' }), 422);
  assert.equal(await send(INTAKE), 201);
  const lead = (await store.list('leads')).find((l) => l.businessName === 'Glow Salon');
  assert.equal(lead.source, 'Website form'); assert.equal(lead.status, 'New');
  assert.match(lead.requirement, /Package: Basic/);
  assert.equal((await api('POST', '/api/enquiries', { auth: false, body })).status, 404, 'no public enquiry endpoint on the CRM API');
});

test('change password signs out old sessions', async () => {
  const weak = await api('POST', '/api/admin/auth/change-password', { body: { currentPassword: 'correct horse 42', newPassword: 'short' } });
  assert.equal(weak.status, 422);
  const wrong = await api('POST', '/api/admin/auth/change-password', { body: { currentPassword: 'nope', newPassword: 'a much better pass 99' } });
  assert.equal(wrong.status, 400);
  const old = token;
  const r = await api('POST', '/api/admin/auth/change-password', { body: { currentPassword: 'correct horse 42', newPassword: 'a much better pass 99' } });
  assert.equal(r.status, 200);
  token = old;
  assert.equal((await api('GET', '/api/admin/auth/me')).status, 401);
  token = r.body.token;
  assert.equal((await api('GET', '/api/admin/auth/me')).status, 200);
});

test('bad JSON gets a 400, not a crash', async () => {
  assert.equal((await api('POST', '/api/admin/crm/leads', { body: '{nope' })).status, 400);
});
