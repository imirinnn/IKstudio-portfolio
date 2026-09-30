import { useState } from 'react';
import Modal from './Modal';
import Confirm from './Confirm';
import { Badge, Btn, inputCls } from './ui';
import { useCrm } from '../context/CrmContext';
import { PAYMENT_STAGES, paymentSummary } from '../lib/metrics';
import { date, inputDate, money } from '../lib/format';

/** The 30 / 30 / 40 stages of one payment plan, with "record payment" actions. */
export default function PaymentPlan({ payment, compact = false }) {
  const { update } = useCrm();
  const s = paymentSummary(payment);
  const [recording, setRecording] = useState(null);
  const [undo, setUndo] = useState(null);
  const [when, setWhen] = useState(inputDate(new Date()));
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try { await update('payments', payment.id, { [recording.paid]: true, [recording.date]: new Date(`${when}T12:00:00`).toISOString() }, { silent: false }); setRecording(null); }
    finally { setBusy(false); }
  };
  const revert = async () => {
    setBusy(true);
    try { await update('payments', payment.id, { [undo.paid]: false, [undo.date]: null }); setUndo(null); } finally { setBusy(false); }
  };

  return (
    <div>
      <ol className={compact ? 'space-y-1.5' : 'grid gap-2 sm:grid-cols-3'}>
        {PAYMENT_STAGES.map((st) => {
          const paid = !!payment[st.paid];
          return (
            <li key={st.key} className={`rounded-lg border p-3 ${paid ? 'border-[#1E6B3A]/20 bg-[#F1F8F3]' : 'border-ink/10 bg-white'}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12.5px] font-medium">{st.label}</p>
                <Badge>{paid ? 'Paid' : 'Pending'}</Badge>
              </div>
              <p className="mt-1 font-display text-[18px] font-semibold tabular-nums">{money(s.amounts[st.key])}</p>
              <div className="mt-1.5 flex items-center justify-between gap-2 text-[12px] text-steel">
                <span>{paid ? `Received ${date(payment[st.date])}` : 'Not received'}</span>
                {paid
                  ? <button type="button" onClick={() => setUndo(st)} className="text-steel underline-offset-2 hover:text-ink hover:underline">Undo</button>
                  : <Btn size="sm" variant="primary" onClick={() => { setWhen(inputDate(new Date())); setRecording(st); }}>Record</Btn>}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
        <span>Total <strong className="tabular-nums">{money(s.total)}</strong></span>
        <span>Paid <strong className="tabular-nums text-[#1E6B3A]">{money(s.totalPaid)}</strong></span>
        <span>Remaining <strong className="tabular-nums">{money(s.remaining)}</strong></span>
      </p>

      {recording ? (
        <Modal open onClose={() => setRecording(null)} title={`Record ${recording.label.toLowerCase()}`} size="sm"
          footer={<><Btn onClick={() => setRecording(null)}>Cancel</Btn><Btn variant="primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : `Record ${money(s.amounts[recording.key])}`}</Btn></>}>
          <label htmlFor="pay-date" className="mb-1 block text-[12.5px] font-medium">Date received</label>
          <input id="pay-date" type="date" value={when} onChange={(e) => setWhen(e.target.value)} className={inputCls} />
          <p className="mt-3 text-[12.5px] text-steel">This adds a "Payment received" entry to the client's timeline.</p>
        </Modal>
      ) : null}
      <Confirm open={!!undo} onClose={() => setUndo(null)} onConfirm={revert} busy={busy} title="Mark as not received?" confirmLabel="Mark as not received"
        body={undo ? `${undo.label} (${money(s.amounts[undo.key])}) will be marked as pending again.` : ''} />
    </div>
  );
}
