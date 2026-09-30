import { useState } from 'react';
import { cn } from '../shared/cn';

/**
 * Board with drag-and-drop between columns. Each card also has a "Move to"
 * select so the board works with a keyboard and on touch screens.
 */
export default function Kanban({ columns, items, getColumn, onMove, renderCard, columnMeta, cardLabel }) {
  const [over, setOver] = useState(null);
  return (
    <div className="-mx-3 overflow-x-auto px-3 pb-2 sm:-mx-4 sm:px-4">
      <div className="flex min-w-max gap-3">
        {columns.map((col) => {
          const list = items.filter((i) => getColumn(i) === col);
          return (
            <section
              key={col}
              aria-label={`${col}, ${list.length} items`}
              onDragOver={(e) => { e.preventDefault(); setOver(col); }}
              onDragLeave={() => setOver((o) => (o === col ? null : o))}
              onDrop={(e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData('text/plain'); const item = items.find((i) => i.id === id); if (item && getColumn(item) !== col) onMove(item, col); }}
              className={cn('flex w-[264px] shrink-0 flex-col rounded-xl bg-ink/[.035] transition-colors', over === col && 'bg-sky/30 ring-2 ring-sky')}
            >
              <header className="flex items-center justify-between px-3 pb-2 pt-3">
                <h3 className="font-sans text-[13px] font-semibold">{col}</h3>
                <span className="text-[12px] tabular-nums text-steel">{list.length}{columnMeta ? ` · ${columnMeta(list)}` : ''}</span>
              </header>
              <ul className="flex min-h-[80px] flex-1 flex-col gap-2 px-2 pb-2">
                {list.map((item) => (
                  <li
                    key={item.id}
                    draggable
                    onDragStart={(e) => { e.dataTransfer.setData('text/plain', item.id); e.dataTransfer.effectAllowed = 'move'; }}
                    className="min-w-0 cursor-grab rounded-lg border border-ink/10 bg-white p-3 shadow-[0_1px_0_rgba(15,16,18,.04)] active:cursor-grabbing"
                  >
                    {renderCard(item)}
                    <label className="mt-2 flex items-center gap-1.5 text-[11.5px] text-steel">
                      <span className="sr-only">Move {cardLabel ? cardLabel(item) : 'card'} to</span>
                      <span aria-hidden="true">Move to</span>
                      <select value={col} onChange={(e) => onMove(item, e.target.value)} className="min-w-0 flex-1 rounded-md border border-ink/10 bg-paper/60 px-1.5 py-1 text-[12px] text-ink">
                        {columns.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
