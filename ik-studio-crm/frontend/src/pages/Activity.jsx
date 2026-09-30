import { useMemo, useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Btn, Card, PageHeader } from '../components/ui';
import Toolbar from '../components/Toolbar';
import RecordForm from '../components/RecordForm';
import { ACTIVITY_TYPES } from '../config/entities';
import { useListState } from '../lib/useListState';
import { date } from '../lib/format';
import { exportEntity } from '../lib/exporters';

export default function Activity() {
  const { data, byId, openRecord } = useCrm();
  const [adding, setAdding] = useState(false);
  const list = useListState(data.activities, { searchKeys: ['summary', 'type', 'by'], dateKey: 'date', initialSort: { key: 'date', get: (r) => r.date || r.createdAt, dir: 'desc' } });
  const who = useMemo(() => [...new Set(data.activities.map((a) => a.by).filter(Boolean))], [data.activities]);

  return (
    <div>
      <PageHeader title="Activity" sub="Every call, meeting, proposal, payment and change, across all leads and clients.">
        <Btn variant="primary" icon="plus" onClick={() => setAdding(true)}>Add activity</Btn>
      </PageHeader>
      <Card>
        <Toolbar q={list.q} setQ={list.setQ} values={list.values} setValue={list.setValue} onReset={list.reset} assignee={false}
          filters={[{ key: 'type', label: 'Types', options: ACTIVITY_TYPES }, { key: 'by', label: 'People', options: who }]} dateRange={{ label: 'Date' }}
          onExport={() => exportEntity('activities', list.filtered, byId)} />
        {list.filtered.length ? (
          <ol className="divide-y divide-ink/[.07]">
            {list.filtered.map((a) => {
              const lead = a.leadId && byId.leads[a.leadId];
              const client = a.clientId && byId.clients[a.clientId];
              const project = a.projectId && byId.projects[a.projectId];
              return (
                <li key={a.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[120px_1fr] sm:gap-4">
                  <p className="text-[12.5px] text-steel"><time dateTime={a.date || a.createdAt}>{date(a.date || a.createdAt)}</time></p>
                  <div>
                    <p className="text-[13.5px] leading-relaxed">{a.summary}</p>
                    <p className="mt-0.5 flex flex-wrap gap-x-3 text-[12px] text-steel">
                      <span>{a.type}</span>{a.by ? <span>by {a.by}</span> : null}
                      {client ? <button type="button" className="hover:underline" onClick={() => openRecord('clients', client.id)}>{client.businessName}</button> : lead ? <button type="button" className="hover:underline" onClick={() => openRecord('leads', lead.id)}>{lead.businessName}</button> : null}
                      {project ? <button type="button" className="hover:underline" onClick={() => openRecord('projects', project.id)}>{project.name}</button> : null}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : <p className="p-6 text-center text-[13.5px] text-steel">No activity matches.</p>}
      </Card>
      {adding ? <RecordForm entity="activities" onClose={() => setAdding(false)} /> : null}
    </div>
  );
}
