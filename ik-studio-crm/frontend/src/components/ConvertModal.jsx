import { useState } from 'react';
import Modal from './Modal';
import { Btn, inputCls, Select } from './ui';
import { ADMINS, PACKAGES } from '../config/entities';
import { useCrm } from '../context/CrmContext';
import { formatINR } from '../shared/format';

const PACKAGE_DEFAULT = { Basic: 9000, 'Full-Stack': 13500, Premium: 22500, Custom: '' };

/** Won lead or deal → client + project + 30/30/40 payment plan. */
export default function ConvertModal({ lead, deal, onClose }) {
  const { convert } = useCrm();
  const src = deal || lead;
  const [v, setV] = useState({
    finalPrice: deal?.negotiatedPrice || deal?.estimatedValue || lead?.estimatedBudget || '',
    package: deal?.package || 'Basic',
    projectName: `${src.businessName} website`,
    assignedTo: src.assignedTo || 'Unassigned',
    startDate: '', deadline: '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const set = (k, val) => setV((c) => ({ ...c, [k]: val }));
  const price = Number(v.finalPrice) || 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!price) { setErrors({ finalPrice: 'Enter the agreed project price.' }); return; }
    setBusy(true); setMsg('');
    try {
      await convert({
        leadId: lead?.id, dealId: deal?.id, finalPrice: price, package: v.package, projectName: v.projectName, assignedTo: v.assignedTo,
        startDate: v.startDate ? new Date(`${v.startDate}T10:00:00`).toISOString() : undefined,
        deadline: v.deadline ? new Date(`${v.deadline}T10:00:00`).toISOString() : undefined,
      });
      onClose();
    } catch (err) { setErrors(err.fields || {}); setMsg(err.message); } finally { setBusy(false); }
  };

  return (
    <Modal open onClose={onClose} title={`Convert ${src.businessName} to a client`}
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn variant="primary" type="submit" form="convert-form" disabled={busy}>{busy ? 'Converting…' : 'Create client & project'}</Btn></>}>
      <form id="convert-form" onSubmit={submit} className="grid gap-3.5 sm:grid-cols-2" noValidate>
        <p className="text-[13.5px] text-steel sm:col-span-2">This creates a client, a project and a 30 / 30 / 40 payment plan, and marks the {deal ? 'deal' : 'lead'} as Won.</p>
        {msg ? <p className="rounded-lg bg-[#FBE6E4] px-3 py-2 text-[13px] text-[#9E2A22] sm:col-span-2" role="alert">{msg}</p> : null}
        <div>
          <label htmlFor="cv-pkg" className="mb-1 block text-[12.5px] font-medium">Package</label>
          <Select id="cv-pkg" value={v.package} onChange={(p) => { set('package', p); if (!v.finalPrice && PACKAGE_DEFAULT[p]) set('finalPrice', PACKAGE_DEFAULT[p]); }} options={PACKAGES} />
        </div>
        <div>
          <label htmlFor="cv-price" className="mb-1 block text-[12.5px] font-medium">Final project price (₹) <span className="text-[#9E2A22]">*</span></label>
          <input id="cv-price" type="number" min="0" step="500" inputMode="numeric" value={v.finalPrice} onChange={(e) => set('finalPrice', e.target.value)} className={inputCls} aria-invalid={errors.finalPrice ? 'true' : undefined} />
          {errors.finalPrice ? <p className="mt-1 text-[12px] text-[#9E2A22]">{errors.finalPrice}</p> : null}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="cv-name" className="mb-1 block text-[12.5px] font-medium">Project name</label>
          <input id="cv-name" value={v.projectName} onChange={(e) => set('projectName', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="cv-start" className="mb-1 block text-[12.5px] font-medium">Start date</label>
          <input id="cv-start" type="date" value={v.startDate} onChange={(e) => set('startDate', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="cv-end" className="mb-1 block text-[12.5px] font-medium">Deadline</label>
          <input id="cv-end" type="date" value={v.deadline} onChange={(e) => set('deadline', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="cv-who" className="mb-1 block text-[12.5px] font-medium">Assigned developer</label>
          <Select id="cv-who" value={v.assignedTo} onChange={(a) => set('assignedTo', a)} options={ADMINS} />
        </div>
        {price ? (
          <div className="rounded-xl bg-paper p-3 text-[13px] sm:col-span-2">
            <p className="font-medium">Payment plan</p>
            <p className="mt-1 tabular-nums text-steel">30% {formatINR(Math.round(price * 0.3))} · 30% {formatINR(Math.round(price * 0.3))} · 40% {formatINR(price - 2 * Math.round(price * 0.3))}</p>
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
