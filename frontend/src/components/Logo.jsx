import { site } from '../data/site';
import { cn } from '../utils/cn';

export default function Logo({ className, dark = true }) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center whitespace-nowrap rounded-[10px] font-display text-[14px] font-bold leading-none tracking-tight', dark ? 'bg-paper text-ink' : 'bg-ink text-paper')} aria-hidden="true">
        i<span className="opacity-40">/</span>k
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[15px] font-semibold tracking-tight">{site.name}</span>
        <span className={cn('block font-mono text-[10px] uppercase tracking-label', dark ? 'text-mist' : 'text-steel')}>{site.tagline}</span>
      </span>
    </span>
  );
}
