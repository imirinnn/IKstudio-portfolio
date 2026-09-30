import { createElement, Fragment, useLayoutEffect, useRef, useState } from 'react';
import { useInView } from '../hooks/useInView';
import { cn } from '../utils/cn';

/**
 * Masked word-by-word reveal. `text` may contain *emphasised* words that get `emClass`.
 * Screen readers get the plain sentence through aria-label.
 */
export default function SplitText({ as = 'h2', id, text, className, emClass = '', baseDelay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [state, setState] = useState('idle');

  useLayoutEffect(() => { setState('pending'); }, []);
  useLayoutEffect(() => { if (inView) setState('play'); }, [inView]);

  const plain = text.replace(/\*/g, '');
  const words = text.split(' ');
  let em = false;
  return createElement(
    as,
    { ref, id, className: cn('split', className), 'data-state': state, 'aria-label': plain, style: { '--base': `${baseDelay}ms` } },
    words.map((raw, i) => {
      const starts = raw.startsWith('*');
      if (starts) em = true;
      const isEm = em;
      if (raw.endsWith('*') || raw.endsWith('*.') || raw.endsWith('*,')) em = false;
      const word = raw.replace(/\*/g, '');
      return (
        <Fragment key={i}>
          <span className="split-word" aria-hidden="true">
            <span style={{ '--i': i }} className={isEm ? emClass : undefined}>{word}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      );
    }),
  );
}
