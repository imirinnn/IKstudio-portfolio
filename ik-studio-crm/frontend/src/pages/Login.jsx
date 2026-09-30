import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Btn, inputCls } from '../components/ui';
import Icon from '../shared/Icon';

const SITE_URL = (import.meta.env && import.meta.env.VITE_SITE_URL) || '';

export default function Login() {
  const { login, notice, api } = useAuth();
  const demo = api.mode === 'demo' ? api.demoCredentials : null;
  const [email, setEmail] = useState(demo?.email || '');
  const [password, setPassword] = useState(demo?.password || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) { setError('Enter your email and password.'); return; }
    setBusy(true); setError('');
    try { await login(email, password); }
    catch (err) { setError(err.message); setPassword(demo ? password : ''); }
    finally { setBusy(false); }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3 text-paper">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper font-display text-[15px] font-bold text-ink">i<span className="opacity-40">/</span>k</span>
          <div><p className="font-semibold">Studio CRM</p><p className="text-[12.5px] text-mist">Private area for Irin &amp; Kaviya</p></div>
        </div>
        <form onSubmit={submit} noValidate className="rounded-2xl bg-white p-6 shadow-2xl">
          <h1 className="flex items-center gap-2 font-sans text-[18px] font-semibold"><Icon name="lock" size={18} /> Sign in</h1>
          {notice ? <p className="mt-3 rounded-lg bg-paper px-3 py-2 text-[13px] text-ink/80" role="status">{notice}</p> : null}
          {!api.configured ? <p className="mt-3 rounded-lg bg-[#FBF0DC] px-3 py-2 text-[13px] text-[#8A5A00]">The CRM server address isn't set. Add VITE_API_URL to the frontend environment.</p> : null}
          {demo ? <p className="mt-3 rounded-lg bg-[#FBF0DC] px-3 py-2 text-[12.5px] text-[#8A5A00]">Preview build with invented sample data. The demo sign-in is filled in for you.</p> : null}
          <div className="mt-5 space-y-3.5">
            <div>
              <label htmlFor="login-email" className="mb-1 block text-[13px] font-medium">Email</label>
              <input id="login-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} aria-invalid={error ? 'true' : undefined} />
            </div>
            <div>
              <label htmlFor="login-password" className="mb-1 block text-[13px] font-medium">Password</label>
              <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} aria-invalid={error ? 'true' : undefined} aria-describedby={error ? 'login-error' : undefined} />
            </div>
          </div>
          {error ? <p id="login-error" className="mt-3 text-[13px] text-[#9E2A22]" role="alert">{error}</p> : null}
          <Btn type="submit" variant="primary" className="mt-5 h-10 w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Btn>
          <p className="mt-4 text-center text-[12px] text-steel">Private area. Access is limited to authorised studio accounts; there is no public sign-up.</p>
        </form>
        {SITE_URL ? <p className="mt-6 text-center"><a href={SITE_URL} className="text-[13px] text-mist underline-offset-4 hover:text-paper hover:underline">← Back to the website</a></p> : null}
      </div>
    </main>
  );
}
