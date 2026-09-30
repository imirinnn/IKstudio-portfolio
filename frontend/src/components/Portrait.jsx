import { cn } from '../utils/cn';

/** Framed developer portrait with role tag. `muted` renders a monochrome state. */
export default function Portrait({ person, className, imgClass, muted = false, showTag = true, chip = true, size = 'lg', eager = false }) {
  const tone = person.tone === 'sky' ? 'bg-sky' : 'bg-rose';
  return (
    <figure className={cn('relative overflow-hidden rounded-[22px] bg-ink-3', muted && 'portrait-muted', className)}>
      <img
        src={size === 'sm' ? person.photoSm : person.photo}
        alt={person.alt}
        width={size === 'sm' ? 240 : 600}
        height={size === 'sm' ? 320 : 800}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={cn('portrait-img h-full w-full object-cover', imgClass)}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" aria-hidden="true" />
      {showTag ? (
        <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
          <div>
            <p className="font-display text-xl font-semibold leading-none text-paper sm:text-2xl">{person.name}</p>
            <p className="mt-1.5 text-[13px] text-paper/75">{person.role}</p>
          </div>
          {chip ? <span className={cn('label hidden whitespace-nowrap rounded-full px-2.5 py-1 text-ink sm:inline-block', tone)}>{person.tag}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
