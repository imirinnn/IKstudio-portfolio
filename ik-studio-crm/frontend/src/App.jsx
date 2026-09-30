import { lazy, Suspense, useEffect, useState } from 'react';
import { getApi } from './api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CrmProvider } from './context/CrmContext';
import { ToastProvider } from './components/Toasts';
import Login from './pages/Login';
import Layout from './Layout';
import { usePath } from './shared/router';

const pages = {
  '': lazy(() => import('./pages/Dashboard')),
  leads: lazy(() => import('./pages/Leads')),
  'follow-ups': lazy(() => import('./pages/FollowUps')),
  deals: lazy(() => import('./pages/Deals')),
  clients: lazy(() => import('./pages/Clients')),
  projects: lazy(() => import('./pages/Projects')),
  payments: lazy(() => import('./pages/Payments')),
  earnings: lazy(() => import('./pages/Earnings')),
  tasks: lazy(() => import('./pages/Tasks')),
  activity: lazy(() => import('./pages/Activity')),
  settings: lazy(() => import('./pages/Settings')),
};

/** Private CRM. Nothing here renders until the server has confirmed the session. */
export default function App() {
  const [api, setApi] = useState(null);
  useEffect(() => {
    getApi().then(setApi);
  }, []);
  if (!api) return <Splash />;
  return (
    <ToastProvider>
      <AuthProvider api={api}>
        <Gate />
      </AuthProvider>
    </ToastProvider>
  );
}

function Gate() {
  const { status } = useAuth();
  if (status === 'checking') return <Splash />;
  if (status !== 'in') return <Login />;
  return (
    <CrmProvider>
      <Routes />
    </CrmProvider>
  );
}

function Routes() {
  const path = usePath();
  const section = path.replace(/^\//, '').split('/')[0];
  const Page = pages[section] || pages[''];
  return (
    <Layout section={pages[section] ? section : ''}>
      <Suspense fallback={<p className="p-6 text-steel">Loading…</p>}>
        <Page />
      </Suspense>
    </Layout>
  );
}

function Splash() {
  return <div className="grid min-h-screen place-items-center bg-paper text-[14px] text-steel" role="status">Loading…</div>;
}
