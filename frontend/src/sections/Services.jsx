import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import { services } from '../data/services';
import { team } from '../data/team';
import { cn } from '../utils/cn';

const ownerLabel = { irin: 'Led by Irin', kaviya: 'Led by Kaviya', both: 'Irin + Kaviya' };

export default function Services() {
  return (
    <section id="services" className="section-pad bg-paper" aria-labelledby="services-title">
      <div className="container-site">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading id="services-title" eyebrow="Our services" title="Four ways we can *help your business online.*" />
          <Reveal as="p" delay={200} className="max-w-sm text-steel lg:text-right">
            From a first business website to a full-stack build, deployed on accounts you own.
          </Reveal>
        </div>

        <ol className="mt-16 border-t border-ink/15">
          {services.map((s, i) => (
            <Reveal as="li" key={s.no} delay={i * 60} className="group relative border-b border-ink/15">
              <div className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-700 ease-out group-hover:scale-y-100 group-focus-within:scale-y-100" aria-hidden="true" />
              <div className="relative grid gap-6 py-10 transition-colors duration-500 group-hover:text-paper md:grid-cols-[90px_1.1fr_1.4fr] md:gap-10 md:py-12 lg:grid-cols-[120px_1fr_1.5fr]">
                <span className="font-mono text-sm text-steel transition-colors group-hover:text-mist">{s.no}</span>
                <div>
                  <h3 className="text-[clamp(1.7rem,3.4vw,2.6rem)] font-semibold leading-none tracking-[-0.03em]">{s.title}</h3>
                  <p className="mt-4 max-w-md text-[16px] leading-relaxed text-steel transition-colors group-hover:text-mist">{s.lead}</p>
                  <p className="label mt-5 flex items-center gap-2 text-steel transition-colors group-hover:text-mist">
                    <OwnerDots owner={s.owner} />{ownerLabel[s.owner]}
                  </p>
                </div>
                <div>
                  <ul className="flex flex-wrap gap-2">
                    {s.items.map((it) => (
                      <li key={it} className="chip border-ink/15 bg-paper transition-colors duration-500 group-hover:border-paper/20 group-hover:bg-ink-2 group-hover:text-paper">{it}</li>
                    ))}
                  </ul>
                  {s.no === '04' ? (
                    <p className="mt-5 max-w-lg rounded-xl border border-ink/10 bg-paper-2 p-4 text-[14px] leading-relaxed text-ink/80 transition-colors group-hover:border-paper/15 group-hover:bg-ink-2 group-hover:text-paper/85">
                      Your domain, hosting, cloud and database accounts are created in your name. We configure and deploy on them; you keep full ownership.
                    </p>
                  ) : null}
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function OwnerDots({ owner }) {
  return (
    <span className="flex -space-x-1" aria-hidden="true">
      {(owner === 'both' ? ['irin', 'kaviya'] : [owner]).map((o) => (
        <span key={o} className={cn('h-2.5 w-2.5 rounded-full ring-2 ring-paper group-hover:ring-ink', team[o].tone === 'sky' ? 'bg-sky' : 'bg-rose')} />
      ))}
    </span>
  );
}
