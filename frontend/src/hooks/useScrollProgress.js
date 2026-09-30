import { useEffect } from 'react';

/**
 * Calls onProgress(p) on every animation frame while scrolling, where p goes
 * from 0 (element top at viewport bottom / top, depending on mode) to 1.
 * mode 'through': 0 when the element enters, 1 when it leaves.
 * mode 'sticky':  0 when its top hits the viewport top, 1 when its bottom hits the viewport bottom.
 * Writes happen outside React to avoid re-rendering on scroll.
 */
export function useScrollProgress(ref, onProgress, { mode = 'through', enabled = true } = {}) {
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      let p;
      if (mode === 'sticky') {
        const total = r.height - vh;
        p = total > 0 ? -r.top / total : 0;
      } else {
        p = (vh - r.top) / (vh + r.height);
      }
      onProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref, onProgress, mode, enabled]);
}
