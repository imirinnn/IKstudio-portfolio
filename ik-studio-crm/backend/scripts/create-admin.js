/*
 * Create or reset an admin account. There is no public sign-up.
 *   ADMIN_NAME=Irin ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='…' npm run create-admin
 * (or put the three values in .env temporarily, run, then delete them).
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { createMongoStore } from '../src/store/mongoStore.js';
import { hashPassword, passwordProblem } from '../src/lib/auth.js';
import { parseEmails } from '../src/config/env.js';

const name = (process.env.ADMIN_NAME || '').trim();
const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';
const roles = { irin: 'Frontend Developer / Admin', kaviya: 'Backend Developer / Admin' };

if (!name || !email || !password) {
  console.error('Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD, then run again.');
  process.exit(1);
}
if (!parseEmails(process.env.ADMIN_EMAILS).includes(email)) {
  console.error(`${email} is not in ADMIN_EMAILS. Only allowed emails can have CRM accounts.`);
  process.exit(1);
}
const problem = passwordProblem(password);
if (problem) { console.error(`Password rejected: ${problem}`); process.exit(1); }

await connectDB(process.env.MONGODB_URI);
const store = createMongoStore();
const existing = await store.findAdminByEmail(email);
const passwordHash = await hashPassword(password);
if (existing) {
  await store.updateAdmin(existing.id, { name, passwordHash, active: true, tokenVersion: (existing.tokenVersion || 0) + 1 });
  console.log(`Updated admin ${email}. Existing sessions were signed out.`);
} else {
  await store.createAdmin({ name, email, passwordHash, role: roles[name.toLowerCase()] || 'Admin' });
  console.log(`Created admin ${email}.`);
}
await mongoose.disconnect();
