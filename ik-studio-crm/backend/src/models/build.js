import mongoose from 'mongoose';
import { entities } from '../crm/schema.js';

const { Schema } = mongoose;

const typeMap = {
  string: String, email: String, phone: String, url: String, enum: String,
  number: Number, date: Date, bool: Boolean,
  ref: Schema.Types.ObjectId, id: Schema.Types.ObjectId,
};

// Return `id` instead of `_id`; hide __v.
const toJSON = {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => { ret.id = String(ret._id); delete ret._id; return ret; },
};

function schemaFor(spec) {
  const def = { code: { type: String, unique: true, sparse: true } };
  for (const [key, f] of Object.entries(spec.fields)) {
    const field = { type: typeMap[f.type] };
    if (f.type === 'enum') field.enum = [...f.values, null];
    if (f.type === 'ref') field.ref = entities[f.ref].model;
    if (f.default !== undefined) field.default = f.default;
    if (f.required) field.required = true;
    if (f.max && (f.type === 'string')) field.maxlength = f.max;
    def[key] = field;
  }
  const schema = new Schema(def, { timestamps: true, toJSON, toObject: toJSON });
  for (const idx of spec.indexes || []) schema.index({ [idx]: 1 });
  schema.index({ updatedAt: -1 });
  return schema;
}

const counterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } }, { versionKey: false });

const adminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, default: 'Admin', maxlength: 80 },
    passwordHash: { type: String, required: true },
    tokenVersion: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true, toJSON, toObject: toJSON },
);

export function buildModels() {
  const models = {};
  for (const [name, spec] of Object.entries(entities)) {
    models[name] = mongoose.models[spec.model] || mongoose.model(spec.model, schemaFor(spec));
  }
  models.admins = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
  models.counters = mongoose.models.Counter || mongoose.model('Counter', counterSchema);
  return models;
}
