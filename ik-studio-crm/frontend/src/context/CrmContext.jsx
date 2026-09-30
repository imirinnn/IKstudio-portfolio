import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toasts';
import { entities } from '../config/entities';

const Ctx = createContext(null);
export const useCrm = () => useContext(Ctx);

const EMPTY = Object.fromEntries(Object.keys(entities).map((k) => [k, []]));

/** Loads all CRM collections after sign-in and keeps them in sync after each change. */
export function CrmProvider({ children }) {
  const { api, logout } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(EMPTY);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [drawer, setDrawer] = useState(null); // { entity, id }

  const guard = useCallback((err) => {
    if (err.status === 401) logout('Your session has expired. Sign in again.');
    throw err;
  }, [logout]);

  const reload = useCallback(async () => {
    setStatus((s) => (s === 'ready' ? 'ready' : 'loading'));
    try {
      const all = await api.bootstrap();
      setData({ ...EMPTY, ...all });
      setStatus('ready'); setError('');
    } catch (err) {
      if (err.status === 401) { logout('Your session has expired. Sign in again.'); return; }
      setError(err.message); setStatus('error');
    }
  }, [api, logout]);

  useEffect(() => { reload(); }, [reload]);

  const put = (entity, item) => setData((d) => ({ ...d, [entity]: [item, ...d[entity].filter((x) => x.id !== item.id)] }));

  // Activities are created server-side on some updates; refresh them quietly afterwards.
  const refreshQuietly = useCallback(() => { api.bootstrap().then((all) => setData({ ...EMPTY, ...all })).catch(() => {}); }, [api]);

  const create = useCallback(async (entity, values, { silent } = {}) => {
    const item = await api.create(entity, values).catch(guard);
    put(entity, item);
    if (!silent) toast(`${entities[entity].singular} added.`);
    return item;
  }, [api, guard, toast]);

  const update = useCallback(async (entity, id, patch, { silent } = {}) => {
    const item = await api.update(entity, id, patch).catch(guard);
    put(entity, item);
    if (!silent) toast(`${entities[entity].singular} updated.`);
    if (['leads', 'payments', 'projects'].includes(entity)) refreshQuietly();
    return item;
  }, [api, guard, toast, refreshQuietly]);

  const remove = useCallback(async (entity, id) => {
    await api.remove(entity, id).catch(guard);
    setData((d) => ({ ...d, [entity]: d[entity].filter((x) => x.id !== id) }));
    toast(`${entities[entity].singular} deleted.`);
  }, [api, guard, toast]);

  const convert = useCallback(async (body) => {
    const r = await api.convert(body).catch(guard);
    await reload();
    toast(`Converted. Client ${r.client.code} and project ${r.project.code} created.`);
    return r;
  }, [api, guard, reload, toast]);

  const byId = useMemo(() => {
    const m = {};
    for (const [k, list] of Object.entries(data)) m[k] = Object.fromEntries(list.map((x) => [x.id, x]));
    return m;
  }, [data]);

  const value = useMemo(() => ({
    data, byId, status, error, reload, create, update, remove, convert,
    drawer, openRecord: (entity, id) => setDrawer({ entity, id }), closeRecord: () => setDrawer(null),
  }), [data, byId, status, error, reload, create, update, remove, convert, drawer]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
