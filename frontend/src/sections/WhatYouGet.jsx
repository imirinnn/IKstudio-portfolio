import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import Icon from '../components/Icon';
import { whatYouGet } from '../data/business';

export default function WhatYouGet() {
  return (
    <section id="what-you-get" className="section-pad bg-paper" aria-labelledby="what-you-get-title">
      <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
        <div>
          <SectionHeading
            id="what-you-get-title"
            eyebrow="Included"
            title="What *you get.*"
            lead="Every project is delivered as a complete, working website that belongs to you."
          />
          <Reveal as="p" delay={200} className="mt-8 inline-flex items-start gap-2 rounded-2xl bg-paper-2 px-4 py-3 text-[14px] text-steel ring-1 ring-ink/[.06]">
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-steel" aria-hidden="true" />
            Features vary depending on the selected package and project requirements.
          </Reveal>
        </div>
        <ul className="grid content-start gap-x-8 sm:grid-cols-2">
          {whatYouGet.map((item, i) => (
            <Reveal as="li" key={item} delay={(i % 6) * 60} className="flex items-center gap-4 border-b border-ink/10 py-4 text-[16px] sm:text-[17px]">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-paper">
                <Icon name="check" size={14} strokeWidth={2.4} />
              </span>
              {item}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
