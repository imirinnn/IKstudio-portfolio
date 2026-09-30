// Shared rules for the enquiry form. The backend applies the same checks.
export const WEBSITE_TYPES = ['Business website', 'Café / restaurant', 'Gym / fitness', 'Salon / beauty', 'Personal brand', 'Interior / architecture', 'Online service', 'Other'];
export const PACKAGE_OPTIONS = [
  { value: 'basic', label: 'Basic · ₹8K – ₹10K' },
  { value: 'full-stack', label: 'Full-Stack · ₹12K – ₹15K' },
  { value: 'premium', label: 'Premium · ₹20K – ₹25K' },
  { value: 'not-sure', label: 'Not sure yet' },
];
export const BUDGETS = ['₹8,000 – ₹10,000', '₹10,000 – ₹15,000', '₹15,000 – ₹20,000', '₹20,000 – ₹25,000', 'Above ₹25,000', 'Need guidance'];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEnquiry(v) {
  const e = {};
  if (!v.name || v.name.trim().length < 2) e.name = 'Enter your name.';
  if (!v.email || !EMAIL.test(v.email.trim())) e.email = 'Enter a valid email address, like name@business.com.';
  const digits = (v.phone || '').replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) e.phone = 'Enter a 10-digit phone number.';
  if (!v.websiteType) e.websiteType = 'Choose the type of website.';
  if (!v.package) e.package = 'Choose a package, or “Not sure yet”.';
  if (!v.description || v.description.trim().length < 20) e.description = 'Tell us a little more about the project (at least 20 characters).';
  if ((v.description || '').length > 3000) e.description = 'Keep the description under 3,000 characters.';
  if ((v.additional || '').length > 2000) e.additional = 'Keep this under 2,000 characters.';
  return e;
}
