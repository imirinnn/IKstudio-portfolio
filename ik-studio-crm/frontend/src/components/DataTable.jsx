import { useState } from 'react';
import Icon from '../shared/Icon';
import { Empty } from './ui';
import { cn } from '../shared/cn';

/**
 * Sortable table on tablet/desktop; stacked cards on phones.
 * columns: [{ key, label, render(row), sort(row), className, primary, hideSm }]
 */
export default function DataTable({ rows, columns, onRowClick, rowLabel, empty, sort, onSort, getRowTone }) {
  if (!rows.length) return <Empty title={empty?.title || 'Nothing here yet'}>{empty?.body}</Empty>;
  const primary = columns.find((c) => c.primary) || columns[0];
  const rest = columns.filter((c) => c !== primary && !c.hideSm);
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-ink/10 text-[12px] text-steel">
              {columns.map((c) => {
                const active = sort?.key === c.key;
                return (
                  <th key={c.key} scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined} className={cn('whitespace-nowrap px-4 py-2.5 font-medium', c.className)}>
                    {c.sort ? (
                      <button type="button" onClick={() => onSort?.({ key: c.key, get: c.sort, dir: active && sort.dir === 'desc' ? 'asc' : 'desc' })} className="inline-flex items-center gap-1 hover:text-ink">
                        {c.label}
                        <Icon name="arrowDown" size={12} className={cn('transition-transform', active ? 'opacity-100' : 'opacity-0', active && sort.dir === 'asc' && 'rotate-180')} />
                      </button>
                    ) : c.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={cn('border-b border-ink/[.06] last:border-0', onRowClick && 'cursor-pointer hover:bg-paper/70', getRowTone?.(r))} onClick={onRowClick ? () => onRowClick(r) : undefined}>
                {columns.map((c, i) => (
                  <td key={c.key} className={cn('px-4 py-2.5 align-middle', c.className)}>
                    {i === 0 && onRowClick ? (
                      <button type="button" className="text-left font-medium text-ink hover:underline focus-visible:underline" onClick={(e) => { e.stopPropagation(); onRowClick(r); }} aria-label={`Open ${rowLabel ? rowLabel(r) : 'record'}`}>
                        {c.render ? c.render(r) : r[c.key]}
                      </button>
                    ) : c.render ? c.render(r) : r[c.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-ink/[.07] md:hidden">
        {rows.map((r) => (
          <li key={r.id} className={cn('px-4 py-3', onRowClick && 'cursor-pointer active:bg-paper', getRowTone?.(r))} onClick={onRowClick ? () => onRowClick(r) : undefined}>
            {onRowClick ? (
              <button type="button" className="text-left text-[14px] font-medium hover:underline" onClick={(e) => { e.stopPropagation(); onRowClick(r); }}>
                {primary.render ? primary.render(r) : r[primary.key]}
              </button>
            ) : <div className="text-[14px] font-medium">{primary.render ? primary.render(r) : r[primary.key]}</div>}
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12.5px]">
              {rest.map((c) => (
                <div key={c.key} className="min-w-0">
                  <dt className="text-steel">{c.label}</dt>
                  <dd className="truncate">{c.render ? c.render(r) : r[c.key] ?? '—'}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
