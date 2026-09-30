/*
 * CRM entity definitions: the single place that says which fields each record
 * has, their types and allowed values. Used for request validation and to
 * build the Mongoose models. Keep enums in sync with
 * frontend/src/config/entities.js (checked by test/schema-sync.test.js).
 */

export const ADMINS = ['Irin', 'Kaviya', 'Unassigned'];
export const PRIORITY = ['Low', 'Medium', 'High'];
export const PACKAGES = ['Basic', 'Full-Stack', 'Premium', 'Custom'];

export const LEAD_STATUS = ['New', 'Contacted', 'Interested', 'Discussion', 'Proposal Sent', 'Negotiation', 'Won', 'Project Started', 'Completed', 'Lost'];
export const LOST_REASONS = ['Budget issue', 'Not interested', 'Chose another developer', 'Project postponed', 'No response', 'Other'];
export const LEAD_SOURCES = ['Website form', 'Instagram', 'WhatsApp', 'Direct visit', 'Referral', 'Google', 'Other'];
export const DEAL_STAGES = ['Discussion', 'Requirement Gathering', 'Proposal Sent', 'Negotiation', 'Awaiting Confirmation', 'Won', 'Lost'];
export const CLIENT_STATUS = ['Not Started', 'Planning', 'Development', 'Client Review', 'Finalization', 'Deployment', 'Handover', 'Completed'];
export const PROJECT_STAGES = ['Planning', 'Design', 'Development', 'Client Review', 'Finalization', 'Deployment', 'Handover', 'Completed'];
export const DEPLOY_STATUS = ['Not deployed', 'Staging', 'Live'];
export const HANDOVER_STATUS = ['Pending', 'Handed over'];
export const FOLLOWUP_STATUS = ['Pending', 'Completed'];
export const TASK_STATUS = ['To Do', 'In Progress', 'Completed'];
export const RELATED_TYPES = ['None', 'Lead', 'Deal', 'Client', 'Project'];
export const ACTIVITY_TYPES = ['Note', 'Call', 'Meeting', 'WhatsApp', 'Email', 'Proposal sent', 'Payment received', 'Requirement change', 'Other'];

const s = (max = 160, extra = {}) => ({ type: 'string', max, ...extra });
const text = (max = 5000) => ({ type: 'string', max });
const e = (values, def) => ({ type: 'enum', values, default: def });
const money = { type: 'number', min: 0, max: 100000000 };
const date = { type: 'date' };
const ref = (entity) => ({ type: 'ref', ref: entity });
const bool = (def = false) => ({ type: 'bool', default: def });

export const entities = {
  leads: {
    model: 'Lead', prefix: 'L',
    fields: {
      businessName: s(160, { required: true }), contactPerson: s(120, { required: true }),
      phone: { type: 'phone' }, whatsapp: { type: 'phone' }, email: { type: 'email' },
      businessType: s(80), location: s(120), existingWebsite: { type: 'url' },
      requirement: text(3000), estimatedBudget: money,
      source: e(LEAD_SOURCES, 'Other'), assignedTo: e(ADMINS, 'Unassigned'),
      status: e(LEAD_STATUS, 'New'), lostReason: { type: 'enum', values: LOST_REASONS }, lostNote: s(300),
      priority: e(PRIORITY, 'Medium'), nextFollowUp: date, lastContacted: date,
      notes: text(), archived: bool(), clientId: ref('clients'),
    },
    indexes: ['status', 'assignedTo', 'nextFollowUp', 'archived', 'businessName', 'phone', 'email'],
  },
  followups: {
    model: 'FollowUp', prefix: 'F',
    fields: {
      title: s(160, { required: true }), dueDate: { type: 'date', required: true },
      assignedTo: e(ADMINS, 'Unassigned'), status: e(FOLLOWUP_STATUS, 'Pending'),
      notes: text(2000), outcome: text(2000), completedAt: date,
      leadId: ref('leads'), dealId: ref('deals'), clientId: ref('clients'),
    },
    indexes: ['dueDate', 'status', 'assignedTo', 'leadId', 'clientId'],
  },
  deals: {
    model: 'Deal', prefix: 'D',
    fields: {
      businessName: s(160, { required: true }), contactPerson: s(120), projectType: s(80),
      package: e(PACKAGES, 'Basic'), estimatedValue: money, negotiatedPrice: money,
      expectedClose: date, assignedTo: e(ADMINS, 'Unassigned'), stage: e(DEAL_STAGES, 'Discussion'),
      probability: { type: 'number', min: 0, max: 100 }, notes: text(),
      lastContacted: date, nextFollowUp: date, leadId: ref('leads'), clientId: ref('clients'),
    },
    indexes: ['stage', 'assignedTo', 'leadId', 'expectedClose'],
  },
  clients: {
    model: 'Client', prefix: 'C',
    fields: {
      businessName: s(160, { required: true }), contactPerson: s(120),
      phone: { type: 'phone' }, whatsapp: { type: 'phone' }, email: { type: 'email' },
      location: s(120), website: { type: 'url' }, projectType: s(80),
      package: e(PACKAGES, 'Basic'), finalPrice: money, assignedTo: e(ADMINS, 'Unassigned'),
      projectStatus: e(CLIENT_STATUS, 'Not Started'), startDate: date, expectedCompletion: date,
      notes: text(), leadId: ref('leads'),
    },
    indexes: ['businessName', 'assignedTo', 'projectStatus', 'phone', 'email'],
  },
  projects: {
    model: 'Project', prefix: 'P',
    fields: {
      name: s(160, { required: true }), clientId: ref('clients'), package: e(PACKAGES, 'Basic'),
      price: money, assignedTo: e(ADMINS, 'Unassigned'), startDate: date, deadline: date,
      stage: e(PROJECT_STAGES, 'Planning'), deploymentStatus: e(DEPLOY_STATUS, 'Not deployed'),
      handoverStatus: e(HANDOVER_STATUS, 'Pending'), githubUrl: { type: 'url' }, liveUrl: { type: 'url' },
      notes: text(),
    },
    indexes: ['clientId', 'stage', 'assignedTo', 'deadline'],
  },
  payments: {
    // One record per project: the 30 / 30 / 40 schedule. Amounts are derived from totalValue.
    model: 'Payment', prefix: 'PAY',
    fields: {
      clientId: ref('clients'), projectId: ref('projects'),
      totalValue: { ...money, required: true },
      advancePaid: bool(), advanceDate: date,
      developmentPaid: bool(), developmentDate: date,
      finalPaid: bool(), finalDate: date,
      notes: text(2000),
    },
    indexes: ['clientId', 'projectId'],
  },
  tasks: {
    model: 'Task', prefix: 'T',
    fields: {
      title: s(160, { required: true }), assignedTo: e(ADMINS, 'Unassigned'), dueDate: date,
      priority: e(PRIORITY, 'Medium'), status: e(TASK_STATUS, 'To Do'),
      relatedType: e(RELATED_TYPES, 'None'), relatedId: { type: 'id' }, notes: text(2000),
    },
    indexes: ['status', 'assignedTo', 'dueDate'],
  },
  activities: {
    model: 'Activity', prefix: 'A',
    fields: {
      type: e(ACTIVITY_TYPES, 'Note'), summary: { type: 'string', max: 2000, required: true }, date: date,
      leadId: ref('leads'), dealId: ref('deals'), clientId: ref('clients'), projectId: ref('projects'),
      by: s(60),
    },
    indexes: ['leadId', 'clientId', 'projectId', 'date'],
  },
};

export const ENTITY_NAMES = Object.keys(entities);
