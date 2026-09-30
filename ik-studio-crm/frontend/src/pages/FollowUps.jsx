import { useMemo, useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Badge, Btn, Card, PageHeader, Person, Segmented } from '../components/ui';
import RecordForm from '../components/RecordForm';
import LogContactModal from '../components/LogContactModal';
import Confirm from '../components/Confirm';
import { dashboard } from '../lib/metrics';
import { date, daysFromToday, relativeDay } from '../lib/format';
import { exportEntity } from '../lib/exporters';

export default function FollowUps() {
  const { data, byId, openRecord, remove } = useCrm();
  const [who, setWho] = useState('All');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [logging, setLogging] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const m = useMemo(() => dashboard(data), [data]);
  const mine = (f) => who === 'All' || f.assignedTo === who;

  const later = data.followups.filter((f) => f.status !== 'Completed' && daysFromToday(f.dueDate) > 7);
  const done = data.followups.filter((f) => f.status === 'Completed').sort((a, b) => new Date(b.completedAt || b.updatedAt) - new Date(a.completedAt || a.updatedAt)).slice(0, 15);
  const groups = [
    ['Overdue', 'red', m.fuOverdue], ['Today', 'amber', m.fuToday], ['Upcoming (7 days)', 'blue', m.fuUpcoming], ['Later', 'gray', later], ['Recently completed', 'green', done],
  ];

  return (
    <div>
      <PageHeader title="Follow-ups" sub="Overdue items first. Mark one done to log what happened and schedule the next.">
        <Segmented label="Assigned to" value={who} onChange={setWho} options={['All', 'Irin', 'Kaviya']} />
        <Btn icon="download" onClick={() => exportEntity('followups', data.followups, byId)}>Export CSV</Btn>
        <Btn variant="primary" icon="plus" onClick={() => setAdding(true)}>Add follow-up</Btn>
      </PageHeader>
      <div className="space-y-4">
        {groups.map(([title, tone, items]) => {
          const list = items.filter(mine);
          return (
            <Card key={title}>
              <div className="flex items-center gap-2 border-b border-ink/[.07] px-4 py-3"><Badge tone={tone}>{title}</Badge><span className="text-[12.5px] text-steel">{list.length}</span></div>
              {list.length ? (
                <ul className="divide-y divide-ink/[.07]">
                  {list.map((f) => {
                    const lead = f.leadId ? byId.leads[f.leadId] : null;
                    const client = f.clientId ? byId.clients[f.clientId] : null;
                    const target = lead ? ['leads', lead] : client ? ['clients', client] : null;
                    return (
                      <li key={f.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-medium">{target ? <button type="button" onClick={() => openRecord(target[0], target[1].id)} className="hover:underline">{target[1].businessName}</button> : f.title}</p>
                          <p className="text-[12.5px] text-steel">
                            {f.fromLead ? 'Next follow-up date on the lead' : f.title} · {f.status === 'Completed' ? `Done ${date(f.completedAt)}` : <span className={daysFromToday(f.dueDate) < 0 ? 'font-medium text-[#9E2A22]' : ''}>{relativeDay(f.dueDate)} ({date(f.dueDate)})</span>} · <Person name={f.assignedTo} />
                          </p>
                          {f.outcome ? <p className="mt-1 text-[12.5px] text-ink/70">{f.outcome}</p> : null}
                        </div>
                        {f.status !== 'Completed' ? (
                          <div className="flex shrink-0 gap-1.5">
                            <Btn size="sm" variant="primary" icon="check" onClick={() => setLogging(f)}>Done</Btn>
                            {!f.fromLead ? <Btn size="sm" icon="edit" onClick={() => setEditing(f)} aria-label={`Edit ${f.title}`} /> : null}
                            {!f.fromLead ? <Btn size="sm" variant="ghost" icon="trash" onClick={() => setDeleting(f)} aria-label={`Delete ${f.title}`} /> : null}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : <p className="px-4 py-4 text-[13px] text-steel">Nothing here.</p>}
            </Card>
          );
        })}
      </div>
      {adding ? <RecordForm entity="followups" onClose={() => setAdding(false)} /> : null}
      {editing ? <RecordForm entity="followups" record={editing} onClose={() => setEditing(null)} /> : null}
      {logging ? <LogContactModal item={logging} onClose={() => setLogging(null)} /> : null}
      <Confirm open={!!deleting} title="Delete follow-up?" body={deleting ? `“${deleting.title}” will be deleted.` : ''} onClose={() => setDeleting(null)} onConfirm={async () => { await remove('followups', deleting.id); setDeleting(null); }} />
    </div>
  );
}
