// The admin UI keeps its own copy of the CRM options; make sure the two never drift.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import * as api from '../src/crm/schema.js';

const uiPath = new URL('../../frontend/src/config/entities.js', import.meta.url);

test('frontend and backend CRM options match', { skip: !existsSync(uiPath) && 'CRM frontend not present' }, async () => {
  const ui = await import(uiPath.href);
  for (const k of ['ADMINS', 'PRIORITY', 'PACKAGES', 'LEAD_STATUS', 'LOST_REASONS', 'LEAD_SOURCES', 'DEAL_STAGES', 'CLIENT_STATUS', 'PROJECT_STAGES', 'DEPLOY_STATUS', 'HANDOVER_STATUS', 'FOLLOWUP_STATUS', 'TASK_STATUS', 'RELATED_TYPES', 'ACTIVITY_TYPES']) {
    assert.deepEqual(ui[k], api[k], k);
  }
  for (const [entity, spec] of Object.entries(api.entities)) {
    const uiKeys = ui.entities[entity].fields.map((f) => f.key).sort();
    const apiKeys = Object.keys(spec.fields).filter((k) => !['archived', 'clientId', 'leadId', 'dealId', 'completedAt', 'by', 'projectId'].includes(k) || uiKeys.includes(k)).sort();
    for (const k of uiKeys) assert.ok(k in spec.fields, `${entity}.${k} is in the UI but not the API`);
    for (const k of apiKeys) assert.ok(uiKeys.includes(k), `${entity}.${k} is in the API but not the UI form`);
  }
});
