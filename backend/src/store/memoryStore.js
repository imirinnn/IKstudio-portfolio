import crypto from 'node:crypto';

/** For tests and local trials without MongoDB. */
export function createMemoryStore() {
  const rows = new Map();
  return {
    rows,
    async create(data) { const d = { ...data, id: crypto.randomBytes(12).toString('hex'), createdAt: new Date() }; rows.set(d.id, d); return { ...d }; },
    async update(id, patch) { const d = { ...rows.get(id), ...patch }; rows.set(id, d); return { ...d }; },
    async unemailed() { return [...rows.values()].filter((r) => ['pending', 'failed'].includes(r.emailStatus)); },
    async unsent() { return [...rows.values()].filter((r) => ['pending', 'failed'].includes(r.crmStatus)); },
  };
}
