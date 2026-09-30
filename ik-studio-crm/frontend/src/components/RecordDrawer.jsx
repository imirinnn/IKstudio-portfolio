import { useMemo, useState } from 'react';
import Modal from './Modal';
import Confirm from './Confirm';
import RecordForm from './RecordForm';
import ConvertModal from './ConvertModal';
import Timeline from './Timeline';
import PaymentPlan from './PaymentPlan';
import { Badge, Btn, Person } from './ui';
import { entities } from '../config/entities';
import { useCrm } from '../context/CrmContext';
import { date, money, relativeDay, daysFromToday } from '../lib/format';
import { recordLabel } from '../lib/labels';

const STATUS_KEY = { leads: 'status', deals: 'stage', clients: 'projectStatus', projects: 'stage', followups: 'status', tasks: 'status' };

/** Side panel with everything about one lead / deal / client / project. */
export default function RecordDrawer() {
  const { drawer, closeRecord, byId, data, update, remove, openRecord } = useCrm();
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [converting, setConverting] = useState(false);
  const [addingFU, setAddingFU] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const entity = drawer?.entity;
  const r = drawer ? byId[entity]?.[drawer.id] : null;
  const spec = entity ? entities[entity] : null;

  const related = useMemo(() => {
    if (!r) return {};
    const ids = { leadId: entity === 'leads' ? r.id : r.leadId, clientId: entity === 'clients' ? r.id : r.clientId, projectId: entity === 'projects' ? r.id : undefined, dealId: entity === 'deals' ? r.id : undefined };
    const acts = data.activities.filter((a) => (ids.leadId && a.leadId === ids.leadId) || (ids.clientId && a.clientId === ids.clientId) || (ids.projectId && a.projectId === ids.projectId) || (ids.dealId && a.dealId === ids.dealId));
    const projects = ids.clientId ? data.projects.filter((p) => p.clientId === ids.clientId) : [];
    const payments = entity === 'projects' ? data.payments.filter((p) => p.projectId === r.id) : ids.clientId ? data.payments.filter((p) => p.clientId === ids.clientId) : [];
    const followups = data.followups.filter((f) => (ids.leadId && f.leadId === ids.leadId) || (ids.clientId && f.clientId === ids.clientId));
    return { ids, acts, projects, payments, followups };
  }, [r, entity, data]);

  if (!drawer) return null;
  if (!r) return <Modal open side onClose={closeRecord} title="Record not found"><p className="text-steel">This record may have been deleted.</p></Modal>;

  const statusKey = STATUS_KEY[entity];
  const canConvert = (entity === 'leads' || entity === 'deals') && !r.clientId && r.status !== 'Lost' && r.stage !== 'Lost';
  const link = { leadId: related.ids.leadId, clientId: related.ids.clientId, projectId: related.ids.projectId, dealId: related.ids.dealId };

  const doDelete = async () => {
    setBusy(true); setErr('');
    try { await remove(entity, r.id); setConfirm(false); closeRecord(); }
    catch (ex) { setErr(ex.message); setConfirm(false); } finally { setBusy(false); }
  };

  return (
    <>
      <Modal open side onClose={closeRecord} title={`${spec.singular} ${r.code || ''}`}>
        <div className="space-y-6">
          <header>
            <h3 className="font-display text-[22px] font-semibold leading-tight tracking-tight">{recordLabel(entity, r)}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
              {statusKey ? <Badge>{r[statusKey]}</Badge> : null}
              {r.priority ? <Badge>{r.priority}</Badge> : null}
              {r.archived ? <Badge tone="gray">Archived</Badge> : null}
              {r.assignedTo ? <Person name={r.assignedTo} /> : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Btn icon="edit" onClick={() => setEditing(true)}>Edit</Btn>
              {canConvert ? <Btn variant="primary" icon="swap" onClick={() => setConverting(true)}>Convert to client</Btn> : null}
              {(entity === 'leads' || entity === 'clients') ? <Btn icon="calendar" onClick={() => setAddingFU(true)}>Add follow-up</Btn> : null}
              {entity === 'leads' ? <Btn onClick={() => update('leads', r.id, { archived: !r.archived })}>{r.archived ? 'Restore' : 'Archive'}</Btn> : null}
              <Btn variant="ghost" icon="trash" onClick={() => setConfirm(true)}>Delete</Btn>
            </div>
            {err ? <p className="mt-3 rounded-lg bg-[#FBE6E4] px-3 py-2 text-[13px] text-[#9E2A22]" role="alert">{err}</p> : null}
          </header>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13.5px]">
            {spec.fields.filter((f) => f.key !== statusKey && (!f.showIf || f.showIf(r))).map((f) => (
              <div key={f.key} className={f.wide ? 'col-span-2' : ''}>
                <dt className="text-[12px] text-steel">{f.label}</dt>
                <dd className="mt-0.5 whitespace-pre-line break-words">{fieldValue(f, r[f.key], byId, openRecord)}</dd>
              </div>
            ))}
            {(entity === 'leads' || entity === 'deals') && r.clientId && byId.clients[r.clientId] ? (
              <div className="col-span-2"><dt className="text-[12px] text-steel">Converted to client</dt><dd className="mt-0.5"><button type="button" onClick={() => openRecord('clients', r.clientId)} className="underline underline-offset-2">{byId.clients[r.clientId].code} · {byId.clients[r.clientId].businessName}</button></dd></div>
            ) : null}
            <div><dt className="text-[12px] text-steel">Created</dt><dd className="mt-0.5">{date(r.createdAt)}</dd></div>
            <div><dt className="text-[12px] text-steel">Updated</dt><dd className="mt-0.5">{date(r.updatedAt)}</dd></div>
          </dl>

          {related.projects.length && entity === 'clients' ? (
            <section>
              <h4 className="mb-2 text-[13px] font-semibold">Projects</h4>
              <ul className="divide-y divide-ink/[.07] rounded-xl border border-ink/10">
                {related.projects.map((p) => (
                  <li key={p.id}><button type="button" onClick={() => openRecord('projects', p.id)} className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-[13.5px] hover:bg-paper/60"><span>{p.name}</span><Badge>{p.stage}</Badge></button></li>
                ))}
              </ul>
            </section>
          ) : null}

          {related.payments.length && (entity === 'clients' || entity === 'projects') ? (
            <section>
              <h4 className="mb-2 text-[13px] font-semibold">Payments</h4>
              <div className="space-y-4">{related.payments.map((p) => <PaymentPlan key={p.id} payment={p} compact />)}</div>
            </section>
          ) : null}

          {related.followups.length ? (
            <section>
              <h4 className="mb-2 text-[13px] font-semibold">Follow-ups</h4>
              <ul className="space-y-1.5 text-[13.5px]">
                {related.followups.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate)).map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-2 rounded-lg bg-paper/70 px-3 py-2">
                    <span>{f.title}</span>
                    <span className={f.status === 'Pending' && daysFromToday(f.dueDate) < 0 ? 'text-[#9E2A22]' : 'text-steel'}>{f.status === 'Completed' ? 'Done' : relativeDay(f.dueDate)}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h4 className="mb-3 text-[13px] font-semibold">Timeline</h4>
            <Timeline items={related.acts} link={link} />
          </section>
        </div>
      </Modal>

      {editing ? <RecordForm entity={entity} record={r} onClose={() => setEditing(false)} /> : null}
      {converting ? <ConvertModal lead={entity === 'leads' ? r : null} deal={entity === 'deals' ? r : null} onClose={() => setConverting(false)} /> : null}
      {addingFU ? <RecordForm entity="followups" preset={{ title: `Follow up with ${r.businessName}`, assignedTo: r.assignedTo, [entity === 'leads' ? 'leadId' : 'clientId']: r.id }} onClose={() => setAddingFU(false)} /> : null}
      <Confirm open={confirm} onClose={() => setConfirm(false)} onConfirm={doDelete} busy={busy} title={`Delete ${spec.singular.toLowerCase()}?`}
        body={entity === 'leads' ? 'This permanently deletes the lead. To keep its history, archive it instead.' : 'This permanently deletes the record. This cannot be undone.'} />
    </>
  );
}

function fieldValue(f, v, byId, openRecord) {
  if (v === null || v === undefined || v === '') return <span className="text-steel">—</span>;
  if (f.type === 'money') return <span className="tabular-nums">{money(v)}</span>;
  if (f.type === 'date') return date(v);
  if (f.type === 'checkbox') return v ? 'Yes' : 'No';
  if (f.type === 'url') return <a href={v} target="_blank" rel="noopener noreferrer" className="text-[#2F3F9E] underline underline-offset-2">{v.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>;
  if (f.type === 'email') return <a href={`mailto:${v}`} className="underline underline-offset-2">{v}</a>;
  if (f.type === 'tel') return (
    <span className="flex flex-wrap items-center gap-2">
      <a href={`tel:${v.replace(/[^\d+]/g, '')}`} className="underline underline-offset-2">{v}</a>
      {f.key === 'whatsapp' ? <a href={`https://wa.me/${v.replace(/\D/g, '').replace(/^(\d{10})$/, '91$1')}`} target="_blank" rel="noopener noreferrer" className="text-[12px] text-[#1E6B3A] underline">WhatsApp</a> : null}
    </span>
  );
  if (f.type === 'ref') {
    const target = byId[f.ref]?.[v];
    return target ? <button type="button" onClick={() => openRecord(f.ref, v)} className="text-left underline underline-offset-2">{target.code} · {recordLabel(f.ref, target)}</button> : <span className="text-steel">Deleted record</span>;
  }
  if (f.type === 'relref') return <span className="text-steel">Linked record</span>;
  return String(v);
}

