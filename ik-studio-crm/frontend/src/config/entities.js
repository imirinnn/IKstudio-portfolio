/*
 * Admin CRM field definitions (labels, input types, options, table columns).
 * Enum values must match backend/src/crm/schema.js — test/schema-sync.test.js checks this.
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

// Lead pipeline columns (Lost is shown separately).
export const PIPELINE = LEAD_STATUS.filter((s) => s !== 'Lost');

const f = (key, label, type = 'text', extra = {}) => ({ key, label, type, ...extra });

export const entities = {
  leads: {
    label: 'Leads', singular: 'Lead',
    search: ['code', 'businessName', 'contactPerson', 'phone', 'whatsapp', 'email', 'location', 'businessType'],
    fields: [
      f('businessName', 'Business name', 'text', { required: true }),
      f('contactPerson', 'Contact person', 'text', { required: true }),
      f('phone', 'Phone', 'tel'), f('whatsapp', 'WhatsApp', 'tel'), f('email', 'Email', 'email'),
      f('businessType', 'Business type'), f('location', 'Location'), f('existingWebsite', 'Existing website', 'url'),
      f('requirement', 'Website requirement', 'textarea', { wide: true }),
      f('estimatedBudget', 'Estimated budget (₹)', 'money'),
      f('source', 'Lead source', 'select', { options: LEAD_SOURCES, default: 'Instagram' }),
      f('assignedTo', 'Assigned to', 'select', { options: ADMINS, default: 'Unassigned' }),
      f('status', 'Lead status', 'select', { options: LEAD_STATUS, default: 'New' }),
      f('lostReason', 'Lost reason', 'select', { options: LOST_REASONS, showIf: (v) => v.status === 'Lost' }),
      f('lostNote', 'Lost note', 'text', { showIf: (v) => v.status === 'Lost' }),
      f('priority', 'Priority', 'select', { options: PRIORITY, default: 'Medium' }),
      f('nextFollowUp', 'Next follow-up', 'date'), f('lastContacted', 'Last contacted', 'date'),
      f('notes', 'Notes', 'textarea', { wide: true }),
    ],
  },
  followups: {
    label: 'Follow-ups', singular: 'Follow-up',
    search: ['code', 'title', 'notes'],
    fields: [
      f('title', 'What to follow up', 'text', { required: true, wide: true }),
      f('dueDate', 'Due date', 'date', { required: true }),
      f('assignedTo', 'Assigned to', 'select', { options: ADMINS, default: 'Unassigned' }),
      f('leadId', 'Lead', 'ref', { ref: 'leads' }), f('clientId', 'Client', 'ref', { ref: 'clients' }),
      f('status', 'Status', 'select', { options: FOLLOWUP_STATUS, default: 'Pending' }),
      f('notes', 'Notes', 'textarea', { wide: true }),
      f('outcome', 'Outcome', 'textarea', { wide: true, showIf: (v) => v.status === 'Completed' }),
    ],
  },
  deals: {
    label: 'Deals', singular: 'Deal',
    search: ['code', 'businessName', 'contactPerson', 'projectType'],
    fields: [
      f('businessName', 'Business', 'text', { required: true }), f('contactPerson', 'Contact person'),
      f('leadId', 'Linked lead', 'ref', { ref: 'leads' }),
      f('projectType', 'Project type'), f('package', 'Package', 'select', { options: PACKAGES, default: 'Basic' }),
      f('estimatedValue', 'Estimated value (₹)', 'money'), f('negotiatedPrice', 'Negotiated price (₹)', 'money'),
      f('expectedClose', 'Expected closing', 'date'),
      f('assignedTo', 'Assigned developer', 'select', { options: ADMINS, default: 'Unassigned' }),
      f('stage', 'Deal stage', 'select', { options: DEAL_STAGES, default: 'Discussion' }),
      f('probability', 'Probability (%)', 'number', { min: 0, max: 100 }),
      f('lastContacted', 'Last contacted', 'date'), f('nextFollowUp', 'Next follow-up', 'date'),
      f('notes', 'Notes (internal)', 'textarea', { wide: true }),
    ],
  },
  clients: {
    label: 'Clients', singular: 'Client',
    search: ['code', 'businessName', 'contactPerson', 'phone', 'email', 'location'],
    fields: [
      f('businessName', 'Business name', 'text', { required: true }), f('contactPerson', 'Contact person'),
      f('phone', 'Phone', 'tel'), f('whatsapp', 'WhatsApp', 'tel'), f('email', 'Email', 'email'),
      f('location', 'Location'), f('website', 'Website', 'url'), f('projectType', 'Project type'),
      f('package', 'Package', 'select', { options: PACKAGES, default: 'Basic' }),
      f('finalPrice', 'Final project price (₹)', 'money'),
      f('assignedTo', 'Assigned developer', 'select', { options: ADMINS, default: 'Unassigned' }),
      f('projectStatus', 'Project status', 'select', { options: CLIENT_STATUS, default: 'Not Started' }),
      f('startDate', 'Start date', 'date'), f('expectedCompletion', 'Expected completion', 'date'),
      f('notes', 'Notes', 'textarea', { wide: true }),
    ],
  },
  projects: {
    label: 'Projects', singular: 'Project',
    search: ['code', 'name', 'githubUrl', 'liveUrl'],
    fields: [
      f('name', 'Project name', 'text', { required: true }), f('clientId', 'Client', 'ref', { ref: 'clients' }),
      f('package', 'Package', 'select', { options: PACKAGES, default: 'Basic' }), f('price', 'Price (₹)', 'money'),
      f('assignedTo', 'Assigned developer', 'select', { options: ADMINS, default: 'Unassigned' }),
      f('startDate', 'Start date', 'date'), f('deadline', 'Deadline', 'date'),
      f('stage', 'Current stage', 'select', { options: PROJECT_STAGES, default: 'Planning' }),
      f('deploymentStatus', 'Deployment', 'select', { options: DEPLOY_STATUS, default: 'Not deployed' }),
      f('handoverStatus', 'Handover', 'select', { options: HANDOVER_STATUS, default: 'Pending' }),
      f('githubUrl', 'GitHub repository', 'url'), f('liveUrl', 'Live website', 'url'),
      f('notes', 'Notes', 'textarea', { wide: true }),
    ],
  },
  payments: {
    label: 'Payments', singular: 'Payment plan',
    search: ['code', 'notes'],
    fields: [
      f('clientId', 'Client', 'ref', { ref: 'clients' }), f('projectId', 'Project', 'ref', { ref: 'projects' }),
      f('totalValue', 'Total project value (₹)', 'money', { required: true }),
      f('advancePaid', '30% advance paid', 'checkbox'), f('advanceDate', 'Advance date', 'date'),
      f('developmentPaid', '30% development payment paid', 'checkbox'), f('developmentDate', 'Development payment date', 'date'),
      f('finalPaid', '40% final payment paid', 'checkbox'), f('finalDate', 'Final payment date', 'date'),
      f('notes', 'Payment notes', 'textarea', { wide: true }),
    ],
  },
  tasks: {
    label: 'Tasks', singular: 'Task',
    search: ['code', 'title', 'notes'],
    fields: [
      f('title', 'Task', 'text', { required: true, wide: true }),
      f('assignedTo', 'Assigned to', 'select', { options: ADMINS, default: 'Unassigned' }),
      f('dueDate', 'Due date', 'date'), f('priority', 'Priority', 'select', { options: PRIORITY, default: 'Medium' }),
      f('status', 'Status', 'select', { options: TASK_STATUS, default: 'To Do' }),
      f('relatedType', 'Related to', 'select', { options: RELATED_TYPES, default: 'None' }),
      f('relatedId', 'Record', 'relref', { showIf: (v) => v.relatedType && v.relatedType !== 'None' }),
      f('notes', 'Notes', 'textarea', { wide: true }),
    ],
  },
  activities: {
    label: 'Activity', singular: 'Activity',
    search: ['summary', 'by', 'type'],
    fields: [
      f('type', 'Type', 'select', { options: ACTIVITY_TYPES, default: 'Note' }),
      f('date', 'Date', 'date'),
      f('summary', 'What happened', 'textarea', { required: true, wide: true }),
      f('leadId', 'Lead', 'ref', { ref: 'leads' }), f('clientId', 'Client', 'ref', { ref: 'clients' }),
      f('projectId', 'Project', 'ref', { ref: 'projects' }),
    ],
  },
};

export const TASK_TEMPLATES = ['Call lead', 'Send quotation', 'Prepare proposal', 'Follow up with client', 'Deploy website', 'Request content', 'Request images', 'Configure domain', 'Configure hosting', 'Final testing', 'Handover project'];
export const RELATED_ENTITY = { Lead: 'leads', Deal: 'deals', Client: 'clients', Project: 'projects' };
