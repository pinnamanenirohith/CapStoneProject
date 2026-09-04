import { useState } from 'react';
import { Play, Square, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
import Badge from '../components/common/Badge';
import StatCard from '../components/common/StatCard';
import { mockDeployments } from '../services/api';
import { Rocket, Activity, Cpu, MemoryStick } from 'lucide-react';

export default function Deployments() {
  const [deployments, setDeployments] = useState(mockDeployments);

  const scale = (id, delta) => {
    setDeployments(prev => prev.map(d =>
      d.id === id ? { ...d, replicas: Math.max(0, d.replicas + delta) } : d
    ));
  };

  const toggle = (id) => {
    setDeployments(prev => prev.map(d =>
      d.id === id ? { ...d, status: d.status === 'running' ? 'stopped' : 'running' } : d
    ));
  };

  const running = deployments.filter(d => d.status === 'running').length;
  const totalReplicas = deployments.reduce((s, d) => s + d.replicas, 0);
  const totalReqs = deployments.reduce((s, d) => s + d.requests, 0);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Running"        value={running}      sub="deployments"       icon={Rocket}   color="green" />
        <StatCard label="Total Replicas" value={totalReplicas} sub="across all pods"  icon={Activity} color="blue" />
        <StatCard label="Total Requests" value={totalReqs.toLocaleString()} sub="all time" icon={Cpu} color="purple" />
        <StatCard label="Namespaces"     value={2}            sub="production, staging" icon={Rocket} color="orange" />
      </div>

      {/* Deployment cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {deployments.map(d => (
          <div key={d.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">{d.model}</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{d.version} · {d.namespace}</p>
              </div>
              <Badge status={d.status} />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'CPU', value: d.cpu },
                { label: 'Memory', value: d.memory },
                { label: 'Requests', value: d.requests.toLocaleString() },
              ].map(m => (
                <div key={m.label} className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">{m.label}</p>
                  <p className="text-sm font-semibold text-slate-800">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Replica control */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Replicas:</span>
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  <button onClick={() => scale(d.id, -1)}
                    className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors">
                    <ChevronDown size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{d.replicas}</span>
                  <button onClick={() => scale(d.id, 1)}
                    className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors">
                    <ChevronUp size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Restart">
                  <RotateCcw size={15} />
                </button>
                <button onClick={() => toggle(d.id)}
                  className={`p-2 rounded-lg transition-colors ${d.status === 'running'
                    ? 'text-red-500 hover:bg-red-50'
                    : 'text-green-500 hover:bg-green-50'}`}
                  title={d.status === 'running' ? 'Stop' : 'Start'}>
                  {d.status === 'running' ? <Square size={15} /> : <Play size={15} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
