import { useState } from 'react';
import Modal from './Modal';
import { Btn, inputCls, Select } from './ui';
import { ACTIVITY_TYPES } from '../config/entities';
import { useCrm } from '../context/CrmContext';

/**
 * Complete a follow-up: records what happened on the timeline and, optionally,
 * schedules the next one. Works for follow-up records and for a lead's own
 * "next follow-up" date.
 */
export default function LogContactModal({ item, onClose }) {
  const { update, create, byId } = useCrm();
  const lead = item.leadId ? byId.leads[item.leadId] : null;
  const [type, setType] = useState('Call');
  const [outcome, setOutcome] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!outcome.trim()) { setErr('Write a short summary of the conversation.'); return; }
    setBusy(true); setErr('');
    const now = new Date().toISOString();
    const nextIso = next ? new Date(`${next}T10:00:00`).toISOString() : null;
    try {
      await create('activities', { type, summary: outcome.trim(), date: now, leadId: item.leadId || undefined, clientId: item.clientId || undefined }, { silent: true });
      if (!item.fromLead) await update('followups', item.id, { status: 'Completed', outcome: outcome.trim(), completedAt: now }, { silent: true });
      if (lead) await update('leads', lead.id, { lastContacted: now, nextFollowUp: nextIso, ...(lead.status === 'New' ? { status: 'Contacted' } : {}) }, { silent: true });
      if (nextIso && !item.fromLead) await create('followups', { title: item.title, dueDate: nextIso, assignedTo: item.assignedTo || 'Unassigned', leadId: item.leadId || undefined, clientId: item.clientId || undefined }, { silent: true });
      onClose(true);
    } catch (ex) { setErr(ex.message); } finally { setBusy(false); }
  };

  return (
    <Modal open onClose={() => onClose(false)} title="Complete follow-up" size="sm"
      footer={<><Btn onClick={() => onClose(false)}>Cancel</Btn><Btn variant="primary" type="submit" form="log-form" disabled={busy}>{busy ? 'Saving…' : 'Mark as done'}</Btn></>}>
      <form id="log-form" onSubmit={submit} className="space-y-3" noValidate>
        <p className="text-[13.5px]"><span className="font-medium">{item.title}</span>{lead ? <span className="text-steel"> · {lead.businessName}</span> : null}</p>
        <div>
          <label htmlFor="lc-type" className="mb-1 block text-[12.5px] font-medium">How did you contact them?</label>
          <Select id="lc-type" value={type} onChange={setType} options={ACTIVITY_TYPES} />
        </div>
        <div>
          <label htmlFor="lc-out" className="mb-1 block text-[12.5px] font-medium">What happened? <span className="text-[#9E2A22]">*</span></label>
          <textarea id="lc-out" rows={3} value={outcome} onChange={(e) => setOutcome(e.target.value)} className={`${inputCls} h-auto py-2`} />
        </div>
        <div>
          <label htmlFor="lc-next" className="mb-1 block text-[12.5px] font-medium">Schedule the next follow-up (optional)</label>
          <input id="lc-next" type="date" value={next} onChange={(e) => setNext(e.target.value)} className={inputCls} />
        </div>
        {err ? <p className="text-[12.5px] text-[#9E2A22]" role="alert">{err}</p> : null}
      </form>
    </Modal>
  );
}
