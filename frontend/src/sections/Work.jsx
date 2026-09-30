import { lazy, Suspense, useCallback, useRef, useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import Button from '../components/Button';
import ProjectPreview from '../components/ProjectPreview';
import TierMeter from '../components/TierMeter';
import { projects } from '../data/projects';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useEnquiry } from '../context/EnquiryContext';
import { cn } from '../utils/cn';

// The dialog code is only needed after a click, so it is split into its own chunk.
const ProjectModal = lazy(() => import('../components/ProjectModal'));

const packageId = { 1: 'basic', 2: 'full-stack', 3: 'premium' };

export default function Work() {
  const [open, setOpen] = useState(null);
  const { startProject } = useEnquiry();
  const close = useCallback(() => setOpen(null), []);

  return (
    <section id="work" className="section-pad bg-paper-2" aria-labelledby="work-title">
      <div className="container-site">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            id="work-title"
            eyebrow="Our work"
            title="Three demo builds. *Three service levels.*"
            lead="Each project shows what one of our packages delivers, from a clean business website to a premium custom build."
          />
          <Reveal className="flex gap-6 lg:pb-2" delay={200}>
            {projects.map((p) => (
              <div key={p.slug} className="text-sm">
                <TierMeter tier={p.tier} />
                <p className="mt-2 font-medium">{p.tierName}</p>
                <p className="text-steel">{p.price.replace(/,000/g, 'K').replace(/ – /, '–')}</p>
              </div>
            ))}
          </Reveal>
        </div>

        <div className="mt-16 space-y-8 md:mt-20 md:space-y-10">
          {projects.map((p, i) => (
            <ProjectRow key={p.slug} project={p} index={i} onOpen={() => setOpen(p)} />
          ))}
        </div>
      </div>

      {open ? (
        <Suspense fallback={null}>
          <ProjectModal project={open} onClose={close} onEnquire={(p) => startProject(packageId[p.tier], p.title)} />
        </Suspense>
      ) : null}
    </section>
  );
}

function ProjectRow({ project: p, index, onOpen }) {
  const premium = p.tier === 3;
  const flip = index === 1;
  const media = useRef(null);
  const inner = useRef(null);
  const reduced = useReducedMotion();
  const onProgress = useCallback((v) => {
    if (inner.current) inner.current.style.transform = `translate3d(0, ${(0.5 - v) * 40}px, 0)`;
  }, []);
  useScrollProgress(media, onProgress, { enabled: !reduced });

  return (
    <Reveal
      as="article"
      variant="up"
      className={cn(
        'group relative overflow-hidden rounded-[28px] p-5 sm:p-8 lg:p-12',
        premium ? 'bg-ink text-paper' : 'bg-paper ring-1 ring-ink/[.06]',
      )}
      aria-labelledby={`${p.slug}-title`}
    >
      {premium ? <div className="grid-lines pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(90deg,transparent,#000)]" aria-hidden="true" /> : null}
      <div className={cn('relative grid items-center gap-8 lg:gap-14', premium ? 'lg:grid-cols-[1.35fr_1fr]' : 'lg:grid-cols-[1.2fr_1fr]')}>
        <div ref={media} className={cn('relative', flip && 'lg:order-2')}>
          <div ref={inner} className="will-change-transform">
            <button type="button" onClick={onOpen} className="block w-full rounded-[18px] text-left" aria-label={`Open details for ${p.title}`}>
              <ProjectPreview slug={p.slug} alt={`Preview of the ${p.title} demo website`} className={premium ? 'ring-paper/10' : ''} />
            </button>
          </div>
        </div>

        <div className={cn(flip && 'lg:order-1')}>
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn('label rounded-full px-3 py-1', premium ? 'bg-paper text-ink' : 'bg-ink text-paper')}>{p.tierName} package</span>
            <TierMeter tier={p.tier} dark={premium} />
          </div>
          <p className={cn('mt-6 font-mono text-xs', premium ? 'text-mist' : 'text-steel')}>Project 0{index + 1} · {p.category}</p>
          <h3 id={`${p.slug}-title`} className="mt-2 text-[clamp(2rem,4.4vw,3.4rem)] font-semibold leading-[1] tracking-[-0.035em]">{p.title}</h3>
          <p className={cn('mt-5 text-[16px] leading-relaxed', premium ? 'text-mist' : 'text-steel')}>{p.description}</p>

          <p className={cn('label mt-6', premium ? 'text-mist' : 'text-steel')}>Key features</p>
          <p className={cn('mt-2 text-[15px] leading-relaxed', premium ? 'text-paper/85' : 'text-ink/80')}>{p.features.slice(0, 6).join(' · ')}{p.features.length > 6 ? ` + ${p.features.length - 6} more` : ''}</p>
          <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies">
            {p.tech.map((t) => (
              <li key={t} className={cn('chip font-mono text-[12px]', premium ? 'border-paper/15 text-paper/80' : 'border-ink/15')}>{t}</li>
            ))}
          </ul>

          <div className={cn('mt-8 flex flex-col gap-1 border-t pt-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4', premium ? 'border-paper/15' : 'border-ink/10')}>
            <span className={cn('label', premium ? 'text-mist' : 'text-steel')}>Package price</span>
            <span className="font-display text-2xl font-semibold tracking-tight tabular-nums sm:text-[28px]">{p.price}</span>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {p.liveUrl ? (
              <Button href={p.liveUrl} target="_blank" rel="noopener noreferrer" variant={premium ? 'light' : 'dark'} icon="arrowUpRight" aria-label={`View ${p.title} live demo (opens in a new tab)`}>View project</Button>
            ) : null}
            <Button as="button" type="button" onClick={onOpen} variant={premium ? 'outlineLight' : 'outlineDark'} icon="plus">Features &amp; details</Button>
            {p.githubUrl ? (
              <Button href={p.githubUrl} target="_blank" rel="noopener noreferrer" variant={premium ? 'outlineLight' : 'outlineDark'} icon="github" aria-label={`${p.title} source code on GitHub (opens in a new tab)`}>GitHub</Button>
            ) : null}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
