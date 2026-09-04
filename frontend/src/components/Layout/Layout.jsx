import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const titles = {
  '/dashboard':   'Dashboard',
  '/models':      'Model Registry',
  '/deployments': 'Deployments',
  '/inference':   'Inference Testing',
  '/monitoring':  'Monitoring & Metrics',
  '/gateway':     'API Gateway',
  '/edge':        'Edge Client (Raspberry Pi)',
};

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={titles[pathname] || 'Cloud-Native AI Platform'} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
