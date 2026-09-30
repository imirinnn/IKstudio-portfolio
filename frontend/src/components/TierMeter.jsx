import { cn } from '../utils/cn';

export default function TierMeter({ tier, dark = false, className }) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)} role="img" aria-label={`Service level ${tier} of 3`}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={cn('h-1.5 w-6 rounded-full', n <= tier ? (dark ? 'bg-paper' : 'bg-ink') : dark ? 'bg-paper/20' : 'bg-ink/15')} />
      ))}
    </span>
  );
}
