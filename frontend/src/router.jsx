import { useSyncExternalStore } from 'react';

/*
 * Tiny router (no dependency). `history` mode uses real URLs (/some-page);
 * `memory` mode keeps the path in memory, used for sandboxed previews.
 * Hosting must rewrite unknown paths to /index.html (see README).
 */
const env = (import.meta.env) || {};
const mode = env.VITE_ROUTER_MODE === 'memory' ? 'memory' : 'history';
let memoryPath = env.VITE_START_PATH || '/';
const listeners = new Set();

const read = () => (mode === 'memory' ? memoryPath : window.location.pathname);
const emit = () => listeners.forEach((l) => l());

if (mode === 'history' && typeof window !== 'undefined') window.addEventListener('popstate', emit);

export function navigate(to, { replace = false } = {}) {
  if (mode === 'memory') memoryPath = to;
  else if (replace) window.history.replaceState(null, '', to);
  else window.history.pushState(null, '', to);
  emit();
  window.scrollTo(0, 0);
}

export function usePath() {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, read, () => '/');
}

/** <Link> for internal paths: keeps normal link semantics (open in new tab etc.). */
export function Link({ to, onClick, children, ...rest }) {
  const handle = (e) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  return <a href={mode === 'memory' ? '#' : to} onClick={handle} {...rest}>{children}</a>;
}
