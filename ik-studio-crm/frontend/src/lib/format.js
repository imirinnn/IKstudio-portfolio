const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const money = (n) => (n || n === 0 ? inr.format(Math.round(n)) : '—');
export const compactMoney = (n) => {
  if (!n) return '₹0';
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `₹${n}`;
};
const dfmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const dshort = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });
export const toDate = (v) => (v ? new Date(v) : null);
export const date = (v) => (v ? dfmt.format(new Date(v)) : '—');
export const dateShort = (v) => (v ? dshort.format(new Date(v)) : '—');
export const inputDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
export const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const daysFromToday = (v) => Math.round((startOfDay(new Date(v)) - startOfDay()) / 86400000);
export function relativeDay(v) {
  if (!v) return '';
  const n = daysFromToday(v);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  return n < 0 ? `${-n} days overdue` : `In ${n} days`;
}
