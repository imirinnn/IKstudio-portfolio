import { loadEnv } from './config/env.js';
import { createApp } from './app.js';

const env = loadEnv();

let store;
if (env.mongoUri) {
  const { connectDB } = await import('./config/db.js');
  const { createMongoStore } = await import('./store/mongoStore.js');
  await connectDB(env.mongoUri).catch((err) => {
    console.error('Could not connect to MongoDB:', err.message);
    console.error('Check MONGODB_URI in backend/.env, or leave it empty to save enquiries in backend/data/ instead.');
    process.exit(1);
  });
  store = createMongoStore();
} else {
  const { createFileStore } = await import('./store/fileStore.js');
  store = createFileStore();
  console.warn(`No MongoDB configured: enquiries are saved in ${store.file}`);
  if (env.isProd) console.warn('On most hosts this file is wiped on every deploy. Set MONGODB_URI for permanent storage.');
}

if (!env.mail) console.warn('BREVO_API_KEY is empty: enquiries will be saved but NOT emailed.');

createApp({ store, ...env }).listen(env.port, () =>
  console.log(`Website API listening on http://localhost:${env.port}${env.mail ? ` (emailing ${env.mail.to.join(', ')})` : ''}${env.crm ? ' (forwarding to CRM)' : ''}`),
);
