import { useEffect, useRef } from 'react';
import Icon from '../shared/Icon';
import { cn } from '../shared/cn';

/** Native <dialog>: focus trap, Esc to close and inert background for free. */
export default function Modal({ open, onClose, title, children, footer, size = 'md', side = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal?.();
    if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onCancel = (e) => { e.preventDefault(); onClose(); };
    d.addEventListener('cancel', onCancel);
    return () => d.removeEventListener('cancel', onCancel);
  }, [onClose]);
  if (!open) return null;
  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className={cn(
        'max-h-[100dvh] overflow-hidden bg-transparent p-0 text-ink backdrop:bg-ink/50',
        side ? 'm-0 ml-auto h-[100dvh] w-full max-w-[560px]' : cn('m-auto w-[calc(100%-24px)]', size === 'lg' ? 'max-w-3xl' : size === 'sm' ? 'max-w-md' : 'max-w-xl'),
      )}
    >
      <div className={cn('flex max-h-[100dvh] flex-col bg-white shadow-2xl', side ? 'h-full' : 'max-h-[calc(100dvh-24px)] rounded-2xl')}>
        <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-5 py-3.5">
          <h2 className="font-sans text-[15px] font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-ink/60 hover:bg-ink/[.06] hover:text-ink" aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="flex flex-wrap justify-end gap-2 border-t border-ink/10 px-5 py-3">{footer}</div> : null}
      </div>
    </dialog>
  );
}
