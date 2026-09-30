import { useState } from 'react';
import { Btn, inputCls, Select } from './ui';
import { ACTIVITY_TYPES } from '../config/entities';
import { useCrm } from '../context/CrmContext';
import { date, inputDate } from '../lib/format';

/** Communication history for a record, newest first, with a quick "add" form. */
export default function Timeline({ items, link, showForm = true }) {
  const { create } = useCrm();
  const [type, setType] = useState('Call');
  const [summary, setSummary] = useState('');
  const [when, setWhen] = useState(inputDate(new Date()));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const sorted = [...items].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  const add = async (e) => {
    e.preventDefault();
    if (!summary.trim()) { setErr('Write what happened.'); return; }
    setBusy(true); setErr('');
    try {
      await create('activities', { type, summary: summary.trim(), date: new Date(`${when}T12:00:00`).toISOString(), ...link }, { silent: true });
      setSummary('');
    } catch (ex) { setErr(ex.message); } finally { setBusy(false); }
  };

  return (
    <div>
      {showForm ? (
        <form onSubmit={add} className="mb-4 rounded-xl bg-paper/70 p-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Select aria-label="Activity type" value={type} onChange={setType} options={ACTIVITY_TYPES} />
            <input type="date" aria-label="Date" value={when} onChange={(e) => setWhen(e.target.value)} className={inputCls} />
          </div>
          <textarea aria-label="What happened" value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} placeholder="e.g. Called and discussed the menu page…" className={`${inputCls} mt-2 h-auto py-2`} />
          {err ? <p className="mt-1 text-[12px] text-[#9E2A22]">{err}</p> : null}
          <div className="mt-2 flex justify-end"><Btn type="submit" variant="primary" size="sm" disabled={busy}>{busy ? 'Adding…' : 'Add to timeline'}</Btn></div>
        </form>
      ) : null}
      {sorted.length ? (
        <ol className="relative space-y-4 border-l border-ink/10 pl-5">
          {sorted.map((a) => (
            <li key={a.id} className="relative">
              <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-ink ring-1 ring-ink/20" aria-hidden="true" />
              <p className="text-[12px] text-steel"><time dateTime={a.date || a.createdAt}>{date(a.date || a.createdAt)}</time> · {a.type}{a.by ? ` · ${a.by}` : ''}</p>
              <p className="mt-0.5 whitespace-pre-line text-[13.5px] leading-relaxed">{a.summary}</p>
            </li>
          ))}
        </ol>
      ) : <p className="text-[13px] text-steel">No activity recorded yet.</p>}
    </div>
  );
}
