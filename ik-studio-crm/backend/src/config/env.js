import 'dotenv/config';

function fail(msg) {
  throw new Error(`${msg} Copy .env.example to .env and fill it in.`);
}

export function loadEnv() {
  const isProd = process.env.NODE_ENV === 'production';
  const jwtSecret = process.env.JWT_SECRET || '';
  if (jwtSecret.length < 32) fail('JWT_SECRET must be set and at least 32 characters long.');
  if (!process.env.MONGODB_URI) fail('MONGODB_URI is missing.');
  const adminEmails = parseEmails(process.env.ADMIN_EMAILS);
  if (!adminEmails.length) fail('ADMIN_EMAILS must list the email address(es) allowed to use the CRM.');
  if (process.env.INTAKE_KEY && process.env.INTAKE_KEY.length < 24) fail('INTAKE_KEY must be at least 24 characters (or leave it empty).');
  return {
    port: Number(process.env.PORT) || 5000,
    isProd,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
    adminEmails,
    intakeKey: process.env.INTAKE_KEY || '',
    corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
  };
}

/** Comma-separated list → normalised, de-duplicated emails. */
export function parseEmails(value) {
  return [...new Set(String(value || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean))];
}
