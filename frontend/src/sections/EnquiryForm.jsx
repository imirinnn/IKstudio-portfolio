import { useEffect, useRef, useState } from 'react';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { useEnquiry } from '../context/EnquiryContext';
import { site } from '../data/site';
import { BUDGETS, PACKAGE_OPTIONS, WEBSITE_TYPES, validateEnquiry } from '../utils/validation';
import { enquiryText, hasApi, submitEnquiry } from '../utils/api';
import { cn } from '../utils/cn';

const empty = { name: '', email: '', phone: '', company: '', websiteType: '', package: '', budget: '', description: '', additional: '', website: '' };

export default function EnquiryForm() {
  const { preset } = useEnquiry();
  const [v, setV] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | prepared | error
  const [serverError, setServerError] = useState('');
  const formRef = useRef(null);
  const doneRef = useRef(null);

  // Pre-select a package when a pricing card or project asks for it.
  useEffect(() => {
    if (!preset.stamp) return;
    setV((cur) => ({
      ...cur,
      package: preset.package || cur.package,
      description: preset.note && !cur.description ? `I'd like a website similar to ${preset.note}. ` : cur.description,
    }));
    if (status !== 'idle') setStatus('idle');
  }, [preset.stamp]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (status === 'sent' || status === 'prepared') doneRef.current?.focus(); }, [status]);

  const set = (k) => (e) => {
    setV((cur) => ({ ...cur, [k]: e.target.value }));
    if (errors[k]) setErrors((cur) => ({ ...cur, [k]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (v.website) return; // honeypot: bots fill hidden fields
    const errs = validateEnquiry(v);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = formRef.current?.querySelector(`[name="${Object.keys(errs)[0]}"]`);
      first?.focus();
      return;
    }
    if (!hasApi) { setStatus('prepared'); return; }
    setStatus('sending');
    setServerError('');
    try {
      const { website, ...payload } = v;
      await submitEnquiry(payload);
      setStatus('sent');
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      setServerError(err.message);
      setStatus('error');
    }
  };

  if (status === 'sent' || status === 'prepared') {
    const pkgLabel = PACKAGE_OPTIONS.find((p) => p.value === v.package)?.label;
    const text = enquiryText(v, { package: pkgLabel });
    const mail = `mailto:${site.email}?subject=${encodeURIComponent(`Project enquiry: ${v.company || v.name}`)}&body=${encodeURIComponent(text)}`;
    const wa = `https://wa.me/${site.phones[0].whatsapp}?text=${encodeURIComponent(text)}`;
    return (
      <div ref={doneRef} tabIndex={-1} className="rounded-[26px] bg-ink p-7 text-paper sm:p-10" role="status">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-paper text-ink"><Icon name="check" size={26} strokeWidth={2.2} /></span>
        {status === 'sent' ? (
          <>
            <h3 className="mt-8 text-3xl font-semibold tracking-tight">Thank you, {v.name.split(' ')[0]}.</h3>
            <p className="mt-3 max-w-md leading-relaxed text-mist">
              Your enquiry has reached us. We'll read it carefully and get back to you at <span className="text-paper">{v.email}</span> or by phone to discuss the next step.
            </p>
          </>
        ) : (
          <>
            <h3 className="mt-8 text-3xl font-semibold tracking-tight">Your enquiry is ready, {v.name.split(' ')[0]}.</h3>
            <p className="mt-3 max-w-md leading-relaxed text-mist">
              Send it to us by email or WhatsApp and we'll get back to you to discuss the next step. Everything you entered is already filled in.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={mail} variant="light" icon="mail">Send by email</Button>
              <Button href={wa} target="_blank" rel="noopener noreferrer" variant="outlineLight" icon="whatsapp">Send on WhatsApp</Button>
            </div>
            <p className="mt-4 text-[13px] text-mist">If the buttons don't open an app on this device, email {site.email}.</p>
          </>
        )}
        <button type="button" onClick={() => { setV(empty); setStatus('idle'); }} className="mt-8 text-[14px] text-mist underline underline-offset-4 hover:text-paper">
          Start a new enquiry
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="rounded-[26px] bg-paper p-6 ring-1 ring-ink/[.08] sm:p-9" aria-labelledby="form-title">
      <h3 id="form-title" className="text-2xl font-semibold tracking-tight">Project enquiry</h3>
      <p className="mt-1 text-[14px] text-steel">Fields marked * are required.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" required value={v.name} onChange={set('name')} error={errors.name} autoComplete="name" />
        <Field label="Email" name="email" type="email" required value={v.email} onChange={set('email')} error={errors.email} autoComplete="email" />
        <Field label="Phone" name="phone" type="tel" required value={v.phone} onChange={set('phone')} error={errors.phone} autoComplete="tel" inputMode="tel" />
        <Field label="Business / company name" name="company" value={v.company} onChange={set('company')} error={errors.company} autoComplete="organization" />
        <Select label="Website type" name="websiteType" required value={v.websiteType} onChange={set('websiteType')} error={errors.websiteType} options={WEBSITE_TYPES.map((t) => ({ value: t, label: t }))} />
        <Select label="Selected package" name="package" required value={v.package} onChange={set('package')} error={errors.package} options={PACKAGE_OPTIONS} />
        <Select className="sm:col-span-2" label="Budget" name="budget" value={v.budget} onChange={set('budget')} error={errors.budget} options={BUDGETS.map((b) => ({ value: b, label: b }))} />
        <Field className="sm:col-span-2" label="Project description" name="description" required textarea rows={5} value={v.description} onChange={set('description')} error={errors.description} placeholder="What does your business do, and what should the website help with?" />
        <Field className="sm:col-span-2" label="Additional requirements" name="additional" textarea rows={3} value={v.additional} onChange={set('additional')} error={errors.additional} placeholder="Pages, features, reference websites, timeline…" />
      </div>

      {/* Honeypot: hidden from people and assistive tech */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" value={v.website} onChange={set('website')} />
      </div>

      {serverError ? <p className="mt-6 rounded-xl bg-[#B3261E]/10 p-4 text-[14px] text-[#8C1D18]" role="alert">{serverError} Please try again, or email us at {site.email}.</p> : null}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-[13px] text-steel">We only use your details to reply to this enquiry.</p>
        <Button as="button" type="submit" size="lg" disabled={status === 'sending'} className="disabled:opacity-60">
          {status === 'sending' ? 'Sending…' : 'Send enquiry'}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, name, required, textarea, error, className, ...rest }) {
  const id = `f-${name}`;
  const errId = `${id}-err`;
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-[14px] font-medium">{label}{required ? <span className="text-steel"> *</span> : null}</label>
      <Tag id={id} name={name} required={required} aria-invalid={error ? 'true' : undefined} aria-describedby={error ? errId : undefined} className={cn('field', textarea && 'resize-y')} {...rest} />
      {error ? <p id={errId} className="mt-1.5 text-[13px] text-[#B3261E]">{error}</p> : null}
    </div>
  );
}

function Select({ label, name, required, error, options, className, ...rest }) {
  const id = `f-${name}`;
  const errId = `${id}-err`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-[14px] font-medium">{label}{required ? <span className="text-steel"> *</span> : null}</label>
      <div className="relative">
        <select id={id} name={name} required={required} aria-invalid={error ? 'true' : undefined} aria-describedby={error ? errId : undefined} className="field appearance-none pr-10" {...rest}>
          <option value="">Choose…</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Icon name="chevronRight" size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-steel" />
      </div>
      {error ? <p id={errId} className="mt-1.5 text-[13px] text-[#B3261E]">{error}</p> : null}
    </div>
  );
}
