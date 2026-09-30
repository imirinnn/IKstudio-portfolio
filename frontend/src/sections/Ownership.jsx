import SplitText from '../components/SplitText';
import Reveal from '../components/Reveal';
import Icon from '../components/Icon';
import { ownership } from '../data/business';

export default function Ownership() {
  return (
    <section id="ownership" className="section-pad bg-ink text-paper" aria-labelledby="ownership-title">
      <div className="container-site">
        <p className="label flex items-center gap-3 text-mist"><span className="h-px w-8 bg-mist/60" aria-hidden="true" />Our business model</p>
        <SplitText as="h2" id="ownership-title" text="You own it. *We build it.*" className="mt-5 text-[clamp(2.6rem,7vw,5.6rem)] font-semibold leading-[.95] tracking-[-0.045em]" emClass="text-mist" />

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          <Reveal className="rounded-[26px] bg-paper p-7 text-ink sm:p-9">
            <p className="label text-steel">You own</p>
            <ul className="mt-6 space-y-3.5">
              {ownership.client.map((c) => (
                <li key={c} className="flex items-center gap-3 text-[17px]"><Icon name="key" size={18} className="shrink-0 text-steel" />{c}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120} className="rounded-[26px] border border-paper/15 p-7 sm:p-9">
            <p className="label text-mist">We handle</p>
            <ul className="mt-6 space-y-3.5">
              {ownership.us.map((c) => (
                <li key={c} className="flex items-center gap-3 text-[17px]"><Icon name="check" size={18} className="shrink-0 text-mist" />{c}</li>
              ))}
            </ul>
          </Reveal>
        </div>

        <ol className="mt-4 grid gap-px overflow-hidden rounded-[26px] bg-paper/10 sm:grid-cols-2 lg:grid-cols-4" aria-label="Client ownership, development, deployment, handover">
          {ownership.flow.map((f, i) => (
            <Reveal as="li" key={f.title} delay={i * 110} className="relative bg-ink-2 p-6 sm:p-7">
              <p className="flex items-center gap-2 font-mono text-xs text-mist">
                0{i + 1}{i < ownership.flow.length - 1 ? <Icon name="arrow" size={14} className="max-lg:rotate-90 lg:ml-auto" /> : null}
              </p>
              <p className="mt-4 font-display text-2xl font-semibold tracking-tight">{f.title}</p>
              <p className="mt-2 text-[15px] text-mist">{f.body}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-10 grid gap-6 border-t border-paper/15 pt-8 text-[15px] leading-relaxed md:grid-cols-2">
          <p className="text-mist">
            <span className="font-medium text-paper">Infrastructure costs are separate.</span> Hosting, domain, cloud, database, paid APIs, email/SMS services and other third-party infrastructure costs are separate from development charges. You pay them directly to the provider.
          </p>
          <p className="text-mist">
            <span className="font-medium text-paper">Maintenance is not included by default.</span> After handover the project is fully yours. Future changes or additional features can be discussed separately whenever you need them.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
