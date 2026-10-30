import { useState } from 'react';
import { Bell, RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';

const icons = {
  deployed: [CheckCircle, 'text-green-500'],
  running:  [CheckCircle, 'text-green-500'],
  pending:  [Clock, 'text-yellow-500'],
  failed:   [XCircle, 'text-red-500'],
};

export default function Header({ title }) {
  const { activity, markAllRead, refresh } = useData();
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const unread = activity.filter(a => !a.read).length;

  const handleRefresh = () => {
    setSpinning(true);
    refresh();
    setTimeout(() => setSpinning(false), 700);
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between relative z-30">
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
          Cluster Online
        </span>

        <div className="relative">
          <button onClick={() => setOpen(!open)} title="Notifications"
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
          {open && (
            <>
              <div className="fixed inset-0" onClick={() => setOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-700">Notifications</p>
                  <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-800">Mark all read</button>
                </div>
                <div className="max-h-80 overflow-auto">
                  {activity.map(a => {
                    const [Icon, color] = icons[a.status] || icons.pending;
                    return (
                      <div key={a.id} className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 ${a.read ? '' : 'bg-blue-50/50'}`}>
                        <Icon size={15} className={`mt-0.5 flex-shrink-0 ${color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{a.action}</p>
                          <p className="text-xs text-slate-400 truncate">{a.model}</p>
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">{a.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <button onClick={handleRefresh} title="Refresh data"
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <RefreshCw size={18} className={spinning ? 'animate-spin' : ''} />
        </button>
      </div>
    </header>
  );
}
