import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCrm } from '../context/CrmContext';
import { useToast } from '../components/Toasts';
import { Btn, Card, CardHeader, PageHeader, inputCls } from '../components/ui';
import Confirm from '../components/Confirm';
import { tokenStore } from '../api/http';
import { exportEntity } from '../lib/exporters';
import { entities } from '../config/entities';

export default function Settings() {
  const { admin, api, logout } = useAuth();
  const { data, byId } = useCrm();
  const toast = useToast();
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [confirmNext, setConfirmNext] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [signOutAll, setSignOutAll] = useState(false);

  const change = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!cur) errs.currentPassword = 'Enter your current password.';
    if (next.length < 10 || !/[a-zA-Z]/.test(next) || !/\d/.test(next)) errs.newPassword = 'Use at least 10 characters with letters and numbers.';
    if (next !== confirmNext) errs.confirm = 'The new passwords don’t match.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const r = await api.changePassword(cur, next);
      tokenStore.set(r.token);
      setCur(''); setNext(''); setConfirmNext('');
      toast('Password changed. Other devices were signed out.');
    } catch (err) { setErrors(err.fields || { form: err.message }); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Your account" />
          <dl className="grid gap-3 p-4 text-[13.5px] sm:grid-cols-2">
            <div><dt className="text-[12px] text-steel">Name</dt><dd>{admin.name}</dd></div>
            <div><dt className="text-[12px] text-steel">Role</dt><dd>{admin.role}</dd></div>
            <div className="sm:col-span-2"><dt className="text-[12px] text-steel">Email</dt><dd>{admin.email}</dd></div>
          </dl>
          <div className="border-t border-ink/[.07] p-4">
            <p className="text-[13px] text-steel">Only emails listed in the server’s <code className="rounded bg-paper px-1">ADMIN_EMAILS</code> can sign in. Accounts are created with <code className="rounded bg-paper px-1">npm run create-admin</code>; there is no public sign-up.</p>
            <Btn className="mt-3" onClick={() => setSignOutAll(true)} disabled={api.mode === 'demo'}>Sign out on all devices</Btn>
          </div>
        </Card>

        <Card>
          <CardHeader title="Change password" />
          <form onSubmit={change} noValidate className="space-y-3 p-4">
            {errors.form ? <p className="rounded-lg bg-[#FBE6E4] px-3 py-2 text-[13px] text-[#9E2A22]" role="alert">{errors.form}</p> : null}
            {[
              ['set-cur', 'Current password', cur, setCur, 'currentPassword', 'current-password'],
              ['set-new', 'New password', next, setNext, 'newPassword', 'new-password'],
              ['set-conf', 'Confirm new password', confirmNext, setConfirmNext, 'confirm', 'new-password'],
            ].map(([id, label, val, set, key, ac]) => (
              <div key={id}>
                <label htmlFor={id} className="mb-1 block text-[12.5px] font-medium">{label}</label>
                <input id={id} type="password" autoComplete={ac} value={val} onChange={(e) => set(e.target.value)} className={inputCls} aria-invalid={errors[key] ? 'true' : undefined} />
                {errors[key] ? <p className="mt-1 text-[12px] text-[#9E2A22]">{errors[key]}</p> : null}
              </div>
            ))}
            <Btn type="submit" variant="primary" disabled={busy || api.mode === 'demo'}>{busy ? 'Saving…' : 'Change password'}</Btn>
          </form>
        </Card>
      </div>

      <Card>
        <CardHeader title="Export data" sub="Download CSV backups. Files open in Excel or Google Sheets." />
        <div className="flex flex-wrap gap-2 p-4">
          {Object.keys(entities).map((e) => <Btn key={e} icon="download" onClick={() => exportEntity(e, data[e], byId)}>{entities[e].label} ({data[e].length})</Btn>)}
        </div>
      </Card>

      <Confirm open={signOutAll} danger={false} confirmLabel="Sign out everywhere" title="Sign out on all devices?" body="Every session, including this one, will be signed out." onClose={() => setSignOutAll(false)}
        onConfirm={async () => { try { await api.logoutAll(); } finally { logout('You were signed out on all devices.'); } }} />
    </div>
  );
}
