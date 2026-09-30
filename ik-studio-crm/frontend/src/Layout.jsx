import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from './shared/Icon';
import { Link, navigate } from './shared/router';
import { useAuth } from './context/AuthContext';
import { useCrm } from './context/CrmContext';
import RecordDrawer from './components/RecordDrawer';
import RecordForm from './components/RecordForm';
import { Btn, Badge, inputCls } from './components/ui';
import { dashboard } from './lib/metrics';
import { applyList } from './lib/filter';
import { entities } from './config/entities';
import { recordLabel } from './lib/labels';
import { cn } from './shared/cn';

const NAV = [
  { id: '', label: 'Dashboard', icon: 'dashboard' },
  { divider: true },
  { id: 'leads', label: 'Leads', icon: 'users' },
  { id: 'follow-ups', label: 'Follow-ups', icon: 'bell', badge: 'fu' },
  { id: 'deals', label: 'Deals', icon: 'briefcase' },
  { id: 'clients', label: 'Clients', icon: 'store' },
  { id: 'projects', label: 'Projects', icon: 'folder' },
  { id: 'payments', label: 'Payments', icon: 'wallet' },
  { id: 'earnings', label: 'Earnings', icon: 'chart' },
  { id: 'tasks', label: 'Tasks', icon: 'tasks', badge: 'tasks' },
  { id: 'activity', label: 'Activity', icon: 'activity' },
  { divider: true },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export default function Layout({ section, children }) {
  const { admin, logout, api } = useAuth();
  const { data, status, error, reload } = useCrm();
  const [menu, setMenu] = useState(false);
  const [quickAdd, setQuickAdd] = useState(null);
  const m = useMemo(() => dashboard(data), [data]);
  const badges = { fu: m.fuOverdue.length + m.fuToday.length, tasks: data.tasks.filter((t) => t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < new Date()).length };
  useEffect(() => { setMenu(false); }, [section]);

  const sidebar = (
    <nav aria-label="CRM" className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper font-display text-[13px] font-bold text-ink">i<span className="opacity-40">/</span>k</span>
        <div className="leading-tight"><p className="text-[14px] font-semibold">Studio CRM</p><p className="text-[11px] text-mist">Private · admins only</p></div>
      </div>
      <ul className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
        {NAV.map((n, i) => n.divider ? <li key={i} className="mx-2 my-2 h-px bg-paper/10" aria-hidden="true" /> : (
          <li key={n.id}>
            <Link to={`/${n.id}`} aria-current={section === n.id ? 'page' : undefined}
              className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] transition-colors', section === n.id ? 'bg-paper text-ink' : 'text-paper/75 hover:bg-paper/10 hover:text-paper')}>
              <Icon name={n.icon} size={17} />
              <span className="flex-1">{n.label}</span>
              {n.badge && badges[n.badge] ? <span className="rounded-full bg-[#D9826F] px-1.5 text-[11px] font-semibold tabular-nums text-ink" aria-label={`${badges[n.badge]} need attention`}>{badges[n.badge]}</span> : null}
            </Link>
          </li>
        ))}
        <li>
          <button type="button" onClick={() => logout('You have signed out.')} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] text-paper/75 hover:bg-paper/10 hover:text-paper">
            <Icon name="logout" size={17} /> Sign out
          </button>
        </li>
      </ul>
      <div className="border-t border-paper/10 px-4 py-3 text-[12px]">
        <p className="font-medium text-paper">{admin.name}</p>
        <p className="text-mist">{admin.role}</p>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-ink">
      <a href="#crm-main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[300] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] bg-ink text-paper lg:block">{sidebar}</aside>
      {menu ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-ink/50" aria-label="Close menu" onClick={() => setMenu(false)} />
          <aside className="absolute inset-y-0 left-0 w-[260px] bg-ink text-paper shadow-2xl">{sidebar}</aside>
        </div>
      ) : null}

      <div className="min-w-0 lg:pl-[232px]">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-ink/10 bg-white/90 px-3 backdrop-blur sm:px-5">
          <button type="button" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-ink/[.06] lg:hidden" aria-label="Open menu" aria-expanded={menu} onClick={() => setMenu(true)}><Icon name="menu" size={20} /></button>
          <GlobalSearch />
          <QuickAdd onPick={setQuickAdd} />
          {api.mode === 'demo' ? <Badge tone="amber" className="hidden sm:inline-flex">Preview · sample data</Badge> : null}
        </header>
        <main id="crm-main" className="mx-auto min-w-0 max-w-[1400px] p-3 sm:p-5 lg:p-6 [&_.grid>*]:min-w-0">
          {status === 'loading' ? <p className="p-6 text-steel" role="status">Loading your CRM…</p> : null}
          {status === 'error' ? (
            <div className="rounded-xl border border-[#9E2A22]/20 bg-[#FBE6E4] p-4 text-[14px] text-[#9E2A22]" role="alert">
              {error} <Btn size="sm" className="ml-2" onClick={reload}>Try again</Btn>
            </div>
          ) : null}
          {status === 'ready' ? children : null}
        </main>
      </div>
      <RecordDrawer />
      {quickAdd ? <RecordForm entity={quickAdd} onClose={() => setQuickAdd(null)} /> : null}
    </div>
  );
}

