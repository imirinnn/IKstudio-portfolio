import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { checkPassword, hashPassword, passwordProblem, publicAdmin, signToken } from '../lib/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

export function authRoutes({ store, jwtSecret, jwtExpiresIn, adminEmails = [] }) {
  const router = Router();
  const tokenOpts = { secret: jwtSecret, expiresIn: jwtExpiresIn };

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false,
    message: { message: 'Too many sign-in attempts. Wait 15 minutes and try again.' },
  });

  router.post('/login', loginLimiter, async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || !password) return res.status(400).json({ message: 'Enter your email and password.' });
    const allowed = adminEmails.includes(email);
    const admin = allowed ? await store.findAdminByEmail(email) : null;
    const ok = await checkPassword(password, admin?.passwordHash);
    if (!allowed || !admin || !ok || !admin.active) return res.status(401).json({ message: 'Email or password is incorrect.' });
    await store.updateAdmin(admin.id, { lastLoginAt: new Date() });
    res.json({ token: signToken(admin, tokenOpts), admin: publicAdmin(admin) });
  });

  const auth = requireAdmin({ store, jwtSecret, adminEmails });

  router.get('/me', auth, (req, res) => res.json({ admin: publicAdmin(req.admin) }));

  // Signs out every session of this admin (all devices).
  router.post('/logout-all', auth, async (req, res) => {
    await store.updateAdmin(req.admin.id, { tokenVersion: (req.admin.tokenVersion || 0) + 1 });
    res.json({ ok: true });
  });

  router.post('/change-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!(await checkPassword(String(currentPassword || ''), req.admin.passwordHash))) {
      return res.status(400).json({ message: 'Your current password is incorrect.', errors: { currentPassword: 'Incorrect password.' } });
    }
    const problem = passwordProblem(newPassword);
    if (problem) return res.status(422).json({ message: problem, errors: { newPassword: problem } });
    const updated = await store.updateAdmin(req.admin.id, {
      passwordHash: await hashPassword(newPassword),
      tokenVersion: (req.admin.tokenVersion || 0) + 1, // other sessions are signed out
    });
    res.json({ ok: true, token: signToken(updated, tokenOpts) });
  });

  return router;
}
