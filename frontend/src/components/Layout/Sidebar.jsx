import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Database, Rocket, Zap,
  BarChart2, Shield, Cpu, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/models',       icon: Database,         label: 'Model Registry' },
  { to: '/deployments',  icon: Rocket,           label: 'Deployments' },
  { to: '/inference',    icon: Zap,              label: 'Inference' },
  { to: '/monitoring',   icon: BarChart2,         label: 'Monitoring' },
  { to: '/gateway',      icon: Shield,           label: 'API Gateway' },
  { to: '/edge',         icon: Cpu,              label: 'Edge Client' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm font-bold">AI</div>
          <div>
            <p className="text-sm font-semibold leading-tight">Cloud-Native AI</p>
            <p className="text-xs text-slate-400">Deployment Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-slate-400">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
