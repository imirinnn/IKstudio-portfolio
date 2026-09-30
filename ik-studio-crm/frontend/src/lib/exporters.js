import { toCsv, downloadCsv } from './csv';
import { entities } from '../config/entities';
import { paymentSummary } from './metrics';
import { recordLabel } from './labels';

/** CSV columns for any entity, straight from the field config, plus IDs and timestamps. */
export function exportEntity(entity, rows, byId) {
  const spec = entities[entity];
  const cols = [
    { label: 'ID', get: (r) => r.code },
    ...spec.fields.map((f) => ({
      label: f.label,
      get: (r) => {
        const v = r[f.key];
        if (f.type === 'ref') return v && byId[f.ref]?.[v] ? `${byId[f.ref][v].code} ${recordLabel(f.ref, byId[f.ref][v])}` : '';
        if (f.type === 'date') return v ? new Date(v).toISOString().slice(0, 10) : '';
        if (f.type === 'checkbox') return v ? 'Yes' : 'No';
        return v ?? '';
      },
    })),
  ];
  if (entity === 'payments') {
    cols.push(
      { label: 'Advance amount', get: (r) => paymentSummary(r).amounts.advance },
      { label: 'Development amount', get: (r) => paymentSummary(r).amounts.development },
      { label: 'Final amount', get: (r) => paymentSummary(r).amounts.final },
      { label: 'Total paid', get: (r) => paymentSummary(r).totalPaid },
      { label: 'Remaining', get: (r) => paymentSummary(r).remaining },
      { label: 'Payment status', get: (r) => paymentSummary(r).status },
    );
  }
  cols.push({ label: 'Created', get: (r) => r.createdAt }, { label: 'Updated', get: (r) => r.updatedAt });
  const stamp = new Date().toISOString().slice(0, 10);
  downloadCsv(`${entity}-${stamp}.csv`, toCsv(rows, cols));
}
