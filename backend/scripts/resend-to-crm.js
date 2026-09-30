/** Re-send enquiries that could not reach the CRM (e.g. it was down). Run: npm run resend-to-crm */
import { loadEnv } from '../src/config/env.js';
import { forwardToCrm } from '../src/lib/forwardToCrm.js';

const env = loadEnv();
if (!env.crm) { console.error('Set CRM_INTAKE_URL and CRM_INTAKE_KEY first.'); process.exit(1); }
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
const list = await store.unsent();
let sent = 0;
for (const e of list) {
  const r = await forwardToCrm(env.crm, e);
  await store.update(e.id, r.ok ? { crmStatus: 'sent', crmLeadId: r.leadId, crmError: '' } : { crmStatus: 'failed', crmError: r.error });
  if (r.ok) sent++; else console.warn(`Not sent (${e.email}): ${r.error}`);
}
console.log(`Sent ${sent} of ${list.length} enquiries to the CRM.`);
process.exit(0);
