import { useEffect, useRef, useState } from 'react';
import { cn } from '../shared/cn';

/*
 * Small, dependency-free charts. Palette validated for colour-vision
 * deficiency with the dataviz validator: primary #4C5FD5, secondary #D9826F.
 * Every chart has direct labels and a "Show data" table.
 */
export const CHART = { primary: '#4C5FD5', secondary: '#D9826F', grid: 'rgba(15,16,18,.08)', text: '#6B7079' };

/** Vertical columns over time (single series). */
export function ColumnChart({ data, format, height = 200, label }) {
  const [hover, setHover] = useState(null);
  const box = useRef(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const max = Math.max(...data.map((d) => d.value), 1);
  const nice = niceMax(max);
  const ticks = [0, nice / 2, nice];
  const H = height; const padL = 44; const padB = 24; const padT = 12;
  const bw = (W - padL) / data.length;
  const y = (v) => padT + (H - padT - padB) * (1 - v / nice);
  return (
    <figure className="relative" ref={box}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block max-w-full" role="img" aria-label={label}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W} y1={y(t)} y2={y(t)} stroke={CHART.grid} />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={CHART.text}>{format(t)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = padL + i * bw + bw * 0.18;
          const w = bw * 0.64;
          const top = y(d.value);
          const h = Math.max(0, H - padB - top);
          return (
            <g key={d.key} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${d.label} ${d.year}: ${format(d.value)}`}>
              <rect x={padL + i * bw} y={padT} width={bw} height={H - padT - padB} fill="transparent" />
              {h > 0 ? <path d={roundedTop(x, top, w, h, 4)} fill={CHART.primary} opacity={hover === null || hover === i ? 1 : 0.55} /> : null}
              <text x={x + w / 2} y={H - 7} textAnchor="middle" fontSize="11" fill={CHART.text}>{d.label}</text>
            </g>
          );
        })}
      </svg>
      {hover !== null ? (
        <div className="pointer-events-none absolute top-0 rounded-lg bg-ink px-2.5 py-1.5 text-[12px] text-paper shadow-lg" style={{ left: `${((padL + (hover + 0.5) * bw) / W) * 100}%`, transform: 'translateX(-50%)' }}>
          <strong className="font-semibold tabular-nums">{format(data[hover].value)}</strong> <span className="text-paper/70">{data[hover].label} {data[hover].year}</span>
        </div>
      ) : null}
      <DataTableToggle rows={data.map((d) => [`${d.label} ${d.year}`, format(d.value)])} headers={['Month', 'Value']} />
    </figure>
  );
}

/** Horizontal bars with direct labels (categories). */
export function BarList({ rows, format = (v) => v, color = CHART.primary, empty = 'No data yet.' }) {
  if (!rows.length) return <p className="py-6 text-center text-[13px] text-steel">{empty}</p>;
  const max = Math.max(...rows.map((r) => r[1]), 1);
  return (
    <ul className="space-y-2.5">
      {rows.map(([name, v]) => (
        <li key={name} className="grid grid-cols-[minmax(90px,34%)_1fr_auto] items-center gap-3 text-[13px]" title={`${name}: ${format(v)}`}>
          <span className="truncate text-ink/80">{name}</span>
          <span className="h-2.5 rounded-full bg-ink/[.05]"><span className="block h-full rounded-full" style={{ width: v ? `${Math.max(2, (v / max) * 100)}%` : 0, background: color }} /></span>
          <span className="text-right font-medium tabular-nums">{format(v)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Two-part bar (e.g. received vs pending). */
export function SplitBar({ parts, format }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <div>
      <div className="flex h-3 gap-[2px] overflow-hidden rounded-full bg-ink/[.05]" role="img" aria-label={parts.map((p) => `${p.label} ${format(p.value)}`).join(', ')}>
        {parts.map((p) => p.value > 0 ? <span key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} className="h-full first:rounded-l-full last:rounded-r-full" /> : null)}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px]">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} aria-hidden="true" /><span className="text-steel">{p.label}</span><span className="font-medium tabular-nums">{format(p.value)}</span></li>
        ))}
      </ul>
    </div>
  );
}

function DataTableToggle({ rows, headers }) {
  return (
    <details className="mt-2 text-[12.5px]">
      <summary className="cursor-pointer text-steel hover:text-ink">Show data</summary>
      <table className="mt-2 w-full max-w-sm">
        <thead><tr className="text-left text-steel">{headers.map((h) => <th key={h} className="py-1 font-medium">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]} className="border-t border-ink/[.06]">{r.map((c, i) => <td key={i} className={cn('py-1', i > 0 && 'tabular-nums')}>{c}</td>)}</tr>)}</tbody>
      </table>
    </details>
  );
}

function niceMax(v) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}
function roundedTop(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`;
}
