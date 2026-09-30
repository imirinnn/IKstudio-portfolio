/** Send one sample enquiry email to NOTIFY_EMAILS to check the Brevo setup. Run: npm run test-email (file: scripts/send-sample-email.js) */
import 'dotenv/config';
import { sendEnquiryEmail } from '../src/lib/email.js';

const to = (process.env.NOTIFY_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean);
if (!process.env.BREVO_API_KEY || !process.env.MAIL_FROM_EMAIL || !to.length) {
  console.error('Set BREVO_API_KEY, MAIL_FROM_EMAIL and NOTIFY_EMAILS in .env first.');
  process.exit(1);
}
const mail = { apiKey: process.env.BREVO_API_KEY, fromEmail: process.env.MAIL_FROM_EMAIL, fromName: process.env.MAIL_FROM_NAME || 'IK Studio', to };
const r = await sendEnquiryEmail(mail, {
  name: 'Test Customer', email: process.env.MAIL_FROM_EMAIL, phone: '9876543210', company: 'Test Café (sample)',
  websiteType: 'Café / restaurant', package: 'basic', budget: '₹8,000 – ₹10,000',
  description: 'This is a test enquiry sent by npm run test-email to check the Brevo setup.', additional: '',
});
console.log(r.ok ? `Sent to ${to.join(', ')} (message ${r.messageId}).` : `Failed: ${r.error}`);
process.exit(r.ok ? 0 : 1);
