import Reveal from './Reveal';
import SplitText from './SplitText';
import { cn } from '../utils/cn';

export default function SectionHeading({ id, eyebrow, title, lead, dark = false, align = 'left', className, titleClass }) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow ? (
        <Reveal as="p" variant="fade" className={cn('label mb-5 flex items-center gap-3', align === 'center' && 'justify-center', dark ? 'text-mist' : 'text-steel')}>
          <span className={cn('inline-block h-px w-8', dark ? 'bg-mist/60' : 'bg-steel/60')} aria-hidden="true" />
          {eyebrow}
        </Reveal>
      ) : null}
      <SplitText
        id={id}
        text={title}
        className={cn('text-[clamp(2.1rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em]', dark ? 'text-paper' : 'text-ink', titleClass)}
        emClass={dark ? 'text-mist' : 'text-steel'}
      />
      {lead ? (
        <Reveal as="p" delay={150} className={cn('mt-6 max-w-2xl text-[17px] leading-relaxed md:text-lg', align === 'center' && 'mx-auto', dark ? 'text-mist' : 'text-steel')}>
          {lead}
        </Reveal>
      ) : null}
    </div>
  );
}
