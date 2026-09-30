import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import Icon from '../components/Icon';
import { reasons } from '../data/process';

export default function WhyUs() {
  return (
    <section id="why" className="section-pad bg-paper-2" aria-labelledby="why-title">
      <div className="container-site">
        <SectionHeading id="why-title" eyebrow="Why work with us" title="Small team. *Clear process. Full ownership.*" />
        <ul className="mt-16 grid gap-px overflow-hidden rounded-[26px] bg-ink/10 ring-1 ring-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <Reveal as="li" key={r.title} delay={(i % 3) * 90} className="group bg-paper-2 p-7 transition-colors duration-500 hover:bg-paper sm:p-9">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-paper transition-transform duration-500 ease-out group-hover:-rotate-6 group-hover:scale-105">
                <Icon name={r.icon} size={22} />
              </span>
              <h3 className="mt-8 text-2xl font-semibold tracking-tight">{r.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-steel">{r.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
