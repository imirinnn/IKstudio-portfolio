import mongoose from 'mongoose';
import { buildModels } from '../models/build.js';
import { entities } from '../crm/schema.js';

const isId = (id) => mongoose.isValidObjectId(id);
const plain = (doc) => (doc ? doc.toJSON() : null);

export function createMongoStore() {
  const M = buildModels();

  async function nextCode(entity) {
    const spec = entities[entity];
    const c = await M.counters.findOneAndUpdate({ _id: entity }, { $inc: { seq: 1 } }, { new: true, upsert: true });
    return `${spec.prefix}-${String(c.seq).padStart(4, '0')}`;
  }

  return {
    kind: 'mongo',
    async list(entity) {
      // Small-business scale: the admin UI loads a whole collection and filters client-side.
      const docs = await M[entity].find().sort({ updatedAt: -1 }).limit(5000);
      return docs.map(plain);
    },
    async get(entity, id) { return isId(id) ? plain(await M[entity].findById(id)) : null; },
    async create(entity, data) {
      const code = entities[entity]?.prefix ? await nextCode(entity) : undefined;
      return plain(await M[entity].create({ ...data, ...(code ? { code } : {}) }));
    },
    async update(entity, id, patch) {
      if (!isId(id)) return null;
      return plain(await M[entity].findByIdAndUpdate(id, { $set: patch }, { new: true, runValidators: true }));
    },
    async remove(entity, id) {
      if (!isId(id)) return false;
      const r = await M[entity].deleteOne({ _id: id });
      return r.deletedCount > 0;
    },
    async count(entity, where) { return M[entity].countDocuments(where); },
    async findAdminByEmail(email) { return plain(await M.admins.findOne({ email })); },
    async getAdmin(id) { return isId(id) ? plain(await M.admins.findById(id)) : null; },
    async createAdmin(data) { return plain(await M.admins.create(data)); },
    async updateAdmin(id, patch) { return plain(await M.admins.findByIdAndUpdate(id, { $set: patch }, { new: true })); },
  };
}
