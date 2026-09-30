import { useCallback, useEffect, useRef, useState } from 'react';
import Portrait from './Portrait';
import Icon from './Icon';
import { team } from '../data/team';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { cn } from '../utils/cn';

const FACES = [
  { key: 'irin', label: 'Irin, Frontend Developer' },
  { key: 'front', label: 'What Irin builds: the frontend' },
  { key: 'kaviya', label: 'Kaviya, Backend Developer' },
  { key: 'back', label: 'What Kaviya builds: the backend' },
];
const AUTO_DEG_PER_SEC = 9;

/**
 * 360° team presentation: a four-sided prism that slowly turns on its own,
 * can be dragged (mouse / touch), and stepped with buttons or arrow keys.
 * All per-frame work writes transforms directly; React only re-renders when
 * the front face changes.
 */
export default function TeamPrism({ className }) {
  const reduced = useReducedMotion();
  const scene = useRef(null);
  const prism = useRef(null);
  const st = useRef({ angle: 0, target: null, vel: 0, dragging: false, lastX: 0, idleUntil: 0, hover: false, visible: true, tiltX: 0, tiltY: 0, scroll: 0 });
  const [front, setFront] = useState(0);

  const faceFromAngle = (a) => ((Math.round(-a / 90) % 4) + 4) % 4;

  // Keep translateZ equal to half the face width.
  useEffect(() => {
    const el = scene.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => el.style.setProperty('--half', `${e.contentRect.width / 2}px`));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Pause work while off-screen.
  useEffect(() => {
    const el = scene.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => { st.current.visible = e.isIntersecting; });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Animation loop.
  useEffect(() => {
    let raf; let prev = performance.now(); let lastFace = -1;
    const loop = (now) => {
      const s = st.current;
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      if (s.visible && !document.hidden) {
        if (s.target !== null) {
          const diff = s.target - s.angle;
          s.angle += reduced ? diff : diff * Math.min(1, dt * 7);
          if (Math.abs(diff) < 0.05) { s.angle = s.target; s.target = null; }
        } else if (!s.dragging) {
          if (Math.abs(s.vel) > 0.5 && !reduced) { s.angle += s.vel * dt; s.vel *= Math.pow(0.04, dt); }
          else if (!reduced && !s.hover && now > s.idleUntil) s.angle -= AUTO_DEG_PER_SEC * dt;
        }
        if (prism.current) {
          prism.current.style.transform =
            `translate3d(0, ${s.scroll * 60}px, calc(var(--half) * -1)) rotateX(${s.tiltX}deg) rotateY(${s.angle + s.tiltY}deg)`;
        }
        const f = faceFromAngle(s.angle);
        if (f !== lastFace) { lastFace = f; setFront(f); }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // Pointer tilt + scroll drift (desktop only, not for reduced motion).
  useEffect(() => {
    if (reduced) return;
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      const s = st.current;
      s.tiltX = ((e.clientY / window.innerHeight) - 0.5) * -8;
      s.tiltY = ((e.clientX / window.innerWidth) - 0.5) * 10;
    };
    const onScroll = () => { st.current.scroll = Math.min(1, window.scrollY / window.innerHeight); };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('scroll', onScroll); };
  }, [reduced]);

  const goTo = useCallback((face) => {
    const s = st.current;
    // choose the nearest equivalent angle for that face
    const base = -face * 90;
    const k = Math.round((s.angle - base) / 360);
    s.target = base + k * 360;
    s.vel = 0;
    s.idleUntil = performance.now() + 6000;
  }, []);
  const step = (dir) => goTo((faceFromAngle(st.current.angle) + dir + 4) % 4);

  const onPointerDown = (e) => {
    const s = st.current;
    s.dragging = true; s.lastX = e.clientX; s.vel = 0; s.target = null;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    const s = st.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    s.lastX = e.clientX;
    s.angle += dx * 0.4;
    s.vel = dx * 0.4 * 60;
  };
  const onPointerUp = () => {
    const s = st.current;
    if (!s.dragging) return;
    s.dragging = false;
    s.idleUntil = performance.now() + 2500;
    if (reduced) goTo(faceFromAngle(s.angle));
  };

  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  };

  return (
    <div className={cn('relative select-none', className)}>
      <div
        ref={scene}
        role="group"
        aria-roledescription="carousel"
        aria-label="Meet the team. Drag, or use the arrow keys, to turn."
        tabIndex={0}
        onKeyDown={onKey}
        onPointerEnter={(e) => { if (e.pointerType === 'mouse') st.current.hover = true; }}
        onPointerLeave={() => { st.current.hover = false; onPointerUp(); }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="prism-scene relative mx-auto aspect-[3/4] w-[min(72vw,300px)] cursor-grab touch-pan-y rounded-[22px] active:cursor-grabbing sm:w-[320px] xl:w-[360px]"
      >
        <div ref={prism} className="prism absolute inset-0" style={{ transform: 'translate3d(0,0,calc(var(--half) * -1))' }}>
          {FACES.map((f, i) => (
            <div key={f.key} className="prism-face" style={{ transform: `rotateY(${i * 90}deg) translateZ(var(--half))` }} aria-hidden={front !== i}>
              {f.key === 'irin' && <Portrait person={team.irin} eager className="h-full w-full ring-1 ring-paper/10" />}
              {f.key === 'kaviya' && <Portrait person={team.kaviya} eager className="h-full w-full ring-1 ring-paper/10" />}
              {f.key === 'front' && <FrontFace />}
              {f.key === 'back' && <BackFace />}
            </div>
          ))}
        </div>
      </div>

      {/* floor shadow */}
      <div className="mx-auto mt-6 h-6 w-[60%] rounded-[50%] bg-black/60 blur-xl" aria-hidden="true" />

      <div className="mt-2 flex items-center justify-center gap-3">
        <button type="button" onClick={() => step(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-paper/15 text-paper/80 transition hover:border-paper/50 hover:text-paper" aria-label="Turn to previous side">
          <Icon name="chevronLeft" />
        </button>
        <div className="flex gap-1.5" role="tablist" aria-label="Choose a side">
          {FACES.map((f, i) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={front === i}
              aria-label={f.label}
              onClick={() => goTo(i)}
              className={cn('h-2 rounded-full transition-all duration-500', front === i ? 'w-7 bg-paper' : 'w-2 bg-paper/30 hover:bg-paper/60')}
            />
          ))}
        </div>
        <button type="button" onClick={() => step(1)} className="grid h-10 w-10 place-items-center rounded-full border border-paper/15 text-paper/80 transition hover:border-paper/50 hover:text-paper" aria-label="Turn to next side">
          <Icon name="chevronRight" />
        </button>
      </div>
      <p className="label mt-3 flex items-center justify-center gap-2 text-mist/70"><Icon name="rotate" size={13} /> Drag to turn · 360°</p>
      <p className="sr-only" aria-live="polite">{FACES[front].label}</p>
    </div>
  );
}

function FrontFace() {
  return (
    <div className="flex h-full w-full flex-col justify-between overflow-hidden rounded-[22px] bg-[#E9ECFF] p-5 text-ink ring-1 ring-black/5 sm:p-6">
      <div>
        <p className="label text-ink/60">Irin · Frontend</p>
        <p className="mt-3 font-display text-[26px] font-semibold leading-[1.02] tracking-tight sm:text-3xl">What your customers see and touch.</p>
      </div>
      <pre className="overflow-hidden rounded-xl bg-ink p-4 font-mono text-[11px] leading-[1.7] text-paper/80" aria-hidden="true">
<span className="text-sky">{'<Hero'}</span>{'\n  '}title=<span className="text-rose">"Your business"</span>{'\n  '}cta=<span className="text-rose">"Book now"</span>{'\n'}<span className="text-sky">{'/>'}</span>{'\n'}<span className="text-paper/40">{'// responsive · animated · fast'}</span>
      </pre>
      <ul className="flex flex-wrap gap-1.5">
        {['React', 'Tailwind', 'Vite', 'Motion'].map((t) => <li key={t} className="chip border-ink/15 font-mono text-[11px]">{t}</li>)}
      </ul>
    </div>
  );
}

function BackFace() {
  return (
    <div className="flex h-full w-full flex-col justify-between overflow-hidden rounded-[22px] bg-[#F7E3E1] p-5 text-ink ring-1 ring-black/5 sm:p-6">
      <div>
        <p className="label text-ink/60">Kaviya · Backend</p>
        <p className="mt-3 font-display text-[26px] font-semibold leading-[1.02] tracking-tight sm:text-3xl">What keeps it all working behind the page.</p>
      </div>
      <div className="space-y-1.5 rounded-xl bg-ink p-4 font-mono text-[11px] text-paper/80" aria-hidden="true">
        {[['POST', '/api/enquiries', '201'], ['POST', '/api/auth/login', '200'], ['GET', '/api/admin/members', '200']].map(([m, p, c]) => (
          <p key={p} className="flex items-center gap-2"><span className="w-9 text-rose">{m}</span><span className="flex-1 truncate">{p}</span><span className="text-sky">{c}</span></p>
        ))}
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {['Node.js', 'Express', 'MongoDB', 'Auth'].map((t) => <li key={t} className="chip border-ink/15 font-mono text-[11px]">{t}</li>)}
      </ul>
    </div>
  );
}
