const API_URL = (import.meta.env && import.meta.env.VITE_API_URL) || '';

export const hasApi = Boolean(API_URL);

export async function submitEnquiry(payload) {
  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'The enquiry could not be sent.');
    err.fields = data.errors;
    throw err;
  }
  return data;
}

/** Plain-text version of an enquiry, used for the email / WhatsApp fallback. */
export function enquiryText(v, labels) {
  return [
    `New project enquiry`,
    `Name: ${v.name}`,
    `Email: ${v.email}`,
    `Phone: ${v.phone}`,
    v.company && `Business: ${v.company}`,
    `Website type: ${v.websiteType}`,
    `Package: ${labels.package || v.package}`,
    v.budget && `Budget: ${v.budget}`,
    ``,
    v.description,
    v.additional && `\nAdditional: ${v.additional}`,
  ].filter((x) => x !== undefined && x !== false && x !== '').join('\n');
}
