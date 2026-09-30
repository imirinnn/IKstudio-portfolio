import { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Badge, Btn, Card, PageHeader, Person, Segmented } from '../components/ui';
import Kanban from '../components/Kanban';
import RecordForm from '../components/RecordForm';
import { RELATED_ENTITY, TASK_STATUS } from '../config/entities';
import { daysFromToday, relativeDay } from '../lib/format';
import { recordLabel } from '../lib/labels';
import { exportEntity } from '../lib/exporters';

export default function Tasks() {
  const { data, byId, update, openRecord } = useCrm();
  const [who, setWho] = useState('All');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const items = data.tasks.filter((t) => who === 'All' || t.assignedTo === who).sort((a, b) => (a.dueDate ? new Date(a.dueDate) : Infinity) - (b.dueDate ? new Date(b.dueDate) : Infinity));

  return (
    <div>
      <PageHeader title="Tasks" sub="To Do → In Progress → Completed">
        <Segmented label="Assigned to" value={who} onChange={setWho} options={['All', 'Irin', 'Kaviya']} />
        <Btn icon="download" onClick={() => exportEntity('tasks', data.tasks, byId)}>Export CSV</Btn>
        <Btn variant="primary" icon="plus" onClick={() => setAdding(true)}>Add task</Btn>
      </PageHeader>
      <Card className="p-3 sm:p-4">
        <Kanban columns={TASK_STATUS} items={items} getColumn={(t) => t.status} onMove={(t, status) => update('tasks', t.id, { status })} cardLabel={(t) => t.title}
          renderCard={(t) => {
            const ent = RELATED_ENTITY[t.relatedType];
            const rel = ent && t.relatedId ? byId[ent]?.[t.relatedId] : null;
            const late = t.status !== 'Completed' && t.dueDate && daysFromToday(t.dueDate) < 0;
            return (
              <div>
                <button type="button" onClick={() => setEditing(t)} className="block w-full text-left text-[13.5px] font-medium leading-snug hover:underline">{t.title}</button>
                {rel ? <button type="button" onClick={() => openRecord(ent, rel.id)} className="mt-1 block w-full truncate text-left text-[12px] text-steel hover:underline">{t.relatedType}: {recordLabel(ent, rel)}</button> : null}
                <span className="mt-2 flex flex-wrap items-center gap-1.5 text-[12px]">
                  <Person name={t.assignedTo} />
                  {t.priority === 'High' ? <Badge>High</Badge> : null}
                  {t.dueDate ? <span className={late ? 'font-medium text-[#9E2A22]' : 'text-steel'}>{t.status === 'Completed' ? 'Done' : relativeDay(t.dueDate)}</span> : null}
                </span>
              </div>
            );
          }} />
      </Card>
      {adding ? <RecordForm entity="tasks" onClose={() => setAdding(false)} /> : null}
      {editing ? <RecordForm entity="tasks" record={editing} onClose={() => setEditing(null)} /> : null}
    </div>
  );
}
