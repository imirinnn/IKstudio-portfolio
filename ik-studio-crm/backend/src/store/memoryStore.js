import crypto from 'node:crypto';
import { entities } from '../crm/schema.js';

/**
 * In-memory store with the same interface as mongoStore. Used by the tests and
 * for trying the CRM locally without MongoDB (`CRM_STORE=memory`). Data is lost
 * on restart, so it is refused in production.
 */
export function createMemoryStore() {
  const tables = Object.fromEntries([...Object.keys(entities), 'admins'].map((k) => [k, new Map()]));
  const counters = {};
  const newId = () => crypto.randomBytes(12).toString('hex');
  const clone = (o) => (o ? structuredClone(o) : null);

  return {
    kind: 'memory',
    async list(entity) {
      return [...tables[entity].values()].sort((a, b) => b.updatedAt - a.updatedAt).map(clone);
    },
    async get(entity, id) { return clone(tables[entity].get(id)); },
    async create(entity, data) {
      const spec = entities[entity];
      const now = new Date();
      counters[entity] = (counters[entity] || 0) + 1;
      const doc = { ...data, id: newId(), createdAt: now, updatedAt: now };
      if (spec?.prefix) doc.code = `${spec.prefix}-${String(counters[entity]).padStart(4, '0')}`;
      tables[entity].set(doc.id, doc);
      return clone(doc);
    },
    async update(entity, id, patch) {
      const cur = tables[entity].get(id);
      if (!cur) return null;
      const next = { ...cur, ...patch, id, updatedAt: new Date() };
      tables[entity].set(id, next);
      return clone(next);
    },
    async remove(entity, id) { return tables[entity].delete(id); },
    async count(entity, where) {
      return [...tables[entity].values()].filter((d) => Object.entries(where).every(([k, v]) => d[k] === v)).length;
    },
    // admins
    async findAdminByEmail(email) { return clone([...tables.admins.values()].find((a) => a.email === email)); },
    async getAdmin(id) { return clone(tables.admins.get(id)); },
    async createAdmin(data) { return this.create('admins', data); },
    async updateAdmin(id, patch) { return this.update('admins', id, patch); },
  };
}
