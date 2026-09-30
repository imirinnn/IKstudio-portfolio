import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Stores enquiries in backend/data/enquiries.json. Used automatically when
 * MONGODB_URI is not set, so the project runs without a database.
 */
export function createFileStore(file = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../data/enquiries.json')) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const read = () => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; } };
  const write = (rows) => { const tmp = `${file}.tmp`; fs.writeFileSync(tmp, JSON.stringify(rows, null, 2)); fs.renameSync(tmp, file); };
  let queue = Promise.resolve();
  const locked = (fn) => (queue = queue.then(fn, fn));
  return {
    file,
    create: (data) => locked(() => { const rows = read(); const d = { ...data, id: crypto.randomBytes(12).toString('hex'), createdAt: new Date().toISOString() }; rows.push(d); write(rows); return { ...d }; }),
    update: (id, patch) => locked(() => { const rows = read(); const i = rows.findIndex((r) => r.id === id); if (i < 0) return null; rows[i] = { ...rows[i], ...patch, updatedAt: new Date().toISOString() }; write(rows); return { ...rows[i] }; }),
    unsent: async () => read().filter((r) => ['pending', 'failed'].includes(r.crmStatus)),
    unemailed: async () => read().filter((r) => ['pending', 'failed'].includes(r.emailStatus)),
  };
}