function QuickAdd({ onPick }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <Btn variant="primary" icon="plus" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}><span className="hidden sm:inline">New</span></Btn>
      {open ? (
        <ul role="menu" className="absolute right-0 top-11 z-40 w-48 rounded-xl border border-ink/10 bg-white p-1 shadow-xl">
          {['leads', 'followups', 'deals', 'clients', 'projects', 'tasks', 'activities'].map((e) => (
            <li key={e} role="none"><button type="button" role="menuitem" className="w-full rounded-lg px-3 py-2 text-left text-[13.5px] hover:bg-paper" onClick={() => { setOpen(false); onPick(e); }}>{entities[e].singular}</button></li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

const SEARCH = [
  ['leads', ['code', 'businessName', 'contactPerson', 'phone', 'whatsapp', 'email']],
  ['deals', ['code', 'businessName', 'contactPerson']],
  ['clients', ['code', 'businessName', 'contactPerson', 'phone', 'whatsapp', 'email']],
  ['projects', ['code', 'name']],
];

function GlobalSearch() {
  const { data, openRecord } = useCrm();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const results = useMemo(() => {
    if (q.trim().length < 2) return [];
    return SEARCH.flatMap(([entity, keys]) => applyList(data[entity], { q, searchKeys: keys }).slice(0, 5).map((r) => ({ entity, r })));
  }, [q, data]);
  const pick = (entity, id) => {
    setOpen(false); setQ('');
    navigate(`/${entity}`);
    openRecord(entity, id);
  };
  return (
    <div className="relative flex-1">
      <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
      <input
        type="search" value={q} role="combobox" aria-expanded={open && results.length > 0} aria-controls="global-results" aria-label="Search leads, clients, deals and projects"
        onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search name, phone, email, ID…" className={cn(inputCls, 'max-w-md pl-9')}
      />
      {open && q.trim().length >= 2 ? (
        <ul id="global-results" role="listbox" className="absolute left-0 top-11 z-40 max-h-[70vh] w-full max-w-md overflow-y-auto rounded-xl border border-ink/10 bg-white p-1 shadow-xl">
          {results.length ? results.map(({ entity, r }) => (
            <li key={entity + r.id} role="option" aria-selected="false">
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(entity, r.id)} className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[13.5px] hover:bg-paper">
                <span className="min-w-0"><span className="block truncate font-medium">{recordLabel(entity, r)}</span><span className="block truncate text-[12px] text-steel">{r.code} · {r.contactPerson || r.phone || ''}</span></span>
                <span className="shrink-0 text-[11.5px] text-steel">{entities[entity].singular}</span>
              </button>
            </li>
          )) : <li className="px-3 py-3 text-[13px] text-steel">No matches for “{q}”.</li>}
        </ul>
      ) : null}
    </div>
  );
}
