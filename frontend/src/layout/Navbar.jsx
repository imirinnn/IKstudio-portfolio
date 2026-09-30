import { useEffect, useRef, useState } from 'react';
import Logo from '../components/Logo';
import Icon from '../components/Icon';
import { nav } from '../data/site';
import { useActiveSection } from '../hooks/useActiveSection';
import { scrollToId } from '../utils/scroll';
import { useEnquiry } from '../context/EnquiryContext';
import { cn } from '../utils/cn';

const ids = nav.map((n) => n.id);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(ids);
  const { startProject } = useEnquiry();
  const lastY = useRef(0);
  const menuBtn = useRef(null);
  const panel = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 480 && y > lastY.current + 4);
      if (y < lastY.current - 4 || y < 480) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobile menu: lock scroll, close on Esc, keep focus inside.
  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = 'hidden';
    const first = panel.current?.querySelector('a,button');
    first?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); menuBtn.current?.focus(); }
      if (e.key === 'Tab' && panel.current) {
        const f = [...panel.current.querySelectorAll('a,button')];
        const [a, b] = [f[0], f[f.length - 1]];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
        else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.documentElement.style.overflow = ''; document.removeEventListener('keydown', onKey); };
  }, [open]);

  const go = (e, id) => { e.preventDefault(); setOpen(false); scrollToId(id); };

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-paper focus:px-4 focus:py-2 focus:text-ink">Skip to content</a>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 text-paper transition-[transform,background-color,border-color] duration-500 ease-out',
          'pt-[env(safe-area-inset-top,0px)]',
          scrolled ? 'border-b border-paper/10 bg-ink/85 backdrop-blur-md' : 'border-b border-transparent',
          hidden && !open ? '-translate-y-full' : 'translate-y-0',
        )}
      >
        <nav className="container-site flex h-[72px] items-center justify-between gap-6" aria-label="Primary">
          <a href="#top" onClick={(e) => go(e, 'top')} aria-label="Irin & Kaviya, back to top"><Logo /></a>
          <ul className="hidden items-center gap-1 lg:flex">
            {nav.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  onClick={(e) => go(e, n.id)}
                  aria-current={active === n.id ? 'true' : undefined}
                  className={cn('relative rounded-full px-4 py-2 text-[14px] transition-colors', active === n.id ? 'text-paper' : 'text-paper/60 hover:text-paper')}
                >
                  {n.label}
                  <span className={cn('absolute inset-x-4 -bottom-0.5 h-px origin-left bg-paper transition-transform duration-500 ease-out', active === n.id ? 'scale-x-100' : 'scale-x-0')} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => startProject()} className="btn-fill hidden h-10 items-center rounded-full bg-paper px-5 text-[14px] font-medium text-ink [--fill:#A9B8FF] sm:inline-flex">
              Start a project
            </button>
            <button
              ref={menuBtn}
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full border border-paper/20 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <Icon name={open ? 'close' : 'menu'} size={20} />
            </button>
          </div>
        </nav>
      </header>

      <div
        id="mobile-menu"
        ref={panel}
        className={cn(
          'fixed inset-0 z-40 flex flex-col bg-ink px-5 pb-10 pt-[calc(96px+env(safe-area-inset-top,0px))] text-paper transition-[clip-path,visibility] duration-700 ease-out sm:px-8 lg:hidden',
          open ? 'visible [clip-path:inset(0_0_0_0)]' : 'invisible [clip-path:inset(0_0_100%_0)]',
        )}
        aria-hidden={!open}
      >
        <ul className="flex flex-col">
          {nav.map((n, i) => (
            <li key={n.id} className="border-b border-paper/10">
              <a
                href={`#${n.id}`}
                tabIndex={open ? 0 : -1}
                onClick={(e) => go(e, n.id)}
                className="flex items-baseline justify-between py-4 font-display text-[clamp(2rem,9vw,3rem)] font-semibold tracking-tight"
              >
                {n.label}<span className="font-mono text-xs text-mist">0{i + 1}</span>
              </a>
            </li>
          ))}
        </ul>
        <button type="button" tabIndex={open ? 0 : -1} onClick={() => { setOpen(false); startProject(); }} className="mt-auto h-14 rounded-full bg-paper font-medium text-ink">
          Start a project
        </button>
      </div>
    </>
  );
}
