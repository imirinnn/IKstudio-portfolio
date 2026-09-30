import { useRef } from 'react';
import Reveal from '../components/Reveal';
import { stats } from '../data/site';
import { useInView } from '../hooks/useInView';
import { useCountUp } from '../hooks/useCountUp';

export default function Stats() {
  return (
    <section aria-label="Studio in numbers" className="bg-paper">
      <div className="container-site">
        <dl className="grid grid-cols-2 border-b border-ink/10 lg:grid-cols-4">
          {stats.map((s, i) => <Stat key={s.label} {...s} index={i} />)}
        </dl>
      </div>
    </section>
  );
}

function Stat({ value, suffix, label, note, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { rootMargin: '0px 0px -10% 0px' });
  const n = useCountUp(value, inView, 1400 + index * 150);
  return (
    <Reveal
      delay={index * 90}
      className={
        'flex flex-col-reverse justify-end gap-3 py-10 pr-4 md:py-14 ' +
        (index % 2 === 1 ? 'border-l border-ink/10 pl-5 md:pl-8 ' : 'lg:pl-8 ') +
        (index === 0 ? 'lg:pl-0 ' : '') +
        (index >= 2 ? 'border-t border-ink/10 lg:border-t-0 ' : '') +
        (index === 2 ? 'lg:border-l ' : '')
      }
    >
      <dt className="text-[15px] text-steel">
        {label}
        {note ? <span className="mt-1 block font-mono text-[11px] uppercase tracking-label text-steel/70">{note}</span> : null}
      </dt>
      <dd ref={ref} className="font-display text-[clamp(3.2rem,8vw,6rem)] font-semibold leading-none tracking-[-0.05em] tabular-nums text-ink">
        {n}<span className="text-steel">{suffix}</span>
      </dd>
    </Reveal>
  );
}
