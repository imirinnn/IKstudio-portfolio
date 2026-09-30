/*
 * PREVIEW ONLY. An in-browser stand-in for the API, filled with invented sample
 * records so the CRM can be explored without a server. It is bundled only when
 * VITE_CRM_DEMO=true and must never be enabled for the real deployment.
 */
const DEMO_EMAIL = 'demo@preview.local';
const DEMO_PASSWORD = 'preview';

let seq = 0;
const id = () => (++seq).toString(16).padStart(24, '0');
const day = (n) => { const d = new Date(); d.setHours(10, 0, 0, 0); d.setDate(d.getDate() + n); return d.toISOString(); };
const counters = {};
const PREFIX = { leads: 'L', followups: 'F', deals: 'D', clients: 'C', projects: 'P', payments: 'PAY', tasks: 'T', activities: 'A' };
const stamp = (entity, o, created = -20) => {
  counters[entity] = (counters[entity] || 0) + 1;
  return { id: id(), code: `${PREFIX[entity]}-${String(counters[entity]).padStart(4, '0')}`, createdAt: day(created), updatedAt: day(Math.min(0, created + 5)), ...o };
};

function seed() {
  const db = { leads: [], followups: [], deals: [], clients: [], projects: [], payments: [], tasks: [], activities: [] };
  const L = (o, c) => { const r = stamp('leads', { priority: 'Medium', archived: false, ...o }, c); db.leads.push(r); return r; };
  const cafe = L({ businessName: 'Sample Café (demo)', contactPerson: 'Anu', phone: '90000 00001', whatsapp: '90000 00001', businessType: 'Café', location: 'Coimbatore', source: 'Instagram', assignedTo: 'Irin', status: 'Won', estimatedBudget: 9000, priority: 'High', lastContacted: day(-40) }, -60);
  const gym = L({ businessName: 'Demo Fitness Studio', contactPerson: 'Karthik', phone: '90000 00002', businessType: 'Gym', location: 'Pollachi', source: 'Referral', assignedTo: 'Kaviya', status: 'Won', estimatedBudget: 14000, lastContacted: day(-20) }, -35);
  L({ businessName: 'Example Salon', contactPerson: 'Priya', phone: '90000 00003', businessType: 'Salon', location: 'Coimbatore', source: 'WhatsApp', assignedTo: 'Irin', status: 'Proposal Sent', estimatedBudget: 10000, nextFollowUp: day(0), lastContacted: day(-3), priority: 'High' }, -8);
  const rest = L({ businessName: 'Test Restaurant', contactPerson: 'Vijay', phone: '90000 00004', businessType: 'Restaurant', location: 'Tiruppur', source: 'Direct visit', assignedTo: 'Irin', status: 'Contacted', estimatedBudget: 8000, nextFollowUp: day(-2), lastContacted: day(-6) }, -10);
  L({ businessName: 'Placeholder Interiors', contactPerson: 'Deepa', email: 'deepa@example.com', businessType: 'Interior design', location: 'Coimbatore', source: 'Google', assignedTo: 'Kaviya', status: 'Negotiation', estimatedBudget: 22000, nextFollowUp: day(3), lastContacted: day(-1) }, -14);
  L({ businessName: 'Mock Bakery', contactPerson: 'Rahim', phone: '90000 00006', businessType: 'Bakery', source: 'Instagram', assignedTo: 'Unassigned', status: 'New', nextFollowUp: day(1) }, -1);
  L({ businessName: 'Sample Tutors', contactPerson: 'Lakshmi', businessType: 'Education', source: 'Website form', assignedTo: 'Kaviya', status: 'Interested', nextFollowUp: day(5), estimatedBudget: 12000 }, -4);
  L({ businessName: 'Demo Boutique', contactPerson: 'Sneha', businessType: 'Retail', source: 'Instagram', assignedTo: 'Irin', status: 'Lost', lostReason: 'Budget issue' }, -25);
  L({ businessName: 'Example Clinic', contactPerson: 'Dr. Ram', businessType: 'Healthcare', source: 'Referral', assignedTo: 'Kaviya', status: 'Discussion', nextFollowUp: day(-1), estimatedBudget: 15000 }, -6);

  const D = (o, c) => { const r = stamp('deals', o, c); db.deals.push(r); return r; };
  D({ businessName: 'Placeholder Interiors', contactPerson: 'Deepa', projectType: 'Portfolio + enquiries', package: 'Premium', estimatedValue: 22000, negotiatedPrice: 21000, expectedClose: day(10), assignedTo: 'Kaviya', stage: 'Negotiation', probability: 60, nextFollowUp: day(3) }, -12);
  D({ businessName: 'Example Salon', contactPerson: 'Priya', projectType: 'Business website', package: 'Basic', estimatedValue: 10000, expectedClose: day(6), assignedTo: 'Irin', stage: 'Proposal Sent', probability: 50 }, -7);
  D({ businessName: 'Demo Boutique', package: 'Basic', estimatedValue: 9000, assignedTo: 'Irin', stage: 'Lost', probability: 0 }, -24);

  const C = (o, c) => { const r = stamp('clients', o, c); db.clients.push(r); return r; };
  const c1 = C({ businessName: 'Sample Café (demo)', contactPerson: 'Anu', phone: '90000 00001', location: 'Coimbatore', projectType: 'Business website', package: 'Basic', finalPrice: 9000, assignedTo: 'Irin', projectStatus: 'Completed', startDate: day(-55), expectedCompletion: day(-30), leadId: cafe.id }, -55);
  const c2 = C({ businessName: 'Demo Fitness Studio', contactPerson: 'Karthik', phone: '90000 00002', location: 'Pollachi', projectType: 'Full-stack website', package: 'Full-Stack', finalPrice: 14000, assignedTo: 'Kaviya', projectStatus: 'Client Review', startDate: day(-20), expectedCompletion: day(9), leadId: gym.id }, -20);
  cafe.clientId = c1.id; gym.clientId = c2.id;

  const P = (o, c) => { const r = stamp('projects', o, c); db.projects.push(r); return r; };
  const p1 = P({ name: 'Sample Café website', clientId: c1.id, package: 'Basic', price: 9000, assignedTo: 'Irin', startDate: day(-55), deadline: day(-30), stage: 'Completed', deploymentStatus: 'Live', handoverStatus: 'Handed over' }, -55);
  const p2 = P({ name: 'Demo Fitness website + members', clientId: c2.id, package: 'Full-Stack', price: 14000, assignedTo: 'Kaviya', startDate: day(-20), deadline: day(9), stage: 'Client Review', deploymentStatus: 'Staging', handoverStatus: 'Pending' }, -20);

  db.payments.push(stamp('payments', { clientId: c1.id, projectId: p1.id, totalValue: 9000, advancePaid: true, advanceDate: day(-55), developmentPaid: true, developmentDate: day(-38), finalPaid: true, finalDate: day(-29) }, -55));
  db.payments.push(stamp('payments', { clientId: c2.id, projectId: p2.id, totalValue: 14000, advancePaid: true, advanceDate: day(-19), developmentPaid: true, developmentDate: day(-1), finalPaid: false }, -20));

  db.followups.push(stamp('followups', { title: 'Confirm proposal decision', dueDate: day(0), assignedTo: 'Irin', status: 'Pending', leadId: db.leads[2].id }, -3));
  db.followups.push(stamp('followups', { title: 'Share menu content checklist', dueDate: day(-2), assignedTo: 'Irin', status: 'Pending', leadId: rest.id }, -6));
  db.followups.push(stamp('followups', { title: 'Send revised premium quote', dueDate: day(3), assignedTo: 'Kaviya', status: 'Pending', leadId: db.leads[4].id }, -1));

  const T = (o) => db.tasks.push(stamp('tasks', o, -5));
  T({ title: 'Request images', assignedTo: 'Kaviya', dueDate: day(1), priority: 'High', status: 'In Progress', relatedType: 'Project', relatedId: p2.id });
  T({ title: 'Configure domain', assignedTo: 'Kaviya', dueDate: day(8), priority: 'Medium', status: 'To Do', relatedType: 'Project', relatedId: p2.id });
  T({ title: 'Prepare proposal', assignedTo: 'Irin', dueDate: day(-1), priority: 'High', status: 'To Do', relatedType: 'Lead', relatedId: db.leads[8].id });
  T({ title: 'Handover project', assignedTo: 'Irin', dueDate: day(-29), priority: 'Medium', status: 'Completed', relatedType: 'Project', relatedId: p1.id });

  const A = (o, c) => db.activities.push(stamp('activities', { date: day(c), ...o }, c));
  A({ type: 'Call', summary: 'Called and discussed requirements.', by: 'Irin', leadId: cafe.id }, -58);
  A({ type: 'Proposal sent', summary: 'Sent proposal for the Basic package.', by: 'Irin', leadId: cafe.id }, -57);
  A({ type: 'Payment received', summary: '30% advance received.', by: 'Irin', clientId: c1.id, projectId: p1.id }, -55);
  A({ type: 'Meeting', summary: 'Requirement meeting at the studio.', by: 'Kaviya', leadId: gym.id, clientId: c2.id }, -22);
  A({ type: 'Payment received', summary: '30% development payment received.', by: 'Kaviya', clientId: c2.id, projectId: p2.id }, -1);
  A({ type: 'WhatsApp', summary: 'Client asked to change the membership plan names.', by: 'Kaviya', clientId: c2.id, projectId: p2.id }, 0);
  return db;
}

