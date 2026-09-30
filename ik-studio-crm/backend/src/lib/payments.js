/** 30 / 30 / 40 schedule helpers (pure; mirrored in frontend/src/lib/metrics.js). */
export const STAGES = [
  { key: 'advance', label: 'Advance', pct: 30 },
  { key: 'development', label: 'Development review', pct: 30 },
  { key: 'final', label: 'Final handover', pct: 40 },
];

export function paymentSummary(p) {
  const total = Number(p.totalValue) || 0;
  const a = Math.round(total * 0.3);
  const d = Math.round(total * 0.3);
  const amounts = { advance: a, development: d, final: total - a - d };
  const paid = { advance: !!p.advancePaid, development: !!p.developmentPaid, final: !!p.finalPaid };
  const totalPaid = STAGES.reduce((sum, s) => sum + (paid[s.key] ? amounts[s.key] : 0), 0);
  const remaining = total - totalPaid;
  const status = totalPaid === 0 ? 'Unpaid' : remaining === 0 ? 'Paid' : 'Partially paid';
  return { total, amounts, paid, totalPaid, remaining, status };
}
