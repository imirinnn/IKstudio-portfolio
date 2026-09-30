import { useMemo, useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Badge, Btn, Card, PageHeader, Person, Segmented, Select, inputCls } from '../components/ui';
import DataTable from '../components/DataTable';
import Toolbar from '../components/Toolbar';
import Kanban from '../components/Kanban';
import Modal from '../components/Modal';
import RecordForm from '../components/RecordForm';
import ConvertModal from '../components/ConvertModal';
import { entities, LEAD_SOURCES, LEAD_STATUS, LOST_REASONS, PIPELINE, PRIORITY } from '../config/entities';
import { useListState } from '../lib/useListState';
import { uniq } from '../lib/filter';
import { compactMoney, daysFromToday, money, relativeDay } from '../lib/format';
import { exportEntity } from '../lib/exporters';

export default function Leads() {
  const { data, byId, openRecord, update } = useCrm();
  const [view, setView] = useState('table');
  const [showArchived, setShowArchived] = useState(false);
  const [adding, setAdding] = useState(false);
  const [lostFor, setLostFor] = useState(null);
  const [convertFor, setConvertFor] = useState(null);
  const extra = useMemo(() => ({ archived: (r) => !!r.archived === showArchived }), [showArchived]);
  const list = useListState(data.leads, { searchKeys: entities.leads.search, dateKey: 'createdAt', extra, initialSort: { key: 'updatedAt', get: (r) => r.updatedAt, dir: 'desc' } });

  const move = async (lead, status) => {
    if (status === 'Lost') { setLostFor(lead); return; }
    await update('leads', lead.id, { status });
    if (status === 'Won' && !lead.clientId) setConvertFor({ ...lead, status });
  };

  const columns = [
    { key: 'businessName', label: 'Business', primary: true, sort: (r) => r.businessName.toLowerCase(), render: (r) => <span><span className="font-medium">{r.businessName}</span><span className="block text-[12px] font-normal text-steel">{r.code} · {r.contactPerson}</span></span> },
    { key: 'phone', label: 'Phone', render: (r) => r.phone || r.whatsapp || '—' },
    { key: 'status', label: 'Status', sort: (r) => LEAD_STATUS.indexOf(r.status), render: (r) => <Badge>{r.status}</Badge> },
    { key: 'priority', label: 'Priority', sort: (r) => PRIORITY.indexOf(r.priority), render: (r) => <Badge>{r.priority}</Badge> },
    { key: 'assignedTo', label: 'Assigned', render: (r) => <Person name={r.assignedTo} /> },
    { key: 'source', label: 'Source' },
    { key: 'nextFollowUp', label: 'Next follow-up', sort: (r) => r.nextFollowUp || '', render: (r) => r.nextFollowUp ? <span className={daysFromToday(r.nextFollowUp) < 0 ? 'font-medium text-[#9E2A22]' : daysFromToday(r.nextFollowUp) === 0 ? 'font-medium text-[#8A5A00]' : ''}>{relativeDay(r.nextFollowUp)}</span> : <span className="text-steel">—</span> },
    { key: 'estimatedBudget', label: 'Budget', className: 'text-right', sort: (r) => r.estimatedBudget || 0, render: (r) => <span className="tabular-nums">{money(r.estimatedBudget)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Leads" sub={`${data.leads.filter((l) => !l.archived).length} leads · ${data.leads.filter((l) => l.archived).length} archived`}>
        <Segmented label="View" value={view} onChange={setView} options={[{ value: 'table', label: 'Table', icon: 'list' }, { value: 'pipeline', label: 'Pipeline', icon: 'columns' }]} />
        <Btn variant="primary" icon="plus" onClick={() => setAdding(true)}>Add lead</Btn>
      </PageHeader>
      <Card>
        <Toolbar
          q={list.q} setQ={list.setQ} values={list.values} setValue={list.setValue} onReset={list.reset}
          placeholder="Search business, contact, phone, email, ID…"
          filters={[
            ...(view === 'table' ? [{ key: 'status', label: 'Statuses', options: LEAD_STATUS }] : []),
            { key: 'priority', label: 'Priorities', options: PRIORITY },
            { key: 'source', label: 'Sources', options: LEAD_SOURCES },
            { key: 'businessType', label: 'Business types', options: uniq(data.leads, 'businessType') },
            { key: 'location', label: 'Locations', options: uniq(data.leads, 'location') },
          ]}
          dateRange={{ label: 'Created' }}
          onExport={() => exportEntity('leads', list.filtered, byId)}
        >
          <label className="flex items-center gap-2 text-[13px] text-steel"><input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="h-4 w-4 accent-ink" /> Archived</label>
        </Toolbar>
        {view === 'table' ? (
          <DataTable rows={list.filtered} columns={columns} sort={list.sort} onSort={list.setSort} onRowClick={(r) => openRecord('leads', r.id)} rowLabel={(r) => r.businessName}
            empty={{ title: 'No leads match', body: 'Try clearing the filters, or add a new lead.' }} />
        ) : (
          <div className="p-3 sm:p-4">
            <Kanban
              columns={[...PIPELINE, 'Lost']}
              items={list.filtered}
              getColumn={(l) => l.status}
              onMove={move}
              cardLabel={(l) => l.businessName}
              columnMeta={(items) => compactMoney(items.reduce((s, l) => s + (l.estimatedBudget || 0), 0))}
              renderCard={(l) => (
                <button type="button" onClick={() => openRecord('leads', l.id)} className="block w-full text-left">
                  <span className="flex items-start justify-between gap-2"><span className="text-[13.5px] font-medium leading-snug">{l.businessName}</span>{l.priority === 'High' ? <Badge>High</Badge> : null}</span>
                  <span className="mt-1 block text-[12px] text-steel">{l.contactPerson} · {l.businessType || 'Business'}</span>
                  <span className="mt-2 flex items-center justify-between text-[12px]"><Person name={l.assignedTo} />{l.nextFollowUp ? <span className={daysFromToday(l.nextFollowUp) < 0 ? 'text-[#9E2A22]' : 'text-steel'}>{relativeDay(l.nextFollowUp)}</span> : null}</span>
                  {l.status === 'Lost' && l.lostReason ? <span className="mt-1 block text-[12px] text-[#9E2A22]">{l.lostReason}</span> : null}
                </button>
              )}
            />
          </div>
        )}
      </Card>

      {adding ? <RecordForm entity="leads" onClose={() => setAdding(false)} /> : null}
      {lostFor ? <LostModal lead={lostFor} onClose={() => setLostFor(null)} /> : null}
      {convertFor ? <ConvertModal lead={byId.leads[convertFor.id] || convertFor} onClose={() => setConvertFor(null)} /> : null}
    </div>
  );
}

function LostModal({ lead, onClose }) {
  const { update } = useCrm();
  const [reason, setReason] = useState(lead.lostReason || 'No response');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try { await update('leads', lead.id, { status: 'Lost', lostReason: reason, lostNote: note }); onClose(); } finally { setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title={`Mark ${lead.businessName} as lost`} size="sm"
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={save} disabled={busy}>Mark as lost</Btn></>}>
      <label htmlFor="lost-reason" className="mb-1 block text-[12.5px] font-medium">Reason</label>
      <Select id="lost-reason" value={reason} onChange={setReason} options={LOST_REASONS} />
      <label htmlFor="lost-note" className="mb-1 mt-3 block text-[12.5px] font-medium">Note (optional)</label>
      <input id="lost-note" value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} />
    </Modal>
  );
}
