import { loadEnv } from './config/env.js';
import { createApp } from './app.js';

const env = loadEnv();

let store;
if (process.env.CRM_STORE === 'memory') {
  if (env.isProd) throw new Error('CRM_STORE=memory is for local testing only.');
  const { createMemoryStore } = await import('./store/memoryStore.js');
  store = createMemoryStore();
  console.warn('Using the in-memory store: data is lost when the server stops.');
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const { hashPassword } = await import('./lib/auth.js');
    await store.createAdmin({ name: process.env.ADMIN_NAME || 'Admin', email: process.env.ADMIN_EMAIL.toLowerCase(), role: 'Admin', passwordHash: await hashPassword(process.env.ADMIN_PASSWORD), tokenVersion: 0, active: true });
    console.warn(`Temporary admin ${process.env.ADMIN_EMAIL} created in memory.`);
  }
} else {
  const { connectDB } = await import('./config/db.js');
  const { createMongoStore } = await import('./store/mongoStore.js');
  await connectDB(env.mongoUri).catch((err) => {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  });
  store = createMongoStore();
}

createApp({ store, ...env }).listen(env.port, () => console.log(`API listening on port ${env.port}`));
