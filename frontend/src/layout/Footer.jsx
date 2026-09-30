import Logo from '../components/Logo';
import { nav, site } from '../data/site';
import { services } from '../data/services';
import { projects } from '../data/projects';
import { scrollToId } from '../utils/scroll';

export default function Footer() {
  const go = (e, id) => { e.preventDefault(); scrollToId(id); };
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink text-paper">
      <div className="container-site pt-20 pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-6 text-[15px] leading-relaxed text-mist">{site.description}</p>
          </div>
          <FooterCol title="Navigate">
            {nav.map((n) => <li key={n.id}><a className="footer-link" href={`#${n.id}`} onClick={(e) => go(e, n.id)}>{n.label}</a></li>)}
          </FooterCol>
          <FooterCol title="Services">
            {services.map((s) => <li key={s.no}><a className="footer-link" href="#services" onClick={(e) => go(e, 'services')}>{s.title}</a></li>)}
          </FooterCol>
          <FooterCol title="Projects">
            {projects.map((p) => <li key={p.slug}><a className="footer-link" href="#work" onClick={(e) => go(e, 'work')}>{p.title}</a></li>)}
          </FooterCol>
          <FooterCol title="Contact">
            <li><a className="footer-link break-all" href={`mailto:${site.email}`}>{site.email}</a></li>
            {site.phones.map((p) => <li key={p.tel}><a className="footer-link tabular-nums" href={`tel:${p.tel}`}>{p.display}</a></li>)}
          </FooterCol>
        </div>
        <p className="mt-20 select-none whitespace-nowrap font-display text-[clamp(2.8rem,11vw,10.5rem)] font-bold leading-[.85] tracking-[-0.05em] text-paper/[.07]" aria-hidden="true">
          {site.name}
        </p>
        <div className="mt-10 flex flex-col gap-3 border-t border-paper/10 pt-6 text-[13px] text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {site.name}. All rights reserved.</p>
          <p>Built with creativity, code and attention to detail.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }) {
  return (
    <div>
      <p className="label text-mist">{title}</p>
      <ul className="mt-5 space-y-3 text-[15px]">{children}</ul>
    </div>
  );
}
