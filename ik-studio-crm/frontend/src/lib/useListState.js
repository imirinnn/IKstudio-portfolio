import { useMemo, useState } from 'react';
import { applyList } from './filter';

/** Holds search/filter/sort state for a list page and returns the filtered rows. */
const NONE = {};
export function useListState(rows, { searchKeys, dateKey, initialSort, extra = NONE, skip = [] } = {}) {
  const [q, setQ] = useState('');
  const [values, setValues] = useState({});
  const [sort, setSort] = useState(initialSort || null);
  const setValue = (k, v) => setValues((cur) => ({ ...cur, [k]: v }));
  const reset = () => { setQ(''); setValues({}); };
  const filtered = useMemo(() => {
    const { from, to, ...rest } = values;
    const filters = Object.fromEntries(Object.entries(rest).filter(([k]) => !skip.includes(k)));
    return applyList(rows, { q, searchKeys, filters: { ...filters, ...extra }, dateKey, from, to, sort });
  }, [rows, q, values, sort, searchKeys, dateKey, extra]); // eslint-disable-line react-hooks/exhaustive-deps
  return { q, setQ, values, setValue, reset, sort, setSort, filtered };
}
