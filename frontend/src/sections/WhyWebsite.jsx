import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import Icon from '../components/Icon';
import { whyWebsite } from '../data/business';

export default function WhyWebsite() {
  return (
    <section id="why-website" className="section-pad bg-paper-2" aria-labelledby="why-website-title">
      <div className="container-site">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading id="why-website-title" eyebrow="Why it matters" title="Why your business *needs a website.*" />
          <Reveal as="p" delay={150} className="max-w-sm text-steel lg:text-right">
            Customers look you up before they call, visit or buy. Your website is often the first impression.
          </Reveal>
        </div>
        <ol className="mt-14 grid gap-px overflow-hidden rounded-[26px] bg-ink/10 ring-1 ring-ink/10 sm:grid-cols-2 lg:grid-cols-5">
          {whyWebsite.map((w, i) => (
            <Reveal
              as="li"
              key={w.title}
              delay={i * 80}
              className={'group flex flex-col bg-paper-2 p-6 transition-colors duration-500 hover:bg-paper sm:p-7' + (i === whyWebsite.length - 1 ? ' sm:col-span-2 lg:col-span-1' : '')}
            >
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 text-ink transition-all duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                  <Icon name={w.icon} size={20} />
                </span>
                <span className="font-mono text-xs text-steel">0{i + 1}</span>
              </div>
              <h3 className="mt-10 text-[22px] font-semibold leading-tight tracking-tight lg:mt-14">{w.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-steel">{w.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
