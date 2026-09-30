/*
 * Generic validator driven by src/crm/schema.js.
 * - Drops any field not in the schema (no mass-assignment of _id, code, timestamps…).
 * - Coerces types (strings trimmed, numbers parsed, dates to Date, '' → null).
 * - `partial: true` for PATCH (required fields only checked when present).
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ID = /^[a-f0-9]{24}$/i;

export function validate(spec, input, { partial = false } = {}) {
  const value = {};
  const errors = {};
  const body = input && typeof input === 'object' && !Array.isArray(input) ? input : {};

  for (const [key, f] of Object.entries(spec.fields)) {
    const has = Object.prototype.hasOwnProperty.call(body, key);
    let v = body[key];

    if (!has || v === undefined) {
      if (!partial && f.required) errors[key] = 'This field is required.';
      else if (!partial && f.default !== undefined) value[key] = f.default;
      continue;
    }
    if (typeof v === 'string') v = v.trim();
    const empty = v === '' || v === null;
    if (empty) {
      if (f.required) errors[key] = 'This field is required.';
      else value[key] = f.type === 'bool' ? false : null;
      continue;
    }

    switch (f.type) {
      case 'string':
        if (typeof v !== 'string') { errors[key] = 'Must be text.'; break; }
        if (v.length > (f.max || 160)) { errors[key] = `Keep this under ${f.max || 160} characters.`; break; }
        value[key] = v; break;
      case 'email':
        if (typeof v !== 'string' || !EMAIL.test(v) || v.length > 200) { errors[key] = 'Enter a valid email address.'; break; }
        value[key] = v.toLowerCase(); break;
      case 'phone': {
        const digits = String(v).replace(/\D/g, '');
        if (digits.length < 7 || digits.length > 15) { errors[key] = 'Enter a valid phone number.'; break; }
        value[key] = String(v).replace(/[^\d+ -]/g, '').slice(0, 20); break;
      }
      case 'url': {
        let u = String(v);
        if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
        try { const parsed = new URL(u); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(); value[key] = parsed.href.slice(0, 300); }
        catch { errors[key] = 'Enter a valid web address.'; }
        break;
      }
      case 'number': {
        const n = typeof v === 'number' ? v : Number(String(v).replace(/[,₹\s]/g, ''));
        if (!Number.isFinite(n)) { errors[key] = 'Enter a number.'; break; }
        if (f.min !== undefined && n < f.min) { errors[key] = `Must be at least ${f.min}.`; break; }
        if (f.max !== undefined && n > f.max) { errors[key] = `Must be at most ${f.max}.`; break; }
        value[key] = n; break;
      }
      case 'date': {
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) { errors[key] = 'Enter a valid date.'; break; }
        value[key] = d; break;
      }
      case 'enum':
        if (!f.values.includes(v)) { errors[key] = `Choose one of: ${f.values.join(', ')}.`; break; }
        value[key] = v; break;
      case 'bool':
        value[key] = v === true || v === 'true' || v === 1 || v === '1'; break;
      case 'ref':
      case 'id':
        if (typeof v !== 'string' || !ID.test(v)) { errors[key] = 'Invalid reference.'; break; }
        value[key] = v; break;
      default:
        break;
    }
  }
  return { value, errors };
}
