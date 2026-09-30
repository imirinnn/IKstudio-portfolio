import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const ROUNDS = 12;
// Compared against when an email is unknown, so response time doesn't reveal which emails exist.
let dummyHash;
const getDummyHash = () => (dummyHash ||= bcrypt.hashSync('not-a-real-password', ROUNDS));

export const hashPassword = (plain) => bcrypt.hash(plain, ROUNDS);
export const checkPassword = (plain, hash) => bcrypt.compare(plain, hash || getDummyHash());

export function passwordProblem(pw) {
  if (typeof pw !== 'string' || pw.length < 10) return 'Use at least 10 characters.';
  if (pw.length > 200) return 'Use at most 200 characters.';
  if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) return 'Use a mix of letters and numbers.';
  return null;
}

export function signToken(admin, { secret, expiresIn }) {
  return jwt.sign({ sub: String(admin.id), tv: admin.tokenVersion || 0 }, secret, { expiresIn, issuer: 'ik-crm', algorithm: 'HS256' });
}

export function verifyToken(token, secret) {
  return jwt.verify(token, secret, { issuer: 'ik-crm', algorithms: ['HS256'] });
}

export const publicAdmin = (a) => ({ id: a.id, name: a.name, email: a.email, role: a.role });
