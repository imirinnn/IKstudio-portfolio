import 'dotenv/config';

export function loadEnv() {
  // A missing or placeholder MONGODB_URI falls back to a local JSON file (fine for running on
  // your own computer; use MongoDB Atlas when you deploy).
  const rawUri = (process.env.MONGODB_URI || '').trim();
  const mongoUri = rawUri && !rawUri.includes('<') ? rawUri : '';
  const crmUrl = (process.env.CRM_INTAKE_URL || '').replace(/\/$/, '');
  const crmKey = process.env.CRM_INTAKE_KEY || '';
  if ((crmUrl && !crmKey) || (!crmUrl && crmKey)) throw new Error('Set both CRM_INTAKE_URL and CRM_INTAKE_KEY, or neither.');
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  let mail = null;
  if (process.env.BREVO_API_KEY) {
    const to = (process.env.NOTIFY_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    const fromEmail = (process.env.MAIL_FROM_EMAIL || '').trim();
    if (!to.length || !to.every((x) => EMAIL.test(x))) throw new Error('NOTIFY_EMAILS must list valid email addresses when BREVO_API_KEY is set.');
    if (!EMAIL.test(fromEmail)) throw new Error('MAIL_FROM_EMAIL must be a sender address verified in Brevo.');
    mail = { apiKey: process.env.BREVO_API_KEY, fromEmail, fromName: (process.env.MAIL_FROM_NAME || 'IK Studio').trim(), to };
  }
  return {
    port: Number(process.env.PORT) || 5000,
    isProd: process.env.NODE_ENV === 'production',
    mongoUri,
    corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
    crm: crmUrl ? { url: crmUrl, key: crmKey } : null,
    mail,
  };
}
