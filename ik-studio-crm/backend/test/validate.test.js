import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate } from '../src/lib/validate.js';
import { entities } from '../src/crm/schema.js';
import { paymentSummary } from '../src/lib/payments.js';
import { passwordProblem } from '../src/lib/auth.js';

test('lead: requires business and contact, applies defaults, drops unknown fields', () => {
  const bad = validate(entities.leads, {});
  assert.deepEqual(Object.keys(bad.errors).sort(), ['businessName', 'contactPerson']);
  const ok = validate(entities.leads, { businessName: ' ABC Gym ', contactPerson: 'Ravi', _id: 'x', code: 'L-9', createdAt: 'y', role: 'admin' });
  assert.deepEqual(ok.errors, {});
  assert.equal(ok.value.businessName, 'ABC Gym');
  assert.equal(ok.value.status, 'New');
  assert.equal(ok.value.assignedTo, 'Unassigned');
  for (const k of ['_id', 'code', 'createdAt', 'role']) assert.equal(k in ok.value, false);
});

test('types are checked and coerced', () => {
  const r = validate(entities.leads, {
    businessName: 'A', contactPerson: 'B', email: 'NOPE', estimatedBudget: '₹12,000', status: 'Hot', nextFollowUp: 'not a date',
    existingWebsite: 'example.com', clientId: '123',
  });
  assert.equal(r.value.estimatedBudget, 12000);
  assert.equal(r.value.existingWebsite, 'https://example.com/');
  assert.deepEqual(Object.keys(r.errors).sort(), ['clientId', 'email', 'nextFollowUp', 'status']);
});

test('partial updates only check fields that are sent; empty clears', () => {
  const r = validate(entities.leads, { status: 'Contacted', nextFollowUp: '' }, { partial: true });
  assert.deepEqual(r.errors, {});
  assert.deepEqual(r.value, { status: 'Contacted', nextFollowUp: null });
  assert.ok(validate(entities.leads, { businessName: '' }, { partial: true }).errors.businessName);
});

test('30 / 30 / 40 payment summary', () => {
  const s = paymentSummary({ totalValue: 15000, advancePaid: true, developmentPaid: false, finalPaid: false });
  assert.deepEqual(s.amounts, { advance: 4500, development: 4500, final: 6000 });
  assert.equal(s.totalPaid, 4500);
  assert.equal(s.remaining, 10500);
  assert.equal(s.status, 'Partially paid');
  const odd = paymentSummary({ totalValue: 9999, advancePaid: true, developmentPaid: true, finalPaid: true });
  assert.equal(odd.amounts.advance + odd.amounts.development + odd.amounts.final, 9999);
  assert.equal(odd.remaining, 0);
  assert.equal(odd.status, 'Paid');
});

test('password rules', () => {
  assert.ok(passwordProblem('short1'));
  assert.ok(passwordProblem('onlyletterslong'));
  assert.equal(passwordProblem('letters and 123'), null);
});
