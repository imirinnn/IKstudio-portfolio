import { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Badge, Btn, Card, PageHeader, Person } from '../components/ui';
import DataTable from '../components/DataTable';
import Toolbar from '../components/Toolbar';
import RecordForm from '../components/RecordForm';
import { CLIENT_STATUS, PACKAGES, entities } from '../config/entities';
import { useListState } from '../lib/useListState';
import { uniq } from '../lib/filter';
import { date, money } from '../lib/format';
import { paymentSummary } from '../lib/metrics';
import { exportEntity } from '../lib/exporters';

const SKIP = ['paymentStatus'];

export default function Clients() {
  const { data, byId, openRecord } = useCrm();
  const [adding, setAdding] = useState(false);
  const payStatus = (c) => {
    const plans = data.payments.filter((p) => p.clientId === c.id);
    if (!plans.length) return 'No plan';
    const s = plans.map(paymentSummary);
    const paid = s.reduce((a, x) => a + x.totalPaid, 0); const total = s.reduce((a, x) => a + x.total, 0);
    return paid === 0 ? 'Unpaid' : paid >= total ? 'Paid' : 'Partially paid';
  };
  const list = useListState(data.clients, { searchKeys: entities.clients.search, dateKey: 'startDate', skip: SKIP });
  const rows = list.values.paymentStatus ? list.filtered.filter((c) => payStatus(c) === list.values.paymentStatus) : list.filtered;

  const columns = [
    { key: 'businessName', label: 'Client', primary: true, sort: (r) => r.businessName.toLowerCase(), render: (r) => <span><span className="font-medium">{r.businessName}</span><span className="block text-[12px] font-normal text-steel">{r.code} · {r.contactPerson || '—'}</span></span> },
    { key: 'package', label: 'Package' },
    { key: 'finalPrice', label: 'Price', className: 'text-right', sort: (r) => r.finalPrice || 0, render: (r) => <span className="tabular-nums">{money(r.finalPrice)}</span> },
    { key: 'projectStatus', label: 'Project status', sort: (r) => CLIENT_STATUS.indexOf(r.projectStatus), render: (r) => <Badge>{r.projectStatus}</Badge> },
    { key: 'payment', label: 'Payment', render: (r) => <Badge>{payStatus(r)}</Badge> },
    { key: 'expectedCompletion', label: 'Expected completion', sort: (r) => r.expectedCompletion || '', render: (r) => date(r.expectedCompletion) },
    { key: 'assignedTo', label: 'Assigned', render: (r) => <Person name={r.assignedTo} /> },
    { key: 'location', label: 'Location', hideSm: true },
  ];

  return (
    <div>
      <PageHeader title="Clients" sub="Confirmed clients. Convert a won lead or deal to add one with its project and payment plan.">
        <Btn variant="primary" icon="plus" onClick={() => setAdding(true)}>Add client</Btn>
      </PageHeader>
      <Card>
        <Toolbar q={list.q} setQ={list.setQ} values={list.values} setValue={list.setValue} onReset={list.reset}
          filters={[
            { key: 'projectStatus', label: 'Project statuses', options: CLIENT_STATUS },
            { key: 'package', label: 'Packages', options: PACKAGES },
            { key: 'paymentStatus', label: 'Payment statuses', options: ['Unpaid', 'Partially paid', 'Paid', 'No plan'] },
            { key: 'location', label: 'Locations', options: uniq(data.clients, 'location') },
          ]}
          dateRange={{ label: 'Started' }} onExport={() => exportEntity('clients', rows, byId)} />
        <DataTable rows={rows} columns={columns} sort={list.sort} onSort={list.setSort} onRowClick={(r) => openRecord('clients', r.id)} rowLabel={(r) => r.businessName} empty={{ title: 'No clients yet', body: 'When a lead is won, use “Convert to client”.' }} />
      </Card>
      {adding ? <RecordForm entity="clients" onClose={() => setAdding(false)} /> : null}
    </div>
  );
}
