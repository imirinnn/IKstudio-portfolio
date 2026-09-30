import { useEffect } from 'react';
import Button from '../components/Button';
import Logo from '../components/Logo';

export default function NotFound() {
  useEffect(() => { document.title = 'Page not found | Irin & Kaviya'; }, []);
  return (
    <main className="flex min-h-screen flex-col bg-ink px-5 py-8 text-paper sm:px-8">
      <a href="/" aria-label="Irin & Kaviya home"><Logo /></a>
      <div className="m-auto max-w-xl py-20 text-center">
        <p className="label text-mist">Error 404</p>
        <h1 className="mt-5 text-[clamp(2.4rem,7vw,4.5rem)] font-semibold leading-none tracking-[-0.04em]">This page doesn't exist.</h1>
        <p className="mt-5 text-lg text-mist">The link may be old or mistyped. Everything we do is on the home page.</p>
        <Button href="/" variant="light" size="lg" className="mt-10">Back to home</Button>
      </div>
    </main>
  );
}
