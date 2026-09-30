import { forwardRef } from 'react';
import Icon from '../shared/Icon';
import { cn } from '../shared/cn';

export const btn = {
  base: 'inline-flex items-center justify-center gap-2 rounded-lg text-[13.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
  primary: 'bg-ink text-paper hover:bg-ink-3',
  secondary: 'border border-ink/15 bg-white text-ink hover:border-ink/40',
  ghost: 'text-ink/70 hover:bg-ink/[.06] hover:text-ink',
  danger: 'bg-[#B3261E] text-white hover:bg-[#8C1D18]',
  md: 'h-9 px-3.5', sm: 'h-8 px-2.5 text-[13px]', icon: 'h-9 w-9',
};

export const Btn = forwardRef(function Btn({ variant = 'secondary', size = 'md', icon, className, children, ...rest }, ref) {
  return (
    <button ref={ref} type="button" className={cn(btn.base, btn[variant], btn[size], className)} {...rest}>
      {icon ? <Icon name={icon} size={16} /> : null}
      {children}
    </button>
  );
});

// Status → tone. Status colours are reserved for state and always come with a text label.
const TONES = {
  green: 'bg-[#E3F2E8] text-[#1E6B3A] ring-[#1E6B3A]/15',
  blue: 'bg-[#E6EAFB] text-[#2F3F9E] ring-[#2F3F9E]/15',
  amber: 'bg-[#FBF0DC] text-[#8A5A00] ring-[#8A5A00]/15',
  red: 'bg-[#FBE6E4] text-[#9E2A22] ring-[#9E2A22]/15',
  gray: 'bg-ink/[.05] text-ink/70 ring-ink/10',
  sky: 'bg-[#E9ECFF] text-[#34408F] ring-[#34408F]/15',
  rose: 'bg-[#F9E7E5] text-[#8A3B31] ring-[#8A3B31]/15',
};
const STATUS_TONE = {
  New: 'blue', Contacted: 'blue', Interested: 'blue', Discussion: 'amber', 'Requirement Gathering': 'amber', 'Proposal Sent': 'amber', Negotiation: 'amber', 'Awaiting Confirmation': 'amber',
  Won: 'green', 'Project Started': 'green', Completed: 'green', Paid: 'green', Live: 'green', 'Handed over': 'green',
  Lost: 'red', Unpaid: 'red', High: 'red', Overdue: 'red',
  'Partially paid': 'amber', Pending: 'amber', Medium: 'amber', 'In Progress': 'blue', Staging: 'amber',
  Low: 'gray', 'To Do': 'gray', 'Not Started': 'gray', 'Not deployed': 'gray', 'No plan': 'gray', Unassigned: 'gray',
  Planning: 'blue', Design: 'blue', Development: 'blue', 'Client Review': 'amber', Finalization: 'amber', Deployment: 'amber', Handover: 'green',
  Irin: 'sky', Kaviya: 'rose',
};

export function Badge({ children, tone, className }) {
  const t = tone || STATUS_TONE[children] || 'gray';
  return <span className={cn('inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[12px] font-medium ring-1 ring-inset', TONES[t], className)}>{children}</span>;
}

export function Person({ name }) {
  if (!name) return <span className="text-steel">—</span>;
  const dot = name === 'Irin' ? 'bg-sky' : name === 'Kaviya' ? 'bg-rose' : 'bg-ink/20';
  return <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><span className={cn('h-2 w-2 rounded-full', dot)} aria-hidden="true" />{name}</span>;
}

export function Card({ className, children, ...rest }) {
  return <section className={cn('rounded-xl border border-ink/10 bg-white', className)} {...rest}>{children}</section>;
}

export function CardHeader({ title, action, sub }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-ink/[.07] px-4 py-3 sm:px-5">
      <div>
        <h2 className="font-sans text-[14px] font-semibold text-ink">{title}</h2>
        {sub ? <p className="mt-0.5 text-[12.5px] text-steel">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, sub, icon, tone }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12.5px] font-medium text-steel">{label}</p>
        {icon ? <Icon name={icon} size={16} className="text-steel/70" /> : null}
      </div>
      <p className={cn('mt-2 font-display text-[26px] font-semibold leading-none tracking-tight tabular-nums', tone === 'red' && 'text-[#9E2A22]', tone === 'green' && 'text-[#1E6B3A]')}>{value}</p>
      {sub ? <p className="mt-1.5 text-[12px] text-steel">{sub}</p> : null}
    </div>
  );
}

export function Empty({ title, children, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <p className="font-medium text-ink">{title}</p>
      {children ? <p className="mt-1 max-w-sm text-[13.5px] text-steel">{children}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export const inputCls = 'h-9 w-full rounded-lg border border-ink/15 bg-white px-3 text-[14px] text-ink placeholder:text-steel/60 hover:border-ink/30 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10 aria-[invalid=true]:border-[#B3261E]';

export function Select({ value, onChange, options, placeholder, className, ...rest }) {
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, 'pr-8', className)} {...rest}>
      {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
      {options.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
    </select>
  );
}

export function PageHeader({ title, sub, children }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-tight">{title}</h1>
        {sub ? <p className="mt-1 text-[13.5px] text-steel">{sub}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

export function Segmented({ value, onChange, options, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-ink/15 bg-white p-0.5">
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value;
        const l = typeof o === 'string' ? o : o.label;
        return (
          <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}
            className={cn('inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] transition-colors', value === v ? 'bg-ink text-paper' : 'text-ink/70 hover:text-ink')}>
            {o.icon ? <Icon name={o.icon} size={15} /> : null}{l}
          </button>
        );
      })}
    </div>
  );
}
