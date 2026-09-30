import { useEffect, useState } from 'react';
import { readSession, writeSession } from '../utils/storage';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

const KEY = 'ik:intro-seen';

/** Short page-load curtain, once per session. Skipped for reduced motion. */
export default function Intro() {
  const [show, setShow] = useState(() => !readSession(KEY) && !prefersReducedMotion());
  useEffect(() => {
    if (!show) return;
    writeSession(KEY, '1');
    const t = setTimeout(() => setShow(false), 1900);
    return () => clearTimeout(t);
  }, [show]);
  if (!show) return null;
  return (
    <div className="intro fixed inset-0 z-[100] grid place-items-center bg-ink text-paper" aria-hidden="true">
      <div className="intro-mark w-56 text-center">
        <p className="font-display text-5xl font-bold tracking-tight">i<span className="text-mist/50">/</span>k</p>
        <div className="mt-6 h-px w-full bg-paper/15">
          <div className="intro-bar h-px w-full bg-paper" />
        </div>
        <p className="label mt-4 flex justify-between text-mist"><span>Frontend</span><span>+</span><span>Backend</span></p>
      </div>
    </div>
  );
}
