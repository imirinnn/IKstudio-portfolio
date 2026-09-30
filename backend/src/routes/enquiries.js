import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { checkEnquiry } from '../lib/validate.js';
import { forwardToCrm } from '../lib/forwardToCrm.js';
import { sendEnquiryEmail } from '../lib/email.js';

/** Public: the website's contact form. */
export function enquiryRoutes({ store, crm, mail, forward = forwardToCrm, notify = sendEnquiryEmail }) {
  const router = Router();
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false,
    message: { message: 'Too many enquiries from this connection. Please try again in a few minutes.' },
  });

  router.post('/', limiter, async (req, res) => {
    if (req.body?.website) return res.status(201).json({ ok: true }); // honeypot: bots fill hidden fields
    const { value, errors } = checkEnquiry(req.body);
    if (Object.keys(errors).length) return res.status(422).json({ message: 'Some fields need attention.', errors });

    if (!mail) console.warn('Enquiry saved, but no email was sent: BREVO_API_KEY is not set in backend/.env.');
    const saved = await store.create({ ...value, crmStatus: crm ? 'pending' : 'not-configured', emailStatus: mail ? 'pending' : 'not-configured' });
    res.status(201).json({ ok: true });

    // After replying, so the visitor never waits for Brevo or the CRM (it may be asleep on free hosting).
    await Promise.all([
      mail && notify(mail, saved).then((r) => {
        if (r.ok) console.log(`Enquiry email sent to ${mail.to.join(', ')} (${r.messageId || 'no id'})`);
        else console.error(`Enquiry email FAILED: ${r.error}`);
        return store.update(saved.id, r.ok ? { emailStatus: 'sent', emailError: '' } : { emailStatus: 'failed', emailError: r.error });
      }),
      crm && forward(crm, saved).then((r) => store.update(saved.id, r.ok ? { crmStatus: 'sent', crmLeadId: r.leadId, crmError: '' } : { crmStatus: 'failed', crmError: r.error })),
    ]);
  });
  return router;
}