const db = seed();
const clone = (x) => structuredClone(x);
const wait = (v) => new Promise((r) => setTimeout(() => r(clone(v)), 120));
const fail = (message, status = 400, fields) => { const e = new Error(message); e.status = status; e.fields = fields; return Promise.reject(e); };
const admin = { id: 'demo', name: 'Irin', email: DEMO_EMAIL, role: 'Frontend Developer / Admin (preview)' };
const log = (o) => db.activities.unshift(stamp('activities', { type: 'Note', date: new Date().toISOString(), by: admin.name, ...o }, 0));

export const demoApi = {
  mode: 'demo',
  configured: true,
  demoCredentials: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
  login: (email, password) => (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD ? wait({ token: 'demo', admin }) : fail('Email or password is incorrect.', 401)),
  me: () => wait({ admin }),
  logoutAll: () => wait({ ok: true }),
  changePassword: () => fail('Password changes are disabled in the preview.'),
  bootstrap: () => wait(db),
  create(entity, data) {
    const rec = stamp(entity, { ...data }, 0);
    rec.createdAt = rec.updatedAt = new Date().toISOString();
    if (entity === 'activities') rec.by = admin.name;
    db[entity].unshift(rec);
    return wait(rec);
  },
  update(entity, recId, patch) {
    const i = db[entity].findIndex((r) => r.id === recId);
    if (i < 0) return fail('Record not found.', 404);
    const before = db[entity][i];
    db[entity][i] = { ...before, ...patch, updatedAt: new Date().toISOString() };
    if (entity === 'leads' && patch.status && patch.status !== before.status) log({ leadId: recId, summary: `Status changed from ${before.status} to ${patch.status}.` });
    if (entity === 'projects' && patch.stage && patch.stage !== before.stage) log({ projectId: recId, clientId: before.clientId, summary: `Project moved from ${before.stage} to ${patch.stage}.` });
    if (entity === 'payments') for (const [k, l] of [['advancePaid', '30% advance'], ['developmentPaid', '30% development payment'], ['finalPaid', '40% final payment']]) if (patch[k] === true && !before[k]) log({ type: 'Payment received', clientId: before.clientId, projectId: before.projectId, summary: `${l} received.` });
    return wait(db[entity][i]);
  },
  remove(entity, recId) {
    if (entity === 'clients' && (db.projects.some((p) => p.clientId === recId) || db.payments.some((p) => p.clientId === recId))) return fail('This client still has linked projects or payments. Delete or reassign them first.', 409);
    if (entity === 'projects' && db.payments.some((p) => p.projectId === recId)) return fail('This project still has a payment plan. Delete it first.', 409);
    db[entity] = db[entity].filter((r) => r.id !== recId);
    return wait({ ok: true });
  },
  convert(body) {
    const lead = db.leads.find((l) => l.id === body.leadId);
    const deal = db.deals.find((d) => d.id === body.dealId);
    const src = { ...(lead || {}), ...(deal || {}) };
    if (!lead && !deal) return fail('Choose the lead or deal to convert.', 404);
    if (src.clientId) return fail('This has already been converted to a client.', 409);
    const price = Number(body.finalPrice ?? deal?.negotiatedPrice ?? deal?.estimatedValue);
    if (!price) return fail('Enter the final project price.', 422, { finalPrice: 'Required to set up payments.' });
    const now = new Date().toISOString();
    const client = stamp('clients', { businessName: src.businessName, contactPerson: src.contactPerson, phone: lead?.phone, whatsapp: lead?.whatsapp, email: lead?.email, location: lead?.location, projectType: body.projectType || deal?.projectType || lead?.businessType, package: body.package || deal?.package || 'Basic', finalPrice: price, assignedTo: body.assignedTo || src.assignedTo, projectStatus: 'Planning', startDate: body.startDate || null, expectedCompletion: body.deadline || null, leadId: lead?.id, createdAt: now, updatedAt: now }, 0);
    const project = stamp('projects', { name: body.projectName || `${client.businessName} website`, clientId: client.id, package: client.package, price, assignedTo: client.assignedTo, startDate: body.startDate || null, deadline: body.deadline || null, stage: 'Planning', deploymentStatus: 'Not deployed', handoverStatus: 'Pending', createdAt: now, updatedAt: now }, 0);
    const payment = stamp('payments', { clientId: client.id, projectId: project.id, totalValue: price, advancePaid: false, developmentPaid: false, finalPaid: false, createdAt: now, updatedAt: now }, 0);
    db.clients.unshift(client); db.projects.unshift(project); db.payments.unshift(payment);
    if (lead) Object.assign(lead, { status: 'Won', clientId: client.id, updatedAt: now });
    if (deal) Object.assign(deal, { stage: 'Won', clientId: client.id, updatedAt: now });
    log({ leadId: lead?.id, clientId: client.id, projectId: project.id, summary: `Converted to client ${client.code}. Project ${project.code} created with a 30/30/40 payment schedule.` });
    return wait({ client, project, payment });
  },
};
