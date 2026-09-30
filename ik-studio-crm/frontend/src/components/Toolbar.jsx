import { useState } from 'react';
import Icon from '../shared/Icon';
import { Btn, inputCls, Select } from './ui';
import { ADMINS } from '../config/entities';
import { cn } from '../shared/cn';

/**
 * Search + filters row. `filters`: [{ key, label, options }]. State is owned by the page.
 */
export default function Toolbar({ q, setQ, filters = [], values, setValue, assignee = true, dateRange, onExport, onReset, placeholder = 'Search…', children }) {
  const active = q || Object.values(values).some(Boolean);
  const [open, setOpen] = useState(false);
  const count = Object.values(values).filter(Boolean).length;
  return (
    <div className="flex flex-col gap-2 border-b border-ink/[.07] p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-[200px]">
          <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label="Search this list" className={cn(inputCls, 'pl-9')} />
        </div>
        {children}
        <Btn className="md:hidden" icon="settings" aria-expanded={open} aria-controls="list-filters" onClick={() => setOpen((o) => !o)}>Filters{count ? ` (${count})` : ''}</Btn>
        {onExport ? <Btn icon="download" onClick={onExport}>Export CSV</Btn> : null}
      </div>
      <div id="list-filters" className={cn('flex-wrap items-center gap-2 md:flex', open ? 'grid grid-cols-1 sm:flex' : 'hidden')}>
        {assignee ? (
          <Select aria-label="Assigned to" value={values.assignedTo} onChange={(v) => setValue('assignedTo', v)} options={ADMINS} placeholder="Anyone" className="md:!w-auto md:min-w-[120px]" />
        ) : null}
        {filters.map((f) => (
          <Select key={f.key} aria-label={f.label} value={values[f.key]} onChange={(v) => setValue(f.key, v)} options={f.options} placeholder={`All ${f.label.toLowerCase()}`} className="md:!w-auto md:min-w-[140px] md:max-w-[220px]" />
        ))}
        {dateRange ? (
          <div className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-steel">
            <label htmlFor="tb-from">{dateRange.label}</label>
            <input id="tb-from" type="date" value={values.from || ''} onChange={(e) => setValue('from', e.target.value)} className={cn(inputCls, '!w-[150px]')} aria-label={`${dateRange.label} from`} />
            <span aria-hidden="true">–</span>
            <input type="date" value={values.to || ''} onChange={(e) => setValue('to', e.target.value)} className={cn(inputCls, '!w-[150px]')} aria-label={`${dateRange.label} to`} />
          </div>
        ) : null}
        {active && onReset ? <Btn variant="ghost" size="sm" onClick={onReset}>Clear filters</Btn> : null}
      </div>
    </div>
  );
}
