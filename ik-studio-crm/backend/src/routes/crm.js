import { Router } from 'express';
import { entities } from '../crm/schema.js';
import { validate } from '../lib/validate.js';

/** Records that other records point to, checked before deleting. */
const DEPENDENTS = {
  clients: [['projects', 'clientId'], ['payments', 'clientId']],
  projects: [['payments', 'projectId']],
};

export function crmRoutes({ store }) {
  const router = Router();

  router.param('entity', (req, res, next, entity) => {
    if (!Object.prototype.hasOwnProperty.call(entities, entity)) return res.status(404).json({ message: 'Not found.' });
    req.spec = entities[entity];
    next();
  });

  const logActivity = (req, data) => store.create('activities', { type: 'Note', date: new Date(), by: req.admin.name, ...data });

  // Everything the dashboard needs in one request.
  router.get('/bootstrap', async (req, res) => {
    const names = Object.keys(entities);
    const lists = await Promise.all(names.map((n) => store.list(n)));
    res.json(Object.fromEntries(names.map((n, i) => [n, lists[i]])));
  });

  router.get('/:entity', async (req, res) => {
    res.json({ items: await store.list(req.params.entity) });
  });

  router.get('/:entity/:id', async (req, res) => {
    const item = await store.get(req.params.entity, req.params.id);
    if (!item) return res.status(404).json({ message: 'Record not found.' });
    res.json({ item });
  });

  router.post('/:entity', async (req, res) => {
    const { value, errors } = validate(req.spec, req.body);
    if (Object.keys(errors).length) return res.status(422).json({ message: 'Some fields need attention.', errors });
    if (req.params.entity === 'activities') { value.by = req.admin.name; value.date = value.date || new Date(); }
    if (req.params.entity === 'followups' && value.status === 'Completed') value.completedAt = value.completedAt || new Date();
    const item = await store.create(req.params.entity, value);
    res.status(201).json({ item });
  });

  router.patch('/:entity/:id', async (req, res) => {
    const { value, errors } = validate(req.spec, req.body, { partial: true });
    if (Object.keys(errors).length) return res.status(422).json({ message: 'Some fields need attention.', errors });
    if (req.params.entity === 'activities') delete value.by;
    if (req.params.entity === 'followups' && value.status === 'Completed' && !value.completedAt) value.completedAt = new Date();
    const before = await store.get(req.params.entity, req.params.id);
    if (!before) return res.status(404).json({ message: 'Record not found.' });
    const item = await store.update(req.params.entity, req.params.id, value);

    // Automatic timeline entries for status changes that matter to both admins.
    if (req.params.entity === 'leads' && value.status && value.status !== before.status) {
      await logActivity(req, { leadId: item.id, summary: `Status changed from ${before.status} to ${value.status}${value.status === 'Lost' && item.lostReason ? ` (${item.lostReason})` : ''}.` });
    }
    if (req.params.entity === 'payments') {
      for (const [k, label] of [['advancePaid', '30% advance'], ['developmentPaid', '30% development payment'], ['finalPaid', '40% final payment']]) {
        if (value[k] === true && !before[k]) await logActivity(req, { type: 'Payment received', clientId: item.clientId, projectId: item.projectId, summary: `${label} received.` });
      }
    }
    if (req.params.entity === 'projects' && value.stage && value.stage !== before.stage) {
      await logActivity(req, { projectId: item.id, clientId: item.clientId, summary: `Project moved from ${before.stage} to ${value.stage}.` });
    }
    res.json({ item });
  });

  router.delete('/:entity/:id', async (req, res) => {
    for (const [dep, key] of DEPENDENTS[req.params.entity] || []) {
      const n = await store.count(dep, { [key]: req.params.id });
      if (n) return res.status(409).json({ message: `This record still has ${n} linked ${dep}. Delete or reassign them first.` });
    }
    const ok = await store.remove(req.params.entity, req.params.id);
    if (!ok) return res.status(404).json({ message: 'Record not found.' });
    res.json({ ok: true });
  });

  return router;
}

/**
 * POST /api/admin/convert — turn a won lead or deal into a client, with a
 * project and a 30/30/40 payment schedule in one step.
 */
export function convertRoute({ store }) {
  const router = Router();
  router.post('/', async (req, res) => {
    const { leadId, dealId } = req.body || {};
    const lead = leadId ? await store.get('leads', leadId) : null;
    const deal = dealId ? await store.get('deals', dealId) : null;
    if (!lead && !deal) return res.status(404).json({ message: 'Choose the lead or deal to convert.' });
    if (lead?.clientId || deal?.clientId) return res.status(409).json({ message: 'This has already been converted to a client.' });
    const src = { ...(lead || {}), ...(deal || {}) };
    const linkedLead = lead || (deal?.leadId ? await store.get('leads', deal.leadId) : null);

    const input = {
      businessName: src.businessName, contactPerson: src.contactPerson,
      phone: linkedLead?.phone, whatsapp: linkedLead?.whatsapp, email: linkedLead?.email,
      location: linkedLead?.location, website: linkedLead?.existingWebsite,
      projectType: req.body.projectType || deal?.projectType || linkedLead?.businessType,
      package: req.body.package || deal?.package, finalPrice: req.body.finalPrice ?? deal?.negotiatedPrice ?? deal?.estimatedValue,
      assignedTo: req.body.assignedTo || src.assignedTo, projectStatus: 'Planning',
      startDate: req.body.startDate, expectedCompletion: req.body.deadline, leadId: linkedLead?.id,
    };
    const c = validate(entities.clients, input);
    if (Object.keys(c.errors).length) return res.status(422).json({ message: 'Some fields need attention.', errors: c.errors });
    if (!c.value.finalPrice) return res.status(422).json({ message: 'Enter the final project price.', errors: { finalPrice: 'Required to set up payments.' } });

    const client = await store.create('clients', c.value);
    const p = validate(entities.projects, {
      name: req.body.projectName || `${client.businessName} website`, clientId: client.id, package: client.package,
      price: client.finalPrice, assignedTo: client.assignedTo, startDate: req.body.startDate, deadline: req.body.deadline, stage: 'Planning',
    });
    if (Object.keys(p.errors).length) return res.status(422).json({ message: 'Some fields need attention.', errors: p.errors });
    const project = await store.create('projects', p.value);
    const payment = await store.create('payments', { clientId: client.id, projectId: project.id, totalValue: client.finalPrice, advancePaid: false, developmentPaid: false, finalPaid: false });

    if (linkedLead) await store.update('leads', linkedLead.id, { status: 'Won', clientId: client.id });
    if (deal) await store.update('deals', deal.id, { stage: 'Won', clientId: client.id });
    await store.create('activities', { type: 'Note', date: new Date(), by: req.admin.name, leadId: linkedLead?.id, dealId: deal?.id, clientId: client.id, projectId: project.id, summary: `Converted to client ${client.code}. Project ${project.code} created with a 30/30/40 payment schedule.` });
    res.status(201).json({ client, project, payment });
  });
  return router;
}
