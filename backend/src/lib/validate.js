/** Same rules as frontend/src/utils/validation.js. Only these fields are kept. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PACKAGES = { basic: 'Basic', 'full-stack': 'Full-Stack', premium: 'Premium', 'not-sure': 'Not sure yet' };
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function checkEnquiry(b = {}) {
  const v = {
    name: str(b.name, 120), email: str(b.email, 200).toLowerCase(), phone: str(b.phone, 20), company: str(b.company, 160),
    websiteType: str(b.websiteType, 80), package: str(b.package, 20), budget: str(b.budget, 60),
    description: str(b.description, 3001), additional: str(b.additional, 2001),
  };
  const errors = {};
  if (v.name.length < 2) errors.name = 'Enter your name.';
  if (!EMAIL.test(v.email)) errors.email = 'Enter a valid email address.';
  const digits = v.phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) errors.phone = 'Enter a 10-digit phone number.';
  if (!v.websiteType) errors.websiteType = 'Choose the type of website.';
  if (!PACKAGES[v.package]) errors.package = 'Choose a package.';
  if (v.description.length < 20 || v.description.length > 3000) errors.description = 'Tell us a little more about the project (20 to 3,000 characters).';
  if (v.additional.length > 2000) errors.additional = 'Keep this under 2,000 characters.';
  return { value: v, errors };
}
