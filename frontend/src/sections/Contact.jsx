import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import Icon from '../components/Icon';
import CopyButton from '../components/CopyButton';
import EnquiryForm from './EnquiryForm';
import { site } from '../data/site';

export default function Contact() {
  return (
    <section id="contact" className="section-pad bg-paper-2" aria-labelledby="contact-title">
      <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
        <div>
          <SectionHeading
            id="contact-title"
            eyebrow="Contact"
            title="Tell us about *your business.*"
            lead="Share a few details and we'll come back with the right package, the scope and a timeline. Prefer to talk? Call, email or message us on WhatsApp."
          />
          <div className="mt-10 space-y-3">
            <Reveal className="rounded-[22px] bg-paper p-5 ring-1 ring-ink/[.06] sm:p-6">
              <p className="label text-steel">Email</p>
              <p className="mt-2 select-all break-all font-display text-xl font-semibold tracking-tight sm:text-2xl">{site.email}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`mailto:${site.email}`} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] text-paper transition hover:bg-ink-3"><Icon name="mail" size={14} />Email us</a>
                <CopyButton value={site.email} label="email address" />
              </div>
            </Reveal>
            {site.phones.map((p, i) => (
              <Reveal key={p.tel} delay={(i + 1) * 80} className="rounded-[22px] bg-paper p-5 ring-1 ring-ink/[.06] sm:p-6">
                <p className="label text-steel">Phone {i + 1}</p>
                <p className="mt-2 select-all font-display text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">{p.display}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={`tel:${p.tel}`} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] text-paper transition hover:bg-ink-3"><Icon name="phone" size={14} />Call</a>
                  <a href={`https://wa.me/${p.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink/20 px-4 text-[13px] transition hover:border-ink"><Icon name="whatsapp" size={14} />WhatsApp</a>
                  <CopyButton value={p.display.replace(/\s/g, '')} label={`phone number ${p.display}`} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={150} className="relative"><EnquiryForm /></Reveal>
      </div>
    </section>
  );
}
