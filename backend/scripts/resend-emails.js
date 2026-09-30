/** Re-send notification emails that failed (e.g. Brevo key missing or sender not verified). Run: npm run resend-emails */
import { loadEnv } from '../src/config/env.js';
import { sendEnquiryEmail } from '../src/lib/email.js';

const env = loadEnv();
if (!env.mail) { console.error('Set BREVO_API_KEY, MAIL_FROM_EMAIL and NOTIFY_EMAILS first.'); process.exit(1); }
let store;
if (env.mongoUri) {
  const { connectDB } = await import('../src/config/db.js');
  const { createMongoStore } = await import('../src/store/mongoStore.js');
  await connectDB(env.mongoUri);
  store = createMongoStore();
} else {
  const { createFileStore } = await import('../src/store/fileStore.js');
  store = createFileStore();
}
const list = await store.unemailed();
let sent = 0;
for (const e of list) {
  const r = await sendEnquiryEmail(env.mail, e);
  await store.update(e.id, r.ok ? { emailStatus: 'sent', emailError: '' } : { emailStatus: 'failed', emailError: r.error });
  if (r.ok) sent++; else console.warn(`Not sent (${e.email}): ${r.error}`);
}
console.log(`Emailed ${sent} of ${list.length} enquiries.`);
process.exit(0);
