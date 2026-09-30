import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import Button from '../components/Button';
import Icon from '../components/Icon';
import TierMeter from '../components/TierMeter';
import { packages, clientPaid } from '../data/pricing';
import { useEnquiry } from '../context/EnquiryContext';
import { cn } from '../utils/cn';

export default function Pricing() {
  const { startProject } = useEnquiry();
  return (
    <section id="pricing" className="section-pad bg-paper" aria-labelledby="pricing-title">
      <div className="container-site">
        <SectionHeading
          id="pricing-title"
          eyebrow="Pricing"
          title="Clear packages. *No surprises.*"
          lead="Choose the level that fits your business. The final price within each range depends on the pages and features we agree in your proposal."
        />

        <div className="mt-16 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {packages.map((p, i) => (
            <Reveal
              as="article"
              key={p.id}
              delay={i * 100}
              aria-labelledby={`pkg-${p.id}`}
              className={cn(
                'group relative flex flex-col rounded-[26px] p-7 transition-transform duration-500 ease-out hover:-translate-y-1.5 sm:p-9',
                p.featured ? 'bg-ink text-paper shadow-[0_40px_80px_-40px_rgba(15,16,18,.7)]' : 'bg-paper-2 ring-1 ring-ink/[.06]',
              )}
            >
              <div className="flex items-center justify-between">
                <TierMeter tier={i + 1} dark={p.featured} />
                {p.featured ? <span className="label rounded-full bg-paper px-3 py-1 text-ink">Most complete</span> : null}
              </div>
              <h3 id={`pkg-${p.id}`} className="mt-8 text-3xl font-semibold tracking-tight">{p.name}</h3>
              <p className={cn('mt-2 text-[15px]', p.featured ? 'text-mist' : 'text-steel')}>{p.audience}</p>
              <p className="mt-8 font-display text-[clamp(2rem,3.4vw,2.6rem)] font-semibold leading-none tracking-[-0.035em] tabular-nums">{p.price}</p>
              <p className={cn('mt-2 font-mono text-[11px] uppercase tracking-label', p.featured ? 'text-mist' : 'text-steel')}>One-time project price</p>

              <ul className={cn('mt-8 space-y-3 border-t pt-8 text-[15px]', p.featured ? 'border-paper/15' : 'border-ink/10')}>
                {p.includes.map((it) => (
                  <li key={it} className="flex items-start gap-3">
                    <span className={cn('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full', p.featured ? 'bg-paper text-ink' : 'bg-ink text-paper')}>
                      <Icon name="check" size={12} strokeWidth={2.4} />
                    </span>
                    {it}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-10">
                <p className={cn('mb-4 text-[13px]', p.featured ? 'text-mist' : 'text-steel')}>Example build: {p.example}</p>
                <Button as="button" type="button" className="w-full" variant={p.featured ? 'light' : 'dark'} onClick={() => startProject(p.id)}>
                  Choose {p.name}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Pricing transparency */}
        <Reveal as="div" className="mt-8 grid overflow-hidden rounded-[26px] ring-1 ring-ink/10 lg:grid-cols-[1.3fr_1fr]" aria-labelledby="infra-title">
          <div className="bg-paper-2 p-7 sm:p-10">
            <p className="label flex items-center gap-2 text-ink"><span className="h-2 w-2 rounded-full bg-ink" aria-hidden="true" />Important</p>
            <h3 id="infra-title" className="mt-4 text-[clamp(1.6rem,3vw,2.2rem)] font-semibold leading-[1.05] tracking-tight">Hosting &amp; infrastructure charges are separate.</h3>
            <p className="mt-4 leading-relaxed text-steel">The client is responsible for, and pays directly:</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {clientPaid.map((c) => <li key={c} className="chip border-ink/15 bg-paper">{c}</li>)}
            </ul>
          </div>
          <div className="flex flex-col justify-between gap-8 bg-ink p-7 text-paper sm:p-10">
            <p className="label text-mist">We handle</p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold tracking-tight">
              Build <Icon name="arrow" size={22} className="text-mist" /> Deploy <Icon name="arrow" size={22} className="text-mist" /> Handover
            </p>
            <p className="text-[15px] leading-relaxed text-mist">One-time development price. Your domain, hosting and database accounts stay in your name.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
