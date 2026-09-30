import { readSession, writeSession } from '../shared/storage';

const BASE = ((import.meta.env && import.meta.env.VITE_API_URL) || '').replace(/\/$/, '');
const KEY = 'ik-crm-token';

export const tokenStore = {
  get: () => readSession(KEY),
  set: (t) => writeSession(KEY, t || ''),
  clear: () => { try { window.sessionStorage.removeItem(KEY); } catch { /* ignore */ } },
};

async function request(method, path, body) {
  const token = tokenStore.get();
  let res;
  try {
    res = await fetch(`${BASE}/api/admin${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    const e = new Error('Could not reach the server. Check your connection and try again.');
    e.status = 0; throw e;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(data.message || `Request failed (${res.status}).`);
    e.status = res.status; e.fields = data.errors;
    throw e;
  }
  return data;
}

export const httpApi = {
  mode: 'live',
  configured: Boolean(BASE),
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  me: () => request('GET', '/auth/me'),
  logoutAll: () => request('POST', '/auth/logout-all'),
  changePassword: (currentPassword, newPassword) => request('POST', '/auth/change-password', { currentPassword, newPassword }),
  bootstrap: () => request('GET', '/crm/bootstrap'),
  create: (entity, data) => request('POST', `/crm/${entity}`, data).then((r) => r.item),
  update: (entity, id, patch) => request('PATCH', `/crm/${entity}/${id}`, patch).then((r) => r.item),
  remove: (entity, id) => request('DELETE', `/crm/${entity}/${id}`),
  convert: (body) => request('POST', '/convert', body),
};
