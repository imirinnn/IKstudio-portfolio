import { daysFromToday } from './format';

/** 30 / 30 / 40 schedule (mirrors backend/src/lib/payments.js). */
export const PAYMENT_STAGES = [
  { key: 'advance', label: '30% Advance', pct: 30, paid: 'advancePaid', date: 'advanceDate' },
  { key: 'development', label: '30% Development review', pct: 30, paid: 'developmentPaid', date: 'developmentDate' },
  { key: 'final', label: '40% Final payment', pct: 40, paid: 'finalPaid', date: 'finalDate' },
];

export function paymentSummary(p) {
  const total = Number(p?.totalValue) || 0;
  const a = Math.round(total * 0.3);
  const d = Math.round(total * 0.3);
  const amounts = { advance: a, development: d, final: total - a - d };
  const totalPaid = PAYMENT_STAGES.reduce((s, st) => s + (p?.[st.paid] ? amounts[st.key] : 0), 0);
  const remaining = total - totalPaid;
  const status = !p ? 'No plan' : totalPaid === 0 ? 'Unpaid' : remaining === 0 ? 'Paid' : 'Partially paid';
  return { total, amounts, totalPaid, remaining, status };
}

/** Every received instalment with its amount and date — the basis for revenue. */
export function receipts(payments) {
  const out = [];
  for (const p of payments) {
    const s = paymentSummary(p);
    for (const st of PAYMENT_STAGES) {
      if (p[st.paid]) out.push({ amount: s.amounts[st.key], date: p[st.date] || p.updatedAt, payment: p, stage: st });
    }
  }
  return out;
}

const OPEN_LEAD = ['New', 'Contacted', 'Interested', 'Discussion', 'Proposal Sent', 'Negotiation'];
const OPEN_DEAL = ['Discussion', 'Requirement Gathering', 'Proposal Sent', 'Negotiation', 'Awaiting Confirmation'];

export function dashboard(data, now = new Date()) {
  const leads = data.leads.filter((l) => !l.archived);
  const rec = receipts(data.payments);
  const sameMonth = (d) => { const x = new Date(d); return x.getMonth() === now.getMonth() && x.getFullYear() === now.getFullYear(); };
  const sameYear = (d) => new Date(d).getFullYear() === now.getFullYear();
  const totalRevenue = rec.reduce((s, r) => s + r.amount, 0);
  const pending = data.payments.reduce((s, p) => s + paymentSummary(p).remaining, 0);
  const wonDeals = data.deals.filter((d) => d.stage === 'Won');
  const lostDeals = data.deals.filter((d) => d.stage === 'Lost');
  const wonLeads = leads.filter((l) => ['Won', 'Project Started', 'Completed'].includes(l.status));
  const closedValues = data.clients.map((c) => c.finalPrice).filter(Boolean);

  const pendingFU = data.followups.filter((f) => f.status !== 'Completed');
  const leadFU = leads.filter((l) => l.nextFollowUp && OPEN_LEAD.includes(l.status)).map((l) => ({ id: `lead-${l.id}`, title: `Follow up with ${l.businessName}`, dueDate: l.nextFollowUp, assignedTo: l.assignedTo, leadId: l.id, fromLead: true }));
  // A lead's own "next follow-up" date counts unless a follow-up record already covers that lead.
  const covered = new Set(pendingFU.map((f) => f.leadId).filter(Boolean));
  const allFU = [...pendingFU, ...leadFU.filter((f) => !covered.has(f.leadId))];
  const fuToday = allFU.filter((f) => daysFromToday(f.dueDate) === 0);
  const fuOverdue = allFU.filter((f) => daysFromToday(f.dueDate) < 0).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const fuUpcoming = allFU.filter((f) => { const n = daysFromToday(f.dueDate); return n > 0 && n <= 7; }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const sourceCounts = count(leads, (l) => l.source || 'Other');
  const activeProjects = data.projects.filter((p) => p.stage !== 'Completed');

  return {
    totalLeads: leads.length,
    activeLeads: leads.filter((l) => OPEN_LEAD.includes(l.status)).length,
    openDeals: data.deals.filter((d) => OPEN_DEAL.includes(d.stage)).length,
    openDealValue: data.deals.filter((d) => OPEN_DEAL.includes(d.stage)).reduce((s, d) => s + (d.negotiatedPrice || d.estimatedValue || 0), 0),
    wonDeals: wonDeals.length,
    lostDeals: lostDeals.length,
    activeClients: data.clients.filter((c) => c.projectStatus !== 'Completed').length,
    projectsInProgress: activeProjects.length,
    completedProjects: data.projects.filter((p) => p.stage === 'Completed').length,
    totalRevenue,
    revenueThisMonth: rec.filter((r) => r.date && sameMonth(r.date)).reduce((s, r) => s + r.amount, 0),
    revenueThisYear: rec.filter((r) => r.date && sameYear(r.date)).reduce((s, r) => s + r.amount, 0),
    pending,
    contracted: data.payments.reduce((s, p) => s + (Number(p.totalValue) || 0), 0),
    conversion: leads.length ? wonLeads.length / leads.length : 0,
    wonLeads: wonLeads.length,
    avgDealValue: closedValues.length ? closedValues.reduce((a, b) => a + b, 0) / closedValues.length : 0,
    fuToday, fuOverdue, fuUpcoming,
    topSources: Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]),
    upcomingDeadlines: activeProjects.filter((p) => p.deadline && daysFromToday(p.deadline) <= 14).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)),
  };
}

export function count(list, key) {
  return list.reduce((acc, x) => { const k = key(x); acc[k] = (acc[k] || 0) + 1; return acc; }, {});
}

/** Received revenue per month for the last `n` months (oldest first). */
export function revenueByMonth(payments, n = 12, now = new Date()) {
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-IN', { month: 'short' }), year: d.getFullYear(), value: 0 });
  }
  const idx = Object.fromEntries(months.map((m, i) => [m.key, i]));
  for (const r of receipts(payments)) {
    if (!r.date) continue;
    const d = new Date(r.date);
    const i = idx[`${d.getFullYear()}-${d.getMonth()}`];
    if (i !== undefined) months[i].value += r.amount;
  }
  return months;
}

export function sumBy(list, key, val) {
  return Object.entries(list.reduce((acc, x) => { const k = key(x) || 'Other'; acc[k] = (acc[k] || 0) + (val(x) || 0); return acc; }, {})).sort((a, b) => b[1] - a[1]);
}
