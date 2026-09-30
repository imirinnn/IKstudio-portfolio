export function recordLabel(entity, r) {
  if (!r) return '—';
  if (entity === 'projects') return r.name;
  if (entity === 'followups' || entity === 'tasks') return r.title;
  if (entity === 'activities') return r.summary;
  if (entity === 'payments') return `Payment plan ${r.code || ''}`.trim();
  return r.businessName;
}
export const refOptions = (entity, list) => list.map((r) => ({ value: r.id, label: `${r.code ? r.code + ' · ' : ''}${recordLabel(entity, r)}` }));
