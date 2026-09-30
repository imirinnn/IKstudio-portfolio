import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { tokenStore } from '../api/http';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

/**
 * Session handling. The token lives in sessionStorage (cleared when the tab
 * closes) and is only trusted after the server confirms it via /auth/me.
 */
export function AuthProvider({ api, children }) {
  const [state, setState] = useState({ status: 'checking', admin: null, notice: '' });

  useEffect(() => {
    if (!tokenStore.get()) { setState({ status: 'out', admin: null, notice: '' }); return; }
    api.me()
      .then(({ admin }) => setState({ status: 'in', admin, notice: '' }))
      .catch(() => { tokenStore.clear(); setState({ status: 'out', admin: null, notice: '' }); });
  }, [api]);

  const login = useCallback(async (email, password) => {
    const { token, admin } = await api.login(email, password);
    tokenStore.set(token);
    setState({ status: 'in', admin, notice: '' });
  }, [api]);

  const logout = useCallback((notice = '') => {
    tokenStore.clear();
    setState({ status: 'out', admin: null, notice });
  }, []);

  const value = useMemo(() => ({ ...state, api, login, logout }), [state, api, login, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
