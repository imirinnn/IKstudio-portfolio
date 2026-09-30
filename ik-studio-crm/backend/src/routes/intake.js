import crypto from 'node:crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../lib/validate.js';
import { entities } from '../crm/schema.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PKG = { basic: 'Basic', 'full-stack': 'Full-Stack', premium: 'Premium', 'not-sure': 'Not sure yet' };
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Same rules as the website's contact form (ik-studio-website). */
export function checkEnquiry(b = {}) {
  const v = {
    name: str(b.name, 120), email: str(b.email, 200).toLowerCase(), phone: str(b.phone, 20), company: str(b.company, 160),
    websiteType: str(b.websiteType, 80), package: str(b.package, 20), budget: str(b.budget, 60),
    description: str(b.description, 3001), additional: str(b.additional, 2001),
  };
  const errors = {};
  if (v.name.length < 2) errors.name = 'Enter your name.';
  if (!EMAIL.test(v.email)) errors.email = 'Enter a valid email address.';
  const digits = v.phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) errors.phone = 'Enter a 10-digit phone number.';
  if (!v.websiteType) errors.websiteType = 'Choose the type of website.';
  if (!PKG[v.package]) errors.package = 'Choose a package.';
  if (v.description.length < 20 || v.description.length > 3000) errors.description = 'Describe the project in 20 to 3,000 characters.';
  if (v.additional.length > 2000) errors.additional = 'Keep this under 2,000 characters.';
  return { value: v, errors };
}

/**
 * POST /api/intake/enquiries — called server-to-server by the studio website's
 * backend when someone submits the contact form. Protected by a shared secret
 * (INTAKE_KEY) sent in the X-Intake-Key header; disabled when INTAKE_KEY is unset.
 * Each enquiry becomes a New lead (source: Website form).
 */
export function intakeRoutes({ store, intakeKey }) {
  const router = Router();
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false,
    message: { message: 'Too many requests.' },
  });

  router.post('/enquiries', limiter, async (req, res) => {
    if (!intakeKey) return res.status(503).json({ message: 'Website intake is not configured.' });
    const given = Buffer.from(req.get('x-intake-key') || '');
    const expected = Buffer.from(intakeKey);
    if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
      return res.status(401).json({ message: 'Invalid intake key.' });
    }
    const { value: v, errors } = checkEnquiry(req.body);
    if (Object.keys(errors).length) return res.status(422).json({ message: 'Some fields need attention.', errors });

    const requirement = [
      `Package: ${PKG[v.package]}`, v.budget && `Budget: ${v.budget}`, '', v.description, v.additional && `\nAdditional: ${v.additional}`,
    ].filter((x) => x !== '' && x !== undefined && x !== false).join('\n');
    const { value: lead } = validate(entities.leads, {
      businessName: v.company || v.name, contactPerson: v.name, phone: v.phone, whatsapp: v.phone, email: v.email,
      businessType: v.websiteType, requirement, source: 'Website form', status: 'New', priority: 'Medium',
      nextFollowUp: new Date().toISOString(),
    });
    const created = await store.create('leads', lead);
    await store.create('activities', { type: 'Note', date: new Date(), by: 'Website', leadId: created.id, summary: 'Enquiry received through the website form.' });
    res.status(201).json({ ok: true, leadId: created.id });
  });
  return router;
}
