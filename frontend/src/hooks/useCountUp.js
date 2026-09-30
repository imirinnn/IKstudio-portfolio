import { useEffect, useState } from 'react';
import { prefersReducedMotion } from './useReducedMotion';

export function useCountUp(target, start, duration = 1600) {
  const [value, setValue] = useState(target); // renders the real number before JS animation / for crawlers
  useEffect(() => {
    if (!start || prefersReducedMotion()) { setValue(target); return; }
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    setValue(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration]);
  return value;
}
