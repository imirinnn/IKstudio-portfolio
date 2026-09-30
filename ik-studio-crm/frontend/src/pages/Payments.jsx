import { useMemo, useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Badge, Btn, Card, PageHeader, Stat, Segmented } from '../components/ui';
import PaymentPlan from '../components/PaymentPlan';
import RecordForm from '../components/RecordForm';
import Confirm from '../components/Confirm';
import { paymentSummary } from '../lib/metrics';
import { money, date } from '../lib/format';
import { exportEntity } from '../lib/exporters';

export default function Payments() {
  const { data, byId, openRecord, remove } = useCrm();
  const [filter, setFilter] = useState('Outstanding');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const rows = useMemo(() => data.payments.map((p) => ({ p, s: paymentSummary(p) })), [data.payments]);
  const shown = rows.filter(({ s }) => filter === 'All' || (filter === 'Outstanding' ? s.remaining > 0 : s.remaining === 0));
  const totals = rows.reduce((a, { s }) => ({ total: a.total + s.total, paid: a.paid + s.totalPaid, remaining: a.remaining + s.remaining }), { total: 0, paid: 0, remaining: 0 });

  return (
    <div>
      <PageHeader title="Payments" sub="30% advance → 30% after development review → 40% after deployment and handover.">
        <Btn icon="download" onClick={() => exportEntity('payments', data.payments, byId)}>Export CSV</Btn>
        <Btn variant="primary" icon="plus" onClick={() => setAdding(true)}>Add payment plan</Btn>
      </PageHeader>
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Contracted value" value={money(totals.total)} sub={`${rows.length} payment plans`} />
        <Stat label="Received" value={money(totals.paid)} tone="green" />
        <Stat label="Remaining" value={money(totals.remaining)} sub="Pending instalments" />
      </div>
      <div className="mb-3"><Segmented label="Show" value={filter} onChange={setFilter} options={['Outstanding', 'Fully paid', 'All']} /></div>
      {shown.length ? (
        <div className="space-y-3">
          {shown.map(({ p, s }) => {
            const client = byId.clients[p.clientId];
            const project = byId.projects[p.projectId];
            return (
              <Card key={p.id} className="p-4">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[14px] font-semibold">
                      {client ? <button type="button" className="hover:underline" onClick={() => openRecord('clients', client.id)}>{client.businessName}</button> : 'No client linked'}
                      {project ? <span className="font-normal text-steel"> · <button type="button" className="hover:underline" onClick={() => openRecord('projects', project.id)}>{project.name}</button></span> : null}
                    </p>
                    <p className="text-[12px] text-steel">{p.code} · updated {date(p.updatedAt)}{p.notes ? ` · ${p.notes}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-1.5"><Badge>{s.status}</Badge><Btn size="sm" icon="edit" aria-label="Edit payment plan" onClick={() => setEditing(p)} /><Btn size="sm" variant="ghost" icon="trash" aria-label="Delete payment plan" onClick={() => setDeleting(p)} /></div>
                </div>
                <PaymentPlan payment={p} />
              </Card>
            );
          })}
        </div>
      ) : <Card className="p-8 text-center text-[13.5px] text-steel">No payment plans in this view.</Card>}
      {adding ? <RecordForm entity="payments" onClose={() => setAdding(false)} /> : null}
      {editing ? <RecordForm entity="payments" record={editing} onClose={() => setEditing(null)} /> : null}
      <Confirm open={!!deleting} title="Delete payment plan?" body="The plan and its payment records will be deleted. Timeline entries stay." onClose={() => setDeleting(null)} onConfirm={async () => { await remove('payments', deleting.id); setDeleting(null); }} />
    </div>
  );
}
