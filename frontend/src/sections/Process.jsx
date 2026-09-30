import { useCallback, useRef } from 'react';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import { steps } from '../data/process';
import { useScrollProgress } from '../hooks/useScrollProgress';

export default function Process() {
  const list = useRef(null);
  const line = useRef(null);
  const onProgress = useCallback((p) => {
    if (line.current) line.current.style.transform = `scaleY(${Math.min(1, p * 1.6)})`;
  }, []);
  useScrollProgress(list, onProgress);

  return (
    <section id="process" className="section-pad bg-paper-2" aria-labelledby="process-title">
      <div className="container-site grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="process-title"
            eyebrow="How we work"
            title="From first call to *final handover.*"
            lead="Eight clear steps. You always know what happens next, and what we need from you."
          />
        </div>
        <ol ref={list} className="relative">
          <span className="absolute left-[19px] top-2 h-[calc(100%-16px)] w-px bg-ink/10" aria-hidden="true">
            <span ref={line} className="block h-full w-px origin-top bg-ink" style={{ transform: 'scaleY(0)' }} />
          </span>
          {steps.map((s, i) => (
            <Reveal as="li" key={s.no} delay={40} className="relative grid grid-cols-[40px_1fr] gap-6 pb-12 last:pb-0">
              <span className="relative z-10 grid h-10 w-10 place-items-center rounded-full bg-ink font-mono text-[12px] text-paper">{s.no}</span>
              <div className="pt-1.5">
                <h3 className="text-2xl font-semibold tracking-tight sm:text-[28px]">{s.title}</h3>
                <p className="mt-2 max-w-lg text-[16px] leading-relaxed text-steel">{s.body}</p>
                {i === 2 || i === 4 || i === 7 ? (
                  <p className="label mt-3 inline-flex rounded-full bg-paper px-3 py-1 text-ink">
                    {i === 2 ? 'Payment · 30%' : i === 4 ? 'Payment · 30% on approval' : 'Payment · final 40%'}
                  </p>
                ) : null}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
