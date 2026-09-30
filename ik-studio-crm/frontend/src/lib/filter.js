/** Search + filters + date range + sort for a list page. */
export function applyList(rows, { q = '', searchKeys = [], filters = {}, dateKey, from, to, sort }) {
  const needle = q.trim().toLowerCase();
  const digits = needle.replace(/\D/g, '');
  let out = rows.filter((r) => {
    for (const [k, val] of Object.entries(filters)) {
      if (val === '' || val === undefined || val === null) continue;
      if (typeof val === 'function') { if (!val(r)) return false; continue; }
      if (r[k] !== val) return false;
    }
    if (dateKey && (from || to)) {
      const d = r[dateKey] ? new Date(r[dateKey]) : null;
      if (!d) return false;
      if (from && d < new Date(`${from}T00:00:00`)) return false;
      if (to && d > new Date(`${to}T23:59:59`)) return false;
    }
    if (!needle) return true;
    return searchKeys.some((k) => {
      const v = r[k];
      if (!v) return false;
      const s = String(v).toLowerCase();
      if (s.includes(needle)) return true;
      return digits.length >= 4 && s.replace(/\D/g, '').includes(digits);
    });
  });
  if (sort?.get) {
    const dir = sort.dir === 'asc' ? 1 : -1;
    out = [...out].sort((a, b) => {
      const x = sort.get(a); const y = sort.get(b);
      if (x === y) return 0;
      if (x === null || x === undefined || x === '') return 1;
      if (y === null || y === undefined || y === '') return -1;
      return (x > y ? 1 : -1) * dir;
    });
  }
  return out;
}

export const uniq = (rows, key) => [...new Set(rows.map((r) => r[key]).filter(Boolean))].sort();
