import { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Badge, Btn, Card, PageHeader, Person, Segmented } from '../components/ui';
import DataTable from '../components/DataTable';
import Toolbar from '../components/Toolbar';
import Kanban from '../components/Kanban';
import RecordForm from '../components/RecordForm';
import ConvertModal from '../components/ConvertModal';
import { DEAL_STAGES, PACKAGES, entities } from '../config/entities';
import { useListState } from '../lib/useListState';
import { compactMoney, date, money } from '../lib/format';
import { exportEntity } from '../lib/exporters';

const OPEN = DEAL_STAGES.filter((s) => s !== 'Won' && s !== 'Lost');

export default function Deals() {
  const { data, byId, openRecord, update } = useCrm();
  const [view, setView] = useState('board');
  const [adding, setAdding] = useState(false);
  const [convertFor, setConvertFor] = useState(null);
  const list = useListState(data.deals, { searchKeys: entities.deals.search, dateKey: 'expectedClose' });
  const openValue = data.deals.filter((d) => OPEN.includes(d.stage)).reduce((s, d) => s + (d.negotiatedPrice || d.estimatedValue || 0), 0);
  const move = async (deal, stage) => {
    await update('deals', deal.id, { stage, ...(stage === 'Lost' ? { probability: 0 } : {}) });
    if (stage === 'Won' && !deal.clientId) setConvertFor(deal);
  };
  const value = (d) => d.negotiatedPrice || d.estimatedValue || 0;

  const columns = [
    { key: 'businessName', label: 'Business', primary: true, sort: (r) => r.businessName.toLowerCase(), render: (r) => <span><span className="font-medium">{r.businessName}</span><span className="block text-[12px] font-normal text-steel">{r.code} · {r.projectType || '—'}</span></span> },
    { key: 'stage', label: 'Stage', sort: (r) => DEAL_STAGES.indexOf(r.stage), render: (r) => <Badge>{r.stage}</Badge> },
    { key: 'package', label: 'Package' },
    { key: 'value', label: 'Value', className: 'text-right', sort: value, render: (r) => <span className="tabular-nums">{money(value(r))}</span> },
    { key: 'probability', label: 'Probability', className: 'text-right', sort: (r) => r.probability ?? -1, render: (r) => (r.probability ?? null) === null ? '—' : `${r.probability}%` },
    { key: 'expectedClose', label: 'Expected close', sort: (r) => r.expectedClose || '', render: (r) => date(r.expectedClose) },
    { key: 'assignedTo', label: 'Assigned', render: (r) => <Person name={r.assignedTo} /> },
    { key: 'actions', label: '', render: (r) => (!r.clientId && r.stage !== 'Lost' ? <Btn size="sm" onClick={(e) => { e.stopPropagation(); setConvertFor(r); }}>Convert</Btn> : r.clientId ? <Badge tone="green">Client</Badge> : null) },
  ];

  return (
    <div>
      <PageHeader title="Open deals" sub={`${data.deals.filter((d) => OPEN.includes(d.stage)).length} open · ${money(openValue)} in discussion. Internal only.`}>
        <Segmented label="View" value={view} onChange={setView} options={[{ value: 'board', label: 'Board', icon: 'columns' }, { value: 'table', label: 'Table', icon: 'list' }]} />
        <Btn variant="primary" icon="plus" onClick={() => setAdding(true)}>Add deal</Btn>
      </PageHeader>
      <Card>
        <Toolbar q={list.q} setQ={list.setQ} values={list.values} setValue={list.setValue} onReset={list.reset}
          filters={[...(view === 'table' ? [{ key: 'stage', label: 'Stages', options: DEAL_STAGES }] : []), { key: 'package', label: 'Packages', options: PACKAGES }]}
          dateRange={{ label: 'Closing' }} onExport={() => exportEntity('deals', list.filtered, byId)} />
        {view === 'table' ? (
          <DataTable rows={list.filtered} columns={columns} sort={list.sort} onSort={list.setSort} onRowClick={(r) => openRecord('deals', r.id)} rowLabel={(r) => r.businessName} empty={{ title: 'No deals yet', body: 'Add a deal when a lead starts discussing a real project.' }} />
        ) : (
          <div className="p-3 sm:p-4">
            <Kanban columns={DEAL_STAGES} items={list.filtered} getColumn={(d) => d.stage} onMove={move} cardLabel={(d) => d.businessName}
              columnMeta={(items) => compactMoney(items.reduce((s, d) => s + value(d), 0))}
              renderCard={(d) => (
                <button type="button" onClick={() => openRecord('deals', d.id)} className="block w-full text-left">
                  <span className="block text-[13.5px] font-medium leading-snug">{d.businessName}</span>
                  <span className="mt-1 block text-[12px] text-steel">{d.package} · {money(value(d))}{d.probability != null ? ` · ${d.probability}%` : ''}</span>
                  <span className="mt-2 flex items-center justify-between text-[12px]"><Person name={d.assignedTo} /><span className="text-steel">{d.expectedClose ? `Close ${date(d.expectedClose)}` : ''}</span></span>
                </button>
              )} />
          </div>
        )}
      </Card>
      {adding ? <RecordForm entity="deals" onClose={() => setAdding(false)} /> : null}
      {convertFor ? <ConvertModal deal={byId.deals[convertFor.id] || convertFor} onClose={() => setConvertFor(null)} /> : null}
    </div>
  );
}
