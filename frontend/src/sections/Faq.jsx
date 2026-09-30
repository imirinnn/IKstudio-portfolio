import { useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import Icon from '../components/Icon';
import { faqs } from '../data/business';
import { cn } from '../utils/cn';

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="section-pad bg-paper-2" aria-labelledby="faq-title">
      <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading id="faq-title" eyebrow="FAQ" title="Frequently asked *questions.*" lead="Straight answers about hosting, payments, ownership and what happens after launch." />
        </div>
        <Reveal as="ul" className="border-t border-ink/15">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q} className="border-b border-ink/15">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left font-display text-[19px] font-semibold tracking-tight sm:text-[22px]"
                  >
                    {f.q}
                    <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-500', isOpen ? 'rotate-45 border-ink bg-ink text-paper' : 'border-ink/20 group-hover:border-ink')}>
                      <Icon name="plus" size={16} />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  className={cn('grid transition-[grid-template-rows] duration-500 ease-out', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
                >
                  <div className="overflow-hidden" inert={!isOpen}>
                    <p className={cn('max-w-2xl pb-6 pr-14 text-[16px] leading-relaxed text-steel transition-opacity duration-500', isOpen ? 'opacity-100' : 'opacity-0')}>{f.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
