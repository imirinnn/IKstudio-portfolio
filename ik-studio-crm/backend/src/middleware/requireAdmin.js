import { verifyToken } from '../lib/auth.js';

/**
 * Every /api/admin route (except login) passes through this. An admin must
 * have a valid token AND an email on the ADMIN_EMAILS allow-list.
 */
export function requireAdmin({ store, jwtSecret, adminEmails = [] }) {
  return async (req, res, next) => {
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Sign in to continue.' });
    let payload;
    try { payload = verifyToken(token, jwtSecret); }
    catch { return res.status(401).json({ message: 'Your session has expired. Sign in again.' }); }
    const admin = await store.getAdmin(payload.sub);
    if (!admin || !admin.active || (admin.tokenVersion || 0) !== payload.tv || !adminEmails.includes(admin.email)) {
      return res.status(401).json({ message: 'Your session has expired. Sign in again.' });
    }
    req.admin = admin;
    next();
  };
}
