import { useMemo, useState } from 'react';
import Modal from './Modal';
import { Btn, inputCls } from './ui';
import { entities, RELATED_ENTITY, TASK_TEMPLATES } from '../config/entities';
import { useCrm } from '../context/CrmContext';
import { inputDate } from '../lib/format';
import { refOptions } from '../lib/labels';
import { cn } from '../shared/cn';

function initialValues(spec, record, preset) {
  const v = {};
  for (const f of spec.fields) {
    const raw = record?.[f.key] ?? preset?.[f.key];
    if (f.type === 'date') v[f.key] = inputDate(raw);
    else if (f.type === 'checkbox') v[f.key] = !!raw;
    else v[f.key] = raw ?? f.default ?? '';
  }
  return v;
}

/** Add / edit modal for any CRM entity, generated from config/entities.js. */
export default function RecordForm({ entity, record, preset, onClose, onSaved, title }) {
  const spec = entities[entity];
  const { data, create, update } = useCrm();
  const [v, setV] = useState(() => initialValues(spec, record, preset));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const set = (k, val) => { setV((cur) => ({ ...cur, [k]: val })); if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined })); };

  const visible = useMemo(() => spec.fields.filter((f) => !f.showIf || f.showIf(v)), [spec, v]);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    for (const f of visible) if (f.required && (v[f.key] === '' || v[f.key] === null)) errs[f.key] = 'This field is required.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const payload = {};
    for (const f of spec.fields) {
      if (!visible.includes(f)) { if (record && record[f.key]) payload[f.key] = null; continue; }
      let val = v[f.key];
      if ((f.type === 'money' || f.type === 'number') && val !== '') val = Number(val);
      if (f.type === 'date' && val) val = new Date(`${val}T10:00:00`).toISOString();
      payload[f.key] = val === '' ? null : val;
    }
    if (!record) for (const k of Object.keys(payload)) if (payload[k] === null) delete payload[k];
    setBusy(true); setFormError('');
    try {
      const saved = record ? await update(entity, record.id, payload) : await create(entity, payload);
      onSaved?.(saved);
      onClose();
    } catch (err) {
      setErrors(err.fields || {});
      setFormError(err.message);
    } finally { setBusy(false); }
  };

  return (
    <Modal open onClose={onClose} title={title || `${record ? 'Edit' : 'New'} ${spec.singular.toLowerCase()}`} size="lg"
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn variant="primary" type="submit" form="record-form" disabled={busy}>{busy ? 'Saving…' : record ? 'Save changes' : `Add ${spec.singular.toLowerCase()}`}</Btn></>}>
      <form id="record-form" onSubmit={submit} noValidate className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
        {formError ? <p className="rounded-lg bg-[#FBE6E4] px-3 py-2 text-[13px] text-[#9E2A22] sm:col-span-2" role="alert">{formError}</p> : null}
        {visible.map((f) => (
          <FormField key={f.key} f={f} value={v[f.key]} error={errors[f.key]} onChange={(val) => set(f.key, val)} data={data} values={v} entity={entity} />
        ))}
      </form>
    </Modal>
  );
}

function FormField({ f, value, error, onChange, data, values, entity }) {
  const id = `rf-${f.key}`;
  const common = { id, name: f.key, 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': error ? `${id}-err` : undefined };
  let control;
  if (f.type === 'textarea') control = <textarea {...common} rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, 'h-auto py-2')} />;
  else if (f.type === 'select') control = (
    <select {...common} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {!f.default ? <option value="">Choose…</option> : null}
      {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
  else if (f.type === 'ref' || f.type === 'relref') {
    const target = f.type === 'ref' ? f.ref : RELATED_ENTITY[values.relatedType];
    const opts = target ? refOptions(target, data[target] || []) : [];
    control = (
      <select {...common} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        <option value="">None</option>
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  } else if (f.type === 'checkbox') {
    return (
      <label htmlFor={id} className="flex items-center gap-2.5 self-end py-2 text-[14px]">
        <input {...common} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-ink" />
        {f.label}
      </label>
    );
  } else {
    const type = { money: 'number', number: 'number', date: 'date', tel: 'tel', email: 'email', url: 'url' }[f.type] || 'text';
    const listId = entity === 'tasks' && f.key === 'title' ? 'task-templates' : undefined;
    control = (
      <>
        <input {...common} type={type} list={listId} value={value} min={f.type === 'money' ? 0 : f.min} max={f.max} step={f.type === 'money' ? 500 : undefined}
          inputMode={f.type === 'money' || f.type === 'number' ? 'numeric' : undefined} onChange={(e) => onChange(e.target.value)} className={inputCls} />
        {listId ? <datalist id={listId}>{TASK_TEMPLATES.map((t) => <option key={t} value={t} />)}</datalist> : null}
      </>
    );
  }
  return (
    <div className={cn(f.wide && 'sm:col-span-2')}>
      <label htmlFor={id} className="mb-1 block text-[12.5px] font-medium text-ink/80">{f.label}{f.required ? <span className="text-[#9E2A22]"> *</span> : null}</label>
      {control}
      {error ? <p id={`${id}-err`} className="mt-1 text-[12px] text-[#9E2A22]">{error}</p> : null}
    </div>
  );
}
