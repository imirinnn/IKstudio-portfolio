import { useState } from 'react';
import Icon from './Icon';

export default function CopyButton({ value, label, className = '' }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {
      /* clipboard refused: the value is visible and selectable next to the button */
    }
  };
  return (
    <button type="button" onClick={copy} className={`inline-flex h-9 items-center gap-1.5 rounded-full border border-ink/20 px-3 text-[13px] opacity-80 transition hover:opacity-100 ${className}`} aria-label={`Copy ${label}`}>
      <Icon name={done ? 'check' : 'copy'} size={14} />
      <span aria-live="polite">{done ? 'Copied' : 'Copy'}</span>
    </button>
  );
}
