import { useMemo, useRef, useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import { packages, paymentStages } from '../data/pricing';
import { useInView } from '../hooks/useInView';
import { formatINR } from '../utils/format';
import { cn } from '../utils/cn';

const shades = ['bg-paper/35', 'bg-paper/65', 'bg-paper'];

export default function Payment() {
  const bar = useRef(null);
  const inView = useInView(bar);
  const [pkgId, setPkgId] = useState('full-stack');
  const pkg = packages.find((p) => p.id === pkgId);
  const [amount, setAmount] = useState(13500);

  const choosePkg = (id) => {
    const p = packages.find((x) => x.id === id);
    setPkgId(id);
    setAmount(Math.round((p.min + p.max) / 2 / 500) * 500);
  };
  const parts = useMemo(() => paymentStages.map((s) => (amount * s.pct) / 100), [amount]);

  return (
    <section id="payment" className="section-pad bg-ink text-paper" aria-labelledby="payment-title">
      <div className="container-site">
        <SectionHeading
          id="payment-title"
          eyebrow="How payment works"
          title="Three stages, *tied to real progress.*"
          lead="You pay as the project moves forward. The total depends on the package you choose."
          dark
        />

        {/* 30 → 30 → 40 bar */}
        <div ref={bar} className="mt-16" aria-hidden="true">
          <div className="flex h-3 gap-1.5 overflow-hidden rounded-full">
            {paymentStages.map((s, i) => (
              <div key={i} style={{ flexBasis: `${s.pct}%`, transitionDelay: `${i * 250}ms` }} className={cn('origin-left rounded-full transition-transform duration-1000 ease-out', shades[i], inView ? 'scale-x-100' : 'scale-x-0')} />
            ))}
          </div>
          <div className="mt-3 flex gap-1.5 font-display text-[clamp(2.2rem,6vw,4.5rem)] font-semibold leading-none tracking-[-0.04em]">
            {paymentStages.map((s, i) => (
              <p key={i} style={{ flexBasis: `${s.pct}%` }} className={cn(i === 2 ? 'text-paper' : 'text-paper/70')}>
                {s.pct}%{i < 2 ? <span className="ml-2 text-paper/30 max-sm:hidden">→</span> : null}
              </p>
            ))}
          </div>
        </div>

        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {paymentStages.map((s, i) => (
            <Reveal as="li" key={s.name} delay={i * 120} className="rounded-[22px] border border-paper/15 p-6 sm:p-7">
              <p className="label flex items-center justify-between text-mist"><span>Stage 0{i + 1}</span><span className="tabular-nums text-paper">{s.pct}%</span></p>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight">{s.name}</h3>
              <p className="mt-1 text-[14px] text-mist">{s.when}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-paper/80">{s.body}</p>
            </Reveal>
          ))}
        </ol>

        {/* Calculator */}
        <Reveal className="mt-6 grid gap-8 rounded-[22px] bg-paper p-6 text-ink sm:p-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">See your payment schedule</h3>
            <p className="mt-2 text-[15px] text-steel">Choose a package and a project value to see each stage.</p>
            <div className="mt-6 flex flex-wrap gap-2" role="radiogroup" aria-label="Package">
              {packages.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={pkgId === p.id}
                  onClick={() => choosePkg(p.id)}
                  className={cn('h-10 rounded-full border px-4 text-sm transition-colors', pkgId === p.id ? 'border-ink bg-ink text-paper' : 'border-ink/20 hover:border-ink')}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <label htmlFor="pay-amount" className="mt-6 flex items-baseline justify-between text-sm">
              <span className="text-steel">Project value</span>
              <span className="font-display text-2xl font-semibold tabular-nums">{formatINR(amount)}</span>
            </label>
            <input
              id="pay-amount"
              type="range"
              min={pkg.min}
              max={pkg.max}
              step={500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-3 w-full accent-ink"
              aria-valuetext={formatINR(amount)}
            />
            <p className="mt-1 flex justify-between font-mono text-[11px] text-steel"><span>{formatINR(pkg.min)}</span><span>{formatINR(pkg.max)}</span></p>
          </div>
          <ol className="grid gap-3 sm:grid-cols-3" aria-live="polite">
            {paymentStages.map((s, i) => (
              <li key={s.name} className={cn('rounded-2xl p-5', i === 2 ? 'bg-ink text-paper' : 'bg-paper-2')}>
                <p className={cn('font-mono text-[11px] uppercase tracking-label', i === 2 ? 'text-mist' : 'text-steel')}>{s.pct}% · {s.name}</p>
                <p className="mt-3 font-display text-[26px] font-semibold tabular-nums tracking-tight">{formatINR(parts[i])}</p>
              </li>
            ))}
          </ol>
        </Reveal>
        <p className="mt-4 text-[13px] text-mist">Example figures only. Hosting, domain and other third-party costs are paid separately, directly to the providers.</p>
      </div>
    </section>
  );
}
