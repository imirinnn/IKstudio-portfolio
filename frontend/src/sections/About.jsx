import { useCallback, useRef, useState } from 'react';
import Portrait from '../components/Portrait';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import { team } from '../data/team';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { cn } from '../utils/cn';

const chapters = [
  {
    key: 'irin',
    kicker: 'Chapter 01 · Frontend',
    title: 'Irin designs the experience.',
    body: team.irin.summary,
    skills: team.irin.skills,
    tone: 'bg-sky',
  },
  {
    key: 'kaviya',
    kicker: 'Chapter 02 · Backend',
    title: 'Kaviya builds the engine.',
    body: team.kaviya.summary,
    skills: team.kaviya.skills,
    tone: 'bg-rose',
  },
  {
    key: 'both',
    kicker: 'Chapter 03 · Together',
    title: 'Together, we deliver the whole website.',
    body: 'From design and frontend build to backend connectivity, deployment and final handover. One small team, working directly with you, from the first call to the day the site is yours.',
    skills: ['Planning', 'Design & build', 'Backend & data', 'Deployment', 'Handover'],
    tone: 'bg-paper',
  },
];

export default function About() {
  const wide = useMediaQuery('(min-width: 1024px)');
  return (
    <section id="about" className="bg-ink text-paper" aria-labelledby="about-title">
      <div className="container-site pt-24 md:pt-32">
        <SectionHeading
          id="about-title"
          eyebrow="About us"
          title="A frontend and backend duo building *business-ready websites.*"
          lead="We are a small, focused development team. You work directly with the two people who build your site: no account managers, no hand-offs, no guesswork about who does what."
          dark
          className="max-w-4xl"
        />
      </div>
      {wide ? <StickyStory /> : <StackedStory />}
    </section>
  );
}

/* Desktop: pinned stage; scroll moves Irin → Kaviya → both. */
function StickyStory() {
  const track = useRef(null);
  const [step, setStep] = useState(0);
  const bar = useRef(null);
  const onProgress = useCallback((p) => {
    const next = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
    setStep((s) => (s === next ? s : next));
    if (bar.current) bar.current.style.transform = `scaleY(${p})`;
  }, []);
  useScrollProgress(track, onProgress, { mode: 'sticky' });

  return (
    <div ref={track} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="container-site grid grid-cols-[1fr_1.1fr] items-center gap-16">
          <div className="relative min-h-[420px]">
            <div className="absolute -left-8 top-0 h-full w-px bg-paper/10" aria-hidden="true">
              <div ref={bar} className="h-full w-px origin-top bg-paper" style={{ transform: 'scaleY(0)' }} />
            </div>
            {chapters.map((c, i) => (
              <article
                key={c.key}
                aria-hidden={step !== i}
                className={cn(
                  'absolute inset-0 transition-all duration-700 ease-out',
                  step === i ? 'translate-y-0 opacity-100' : step > i ? '-translate-y-8 opacity-0' : 'translate-y-8 opacity-0',
                  step !== i && 'pointer-events-none',
                )}
              >
                <p className="label flex items-center gap-2 text-mist"><span className={cn('h-2 w-2 rounded-full', c.tone)} />{c.kicker}</p>
                <h3 className="mt-5 text-5xl font-semibold leading-[1] tracking-[-0.035em]">{c.title}</h3>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-mist">{c.body}</p>
                <ul className="mt-8 flex max-w-lg flex-wrap gap-2">
                  {c.skills.map((s) => <li key={s} className="chip border-paper/15 text-paper/80">{s}</li>)}
                </ul>
              </article>
            ))}
          </div>

          <div className="relative mx-auto aspect-[5/4] w-full max-w-[600px]" aria-hidden="true">
            <StagePortrait person={team.irin} pos={step === 0 ? 'center' : step === 1 ? 'away-left' : 'left'} />
            <StagePortrait person={team.kaviya} pos={step === 0 ? 'away-right' : step === 1 ? 'center' : 'right'} />
            <div className={cn('label absolute -bottom-12 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full bg-paper px-4 py-2 text-ink transition-all duration-700 ease-out', step === 2 ? 'opacity-100' : 'translate-y-4 opacity-0')}>
              Frontend + Backend = complete website
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const POS = {
  center: 'left-1/2 top-0 w-[62%] -translate-x-1/2 rotate-0 opacity-100 z-20',
  'away-left': 'left-[-6%] top-[8%] w-[44%] -rotate-6 opacity-30 z-10 portrait-muted',
  'away-right': 'left-[62%] top-[8%] w-[44%] rotate-6 opacity-30 z-10 portrait-muted',
  left: 'left-[2%] top-[4%] w-[48%] -rotate-3 opacity-100 z-20',
  right: 'left-[50%] top-[10%] w-[48%] rotate-3 opacity-100 z-20',
};

function StagePortrait({ person, pos }) {
  return (
    <div className={cn('absolute aspect-[3/4] transition-all duration-[1100ms] ease-out', POS[pos])}>
      <Portrait person={person} className="h-full w-full shadow-[0_40px_80px_-30px_rgba(0,0,0,.8)]" muted={pos.startsWith('away')} chip={pos === 'center'} />
    </div>
  );
}

/* Tablet & mobile: the same three chapters as stacked, scroll-revealed blocks. */
function StackedStory() {
  return (
    <div className="container-site space-y-20 pb-24 pt-16 md:pb-32">
      {chapters.map((c, i) => (
        <article key={c.key} className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <Reveal variant="scale" className={cn(i % 2 === 1 && 'md:order-2')}>
            {c.key === 'both' ? (
              <div className="grid grid-cols-2 gap-3">
                <Portrait person={team.irin} className="aspect-[3/4]" chip={false} />
                <Portrait person={team.kaviya} className="mt-10 aspect-[3/4]" chip={false} />
              </div>
            ) : (
              <Portrait person={team[c.key]} className="mx-auto aspect-[3/4] max-w-[420px]" />
            )}
          </Reveal>
          <Reveal delay={120}>
            <p className="label flex items-center gap-2 text-mist"><span className={cn('h-2 w-2 rounded-full', c.tone)} />{c.kicker}</p>
            <h3 className="mt-4 text-[clamp(2rem,6vw,2.8rem)] font-semibold leading-[1.02] tracking-[-0.03em]">{c.title}</h3>
            <p className="mt-5 text-[17px] leading-relaxed text-mist">{c.body}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {c.skills.map((s) => <li key={s} className="chip border-paper/15 text-paper/80">{s}</li>)}
            </ul>
          </Reveal>
        </article>
      ))}
    </div>
  );
}
