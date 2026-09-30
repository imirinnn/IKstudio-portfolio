import { createElement, useLayoutEffect, useRef, useState } from 'react';
import { useInView } from '../hooks/useInView';
import { cn } from '../utils/cn';

/**
 * Scroll-triggered reveal. Content is visible by default; it is only hidden
 * (data-state="pending") if it starts below the fold, so the first screen is
 * never blank and no-JS / crawler views show everything.
 */
export default function Reveal({ as = 'div', variant = 'up', delay = 0, className, children, ...rest }) {
  const ref = useRef(null);
  const [pending, setPending] = useState(false);
  const inView = useInView(ref);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && el.getBoundingClientRect().top > window.innerHeight * 0.92) setPending(true);
  }, []);

  const state = pending && !inView ? 'pending' : 'shown';
  return createElement(
    as,
    { ref, className: cn('reveal', className), 'data-variant': variant, 'data-state': state, style: { '--d': `${delay}ms`, ...(rest.style || {}) }, ...rest },
    children,
  );
}
