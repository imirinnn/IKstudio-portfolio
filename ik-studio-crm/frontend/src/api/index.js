import { httpApi } from './http';

/**
 * The real API is the default. The sample-data preview adapter is only loaded
 * when the site is built with VITE_CRM_DEMO=true (never set this in production).
 */
export async function getApi() {
  if (import.meta.env && import.meta.env.VITE_CRM_DEMO === 'true') {
    const { demoApi } = await import('./demo');
    return demoApi;
  }
  return httpApi;
}
