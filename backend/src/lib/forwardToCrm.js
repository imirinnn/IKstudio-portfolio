/**
 * Sends a stored enquiry to the private CRM (server-to-server, shared key).
 * Returns { ok, leadId?, error? }. Never throws.
 */
export async function forwardToCrm(crm, enquiry, { timeoutMs = 60000 } = {}) {
  if (!crm) return { ok: false, error: 'CRM forwarding is not configured.' };
  const fields = ['name', 'email', 'phone', 'company', 'websiteType', 'package', 'budget', 'description', 'additional'];
  const body = Object.fromEntries(fields.map((k) => [k, enquiry[k] ?? '']));
  try {
    const res = await fetch(`${crm.url}/api/intake/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Intake-Key': crm.key },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs), // free hosting can take ~50s to wake up
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: `CRM answered ${res.status}: ${data.message || 'error'}` };
    return { ok: true, leadId: data.leadId };
  } catch (err) {
    return { ok: false, error: err.name === 'TimeoutError' ? 'CRM did not respond in time.' : err.message };
  }
}
