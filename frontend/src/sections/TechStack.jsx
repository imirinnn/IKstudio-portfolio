import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import { stack } from '../data/process';
import { cn } from '../utils/cn';

const ownerText = { irin: 'Irin', kaviya: 'Kaviya', both: 'Both' };
const ownerDot = { irin: 'bg-sky', kaviya: 'bg-rose', both: 'bg-paper' };

export default function TechStack() {
  return (
    <section id="stack" className="section-pad bg-ink text-paper" aria-labelledby="stack-title">
      <div className="container-site">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading id="stack-title" eyebrow="Technology" title="A modern stack, *end to end.*" dark />
          <Reveal as="p" delay={150} className="max-w-sm text-mist lg:text-right">
            Widely used, well-documented tools, so your website stays easy to host and easy for any developer to work on later.
          </Reveal>
        </div>
        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1.35fr]">
          {stack.map((g, i) => (
            <Reveal key={g.group} delay={i * 90} className="flex flex-col rounded-[22px] border border-paper/12 bg-ink-2 p-6 transition-colors duration-500 hover:border-paper/30">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold">{g.group}</h3>
                <span className="label flex items-center gap-2 text-mist"><span className={cn('h-2 w-2 rounded-full', ownerDot[g.owner])} />{ownerText[g.owner]}</span>
              </div>
              <ul className="mt-8 flex flex-wrap gap-2">
                {g.items.map((t) => (
                  <li key={t} className="rounded-lg border border-paper/12 bg-ink px-3 py-2 font-mono text-[13px] text-paper/85 transition-all duration-300 hover:-translate-y-0.5 hover:border-paper/40 hover:text-paper">{t}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
