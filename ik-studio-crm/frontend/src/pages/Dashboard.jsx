import { useMemo, useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, Stat, Person, Badge, Btn } from '../components/ui';
import { BarList, ColumnChart, CHART } from '../components/Charts';
import LogContactModal from '../components/LogContactModal';
import { dashboard, revenueByMonth } from '../lib/metrics';
import { compactMoney, date, money, relativeDay } from '../lib/format';
import { Link } from '../shared/router';

export default function Dashboard() {
  const { data, byId, openRecord } = useCrm();
  const { admin } = useAuth();
  const m = useMemo(() => dashboard(data), [data]);
  const months = useMemo(() => revenueByMonth(data.payments, 6), [data.payments]);
  const [logging, setLogging] = useState(null);
  const hour = new Date().getHours();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight">Good {hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}, {admin.name}</h1>
        <p className="mt-1 text-[13.5px] text-steel">
          {m.fuOverdue.length + m.fuToday.length ? `${m.fuOverdue.length + m.fuToday.length} follow-up${m.fuOverdue.length + m.fuToday.length === 1 ? '' : 's'} need attention today.` : 'No follow-ups due today.'}
        </p>
      </div>

      <section aria-label="Summary" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Total leads" value={m.totalLeads} icon="users" />
        <Stat label="Active leads" value={m.activeLeads} sub="Still being followed up" />
        <Stat label="Open deals" value={m.openDeals} sub={`${compactMoney(m.openDealValue)} in discussion`} icon="briefcase" />
        <Stat label="Won deals" value={m.wonDeals} sub={`${m.lostDeals} lost`} />
        <Stat label="Active clients" value={m.activeClients} icon="store" />
        <Stat label="Projects in progress" value={m.projectsInProgress} icon="folder" />
        <Stat label="Completed projects" value={m.completedProjects} />
        <Stat label="Total revenue" value={compactMoney(m.totalRevenue)} sub="Payments received" icon="wallet" />
        <Stat label="Pending payments" value={compactMoney(m.pending)} sub="Still to be received" tone={m.pending ? undefined : 'green'} />
        <Stat label="This month's revenue" value={compactMoney(m.revenueThisMonth)} />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Follow-up alerts" action={<Link to="/follow-ups" className="text-[13px] text-steel hover:text-ink">All follow-ups →</Link>} />
          <div className="divide-y divide-ink/[.07]">
            <FuGroup title="Overdue" tone="red" items={m.fuOverdue} byId={byId} onDone={setLogging} openRecord={openRecord} />
            <FuGroup title="Today" tone="amber" items={m.fuToday} byId={byId} onDone={setLogging} openRecord={openRecord} />
            <FuGroup title="Next 7 days" tone="gray" items={m.fuUpcoming} byId={byId} onDone={setLogging} openRecord={openRecord} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Business insights" />
          <dl className="grid grid-cols-2 gap-px bg-ink/[.07]">
            {[
              ['Lead conversion', `${Math.round(m.conversion * 100)}%`, `${m.wonLeads} of ${m.totalLeads} leads won`],
              ['Average deal value', money(m.avgDealValue), 'Across confirmed clients'],
              ['Pending revenue', money(m.pending), 'Unpaid instalments'],
              ['Revenue this year', money(m.revenueThisYear), 'Received'],
            ].map(([k, v, s]) => (
              <div key={k} className="bg-white p-4"><dt className="text-[12.5px] text-steel">{k}</dt><dd className="mt-1 font-display text-[20px] font-semibold tabular-nums">{v}</dd><dd className="text-[12px] text-steel">{s}</dd></div>
            ))}
          </dl>
          <div className="border-t border-ink/[.07] p-4">
            <p className="mb-3 text-[13px] font-semibold">Top lead sources</p>
            <BarList rows={m.topSources.slice(0, 6)} />
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Revenue received" sub="Last 6 months" action={<Link to="/earnings" className="text-[13px] text-steel hover:text-ink">Earnings →</Link>} />
          <div className="p-4"><ColumnChart data={months} format={compactMoney} label="Revenue received per month, last 6 months" height={190} /></div>
        </Card>
        <Card>
          <CardHeader title="Upcoming deadlines" sub="Projects due in the next 14 days" />
          {m.upcomingDeadlines.length ? (
            <ul className="divide-y divide-ink/[.07]">
              {m.upcomingDeadlines.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => openRecord('projects', p.id)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-paper/60">
                    <span className="min-w-0"><span className="block truncate text-[13.5px] font-medium">{p.name}</span><span className="text-[12px] text-steel">{date(p.deadline)} · <Person name={p.assignedTo} /></span></span>
                    <Badge tone={new Date(p.deadline) < new Date() ? 'red' : 'amber'}>{relativeDay(p.deadline).replace('overdue', 'late')}</Badge>
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="p-4 text-[13px] text-steel">No project deadlines in the next two weeks.</p>}
          <div className="border-t border-ink/[.07] p-4">
            <p className="mb-2 text-[13px] font-semibold">Payments</p>
            <div className="flex h-2.5 gap-[2px] overflow-hidden rounded-full bg-ink/[.05]" aria-hidden="true">
              <span style={{ width: `${(m.totalRevenue / (m.contracted || 1)) * 100}%`, background: CHART.primary }} />
              <span style={{ width: `${(m.pending / (m.contracted || 1)) * 100}%`, background: CHART.secondary }} />
            </div>
            <p className="mt-2 flex flex-wrap gap-x-4 text-[12.5px] text-steel"><span>Received <strong className="text-ink tabular-nums">{money(m.totalRevenue)}</strong></span><span>Pending <strong className="text-ink tabular-nums">{money(m.pending)}</strong></span></p>
          </div>
        </Card>
      </div>

      {logging ? <LogContactModal item={logging} onClose={() => setLogging(null)} /> : null}
    </div>
  );
}

function FuGroup({ title, tone, items, byId, onDone, openRecord }) {
  return (
    <div className="px-4 py-3">
      <p className="mb-2 flex items-center gap-2 text-[12.5px] font-semibold"><Badge tone={tone}>{title}</Badge><span className="text-steel">{items.length}</span></p>
      {items.length ? (
        <ul className="space-y-1.5">
          {items.slice(0, 6).map((f) => {
            const lead = f.leadId ? byId.leads[f.leadId] : null;
            const client = f.clientId ? byId.clients[f.clientId] : null;
            return (
              <li key={f.id} className="flex items-center justify-between gap-3 rounded-lg bg-paper/60 px-3 py-2">
                <button type="button" className="min-w-0 text-left" onClick={() => (lead ? openRecord('leads', lead.id) : client ? openRecord('clients', client.id) : null)}>
                  <span className="block truncate text-[13.5px] font-medium">{lead?.businessName || client?.businessName || f.title}</span>
                  <span className="block truncate text-[12px] text-steel">{f.fromLead ? 'Next follow-up' : f.title} · {relativeDay(f.dueDate)} · Assigned to {f.assignedTo || 'nobody'}</span>
                </button>
                <Btn size="sm" onClick={() => onDone(f)}>Done</Btn>
              </li>
            );
          })}
          {items.length > 6 ? <li className="text-[12px] text-steel">+ {items.length - 6} more</li> : null}
        </ul>
      ) : <p className="text-[12.5px] text-steel">Nothing here.</p>}
    </div>
  );
}
