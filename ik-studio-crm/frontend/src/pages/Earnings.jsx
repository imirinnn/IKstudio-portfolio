import { useMemo, useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Card, CardHeader, PageHeader, Stat, Segmented } from '../components/ui';
import { BarList, ColumnChart, SplitBar, CHART } from '../components/Charts';
import { count, dashboard, paymentSummary, receipts, revenueByMonth, sumBy } from '../lib/metrics';
import { compactMoney, money } from '../lib/format';

export default function Earnings() {
  const { data, byId } = useCrm();
  const [range, setRange] = useState(12);
  const m = useMemo(() => dashboard(data), [data]);
  const months = useMemo(() => revenueByMonth(data.payments, range), [data.payments, range]);
  const rec = useMemo(() => receipts(data.payments), [data.payments]);
  const completedRevenue = data.payments.filter((p) => paymentSummary(p).remaining === 0 && p.totalValue).reduce((s, p) => s + p.totalValue, 0);
  const byPackage = sumBy(rec, (r) => byId.projects[r.payment.projectId]?.package || byId.clients[r.payment.clientId]?.package, (r) => r.amount);
  const byType = sumBy(rec, (r) => byId.clients[r.payment.clientId]?.projectType, (r) => r.amount);
  const payStatus = Object.entries(count(data.payments, (p) => paymentSummary(p).status));
  const leadsBySource = m.topSources;

  return (
    <div className="space-y-5">
      <PageHeader title="Earnings" sub="Revenue counts payments actually received, on the date they were recorded." />
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5" aria-label="Revenue summary">
        <Stat label="Total revenue" value={compactMoney(m.totalRevenue)} sub={money(m.totalRevenue)} />
        <Stat label="This month" value={compactMoney(m.revenueThisMonth)} />
        <Stat label="This year" value={compactMoney(m.revenueThisYear)} />
        <Stat label="Pending payments" value={compactMoney(m.pending)} sub={money(m.pending)} />
        <Stat label="Completed deal revenue" value={compactMoney(completedRevenue)} sub="Fully paid projects" />
      </section>

      <Card>
        <CardHeader title="Monthly revenue" sub="Payments received per month" action={<Segmented label="Range" value={range} onChange={setRange} options={[{ value: 6, label: '6 months' }, { value: 12, label: '12 months' }]} />} />
        <div className="p-4"><ColumnChart data={months} format={compactMoney} label={`Revenue received per month, last ${range} months`} height={220} /></div>
      </Card>

      <Card>
        <CardHeader title="Received vs pending" sub="Across all payment plans" />
        <div className="p-4"><SplitBar format={money} parts={[{ label: 'Received', value: m.totalRevenue, color: CHART.primary }, { label: 'Pending', value: m.pending, color: CHART.secondary }]} /></div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card><CardHeader title="Revenue by package" /><div className="p-4"><BarList rows={byPackage} format={compactMoney} empty="No payments received yet." /></div></Card>
        <Card><CardHeader title="Revenue by project type" /><div className="p-4"><BarList rows={byType} format={compactMoney} empty="No payments received yet." /></div></Card>
        <Card><CardHeader title="Won vs lost deals" /><div className="p-4"><BarList rows={[['Won', m.wonDeals], ['Lost', m.lostDeals]]} /></div></Card>
        <Card><CardHeader title="Leads by source" /><div className="p-4"><BarList rows={leadsBySource} /></div></Card>
        <Card><CardHeader title="Projects by type" /><div className="p-4"><BarList rows={Object.entries(count(data.projects, (p) => byId.clients[p.clientId]?.projectType || p.package || 'Other')).sort((a, b) => b[1] - a[1])} /></div></Card>
        <Card><CardHeader title="Payment plans by status" /><div className="p-4"><BarList rows={payStatus} /></div></Card>
      </div>
    </div>
  );
}
