import { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Badge, Btn, Card, PageHeader, Person, Segmented } from '../components/ui';
import DataTable from '../components/DataTable';
import Toolbar from '../components/Toolbar';
import Kanban from '../components/Kanban';
import RecordForm from '../components/RecordForm';
import { PACKAGES, PROJECT_STAGES, DEPLOY_STATUS, entities } from '../config/entities';
import { useListState } from '../lib/useListState';
import { date, daysFromToday, money, relativeDay } from '../lib/format';
import { paymentSummary } from '../lib/metrics';
import { exportEntity } from '../lib/exporters';

export default function Projects() {
  const { data, byId, openRecord, update } = useCrm();
  const [view, setView] = useState('board');
  const [adding, setAdding] = useState(false);
  const list = useListState(data.projects, { searchKeys: entities.projects.search, dateKey: 'deadline' });
  const pay = (p) => { const plan = data.payments.find((x) => x.projectId === p.id); return plan ? paymentSummary(plan).status : 'No plan'; };
  const client = (p) => byId.clients[p.clientId];

  const columns = [
    { key: 'name', label: 'Project', primary: true, sort: (r) => r.name.toLowerCase(), render: (r) => <span><span className="font-medium">{r.name}</span><span className="block text-[12px] font-normal text-steel">{r.code} · {client(r)?.businessName || 'No client'}</span></span> },
    { key: 'stage', label: 'Stage', sort: (r) => PROJECT_STAGES.indexOf(r.stage), render: (r) => <Badge>{r.stage}</Badge> },
    { key: 'package', label: 'Package' },
    { key: 'price', label: 'Price', className: 'text-right', sort: (r) => r.price || 0, render: (r) => <span className="tabular-nums">{money(r.price)}</span> },
    { key: 'payment', label: 'Payment', render: (r) => <Badge>{pay(r)}</Badge> },
    { key: 'deadline', label: 'Deadline', sort: (r) => r.deadline || '', render: (r) => r.deadline ? <span className={r.stage !== 'Completed' && daysFromToday(r.deadline) < 0 ? 'font-medium text-[#9E2A22]' : ''}>{date(r.deadline)}</span> : '—' },
    { key: 'deploymentStatus', label: 'Deployment', render: (r) => <Badge>{r.deploymentStatus}</Badge> },
    { key: 'handoverStatus', label: 'Handover', render: (r) => <Badge>{r.handoverStatus}</Badge> },
    { key: 'assignedTo', label: 'Assigned', render: (r) => <Person name={r.assignedTo} /> },
    { key: 'links', label: 'Links', hideSm: true, render: (r) => (
      <span className="flex gap-2 text-[12.5px]" onClick={(e) => e.stopPropagation()}>
        {r.liveUrl ? <a href={r.liveUrl} target="_blank" rel="noopener noreferrer" className="underline">Live</a> : null}
        {r.githubUrl ? <a href={r.githubUrl} target="_blank" rel="noopener noreferrer" className="underline">GitHub</a> : null}
        {!r.liveUrl && !r.githubUrl ? <span className="text-steel">—</span> : null}
      </span>
    ) },
  ];

  return (
    <div>
      <PageHeader title="Projects" sub="Planning → Design → Development → Client review → Finalization → Deployment → Handover → Completed">
        <Segmented label="View" value={view} onChange={setView} options={[{ value: 'board', label: 'Board', icon: 'columns' }, { value: 'table', label: 'Table', icon: 'list' }]} />
        <Btn variant="primary" icon="plus" onClick={() => setAdding(true)}>Add project</Btn>
      </PageHeader>
      <Card>
        <Toolbar q={list.q} setQ={list.setQ} values={list.values} setValue={list.setValue} onReset={list.reset}
          filters={[...(view === 'table' ? [{ key: 'stage', label: 'Stages', options: PROJECT_STAGES }] : []), { key: 'package', label: 'Packages', options: PACKAGES }, { key: 'deploymentStatus', label: 'Deployment', options: DEPLOY_STATUS }]}
          dateRange={{ label: 'Deadline' }} onExport={() => exportEntity('projects', list.filtered, byId)} />
        {view === 'table' ? (
          <DataTable rows={list.filtered} columns={columns} sort={list.sort} onSort={list.setSort} onRowClick={(r) => openRecord('projects', r.id)} rowLabel={(r) => r.name} empty={{ title: 'No projects yet', body: 'Projects are created when you convert a client, or add one here.' }} />
        ) : (
          <div className="p-3 sm:p-4">
            <Kanban columns={PROJECT_STAGES} items={list.filtered} getColumn={(p) => p.stage} onMove={(p, stage) => update('projects', p.id, { stage, ...(stage === 'Completed' ? { handoverStatus: 'Handed over' } : {}) })} cardLabel={(p) => p.name}
              renderCard={(p) => (
                <button type="button" onClick={() => openRecord('projects', p.id)} className="block w-full text-left">
                  <span className="block text-[13.5px] font-medium leading-snug">{p.name}</span>
                  <span className="mt-1 block text-[12px] text-steel">{client(p)?.businessName || 'No client'} · {money(p.price)}</span>
                  <span className="mt-2 flex flex-wrap items-center gap-1.5"><Badge>{pay(p)}</Badge>{p.deadline && p.stage !== 'Completed' ? <span className={`text-[12px] ${daysFromToday(p.deadline) < 0 ? 'text-[#9E2A22]' : 'text-steel'}`}>{relativeDay(p.deadline).replace('overdue', 'late')}</span> : null}</span>
                  <span className="mt-2 block text-[12px]"><Person name={p.assignedTo} /></span>
                </button>
              )} />
          </div>
        )}
      </Card>
      {adding ? <RecordForm entity="projects" onClose={() => setAdding(false)} /> : null}
    </div>
  );
}
