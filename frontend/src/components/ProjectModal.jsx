import { useEffect, useRef } from 'react';
import Icon from './Icon';
import Button from './Button';
import TierMeter from './TierMeter';
import ProjectPreview from './ProjectPreview';

/** Project detail dialog. Uses the native <dialog> for focus trapping and Esc handling. */
export default function ProjectModal({ project, onClose, onEnquire }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (!d.open) d.showModal?.();
    document.documentElement.style.overflow = 'hidden';
    const close = () => onClose();
    d.addEventListener('close', close);
    return () => { d.removeEventListener('close', close); document.documentElement.style.overflow = ''; };
  }, [onClose]);

  const onBackdrop = (e) => { if (e.target === ref.current) ref.current.close(); };

  return (
    <dialog
      ref={ref}
      onClick={onBackdrop}
      aria-labelledby="project-title"
      className="modal m-auto w-[min(960px,calc(100%-24px))] max-h-[calc(100dvh-24px)] overflow-y-auto rounded-[26px] bg-paper p-0 text-ink backdrop:bg-ink/70 backdrop:backdrop-blur-sm"
    >
      <div className="relative p-5 sm:p-8 md:p-10">
        <button
          type="button"
          onClick={() => ref.current.close()}
          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-ink text-paper transition-transform hover:rotate-90"
          aria-label="Close project details"
        >
          <Icon name="close" />
        </button>
        <p className="label flex items-center gap-3 text-steel"><TierMeter tier={project.tier} /> {project.tierName} package</p>
        <h3 id="project-title" className="mt-4 pr-14 text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-none tracking-[-0.03em]">{project.title}</h3>
        <p className="mt-2 text-steel">{project.category} · <span className="font-medium text-ink">{project.price}</span></p>
        <ProjectPreview slug={project.slug} alt={`Preview of the ${project.title} demo website`} className="mt-7" />
        <div className="mt-8 grid gap-8 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-[17px] leading-relaxed text-ink/80">{project.description}</p>
            <p className="mt-4 text-sm text-steel">{project.note}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {project.tech.map((t) => <span key={t} className="chip border-ink/15 font-mono text-[12px]">{t}</span>)}
            </div>
          </div>
          <div>
            <p className="label text-steel">Included features</p>
            <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {project.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[15px]"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-steel" />{f}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-9 flex flex-wrap gap-3 border-t border-ink/10 pt-7">
          <Button as="button" type="button" onClick={() => { ref.current.close(); onEnquire(project); }}>Start a project like this</Button>
          {project.liveUrl ? <Button href={project.liveUrl} target="_blank" rel="noopener noreferrer" variant="outlineDark" icon="arrowUpRight">View project</Button> : null}
          {project.githubUrl ? <Button href={project.githubUrl} target="_blank" rel="noopener noreferrer" variant="outlineDark" icon="github">GitHub</Button> : null}
        </div>
      </div>
    </dialog>
  );
}
