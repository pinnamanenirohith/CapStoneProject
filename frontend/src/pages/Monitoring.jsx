import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import StatCard from '../components/common/StatCard';
import { Activity, Cpu, HardDrive, Zap } from 'lucide-react';
import { useState } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Monitoring() {
  const { metrics, live, setLive, refresh, deployments } = useData();
  const [range, setRange] = useState(12);
  const data = metrics.slice(-range);
  const avg = (k) => Math.round(data.reduce((s, p) => s + p[k], 0) / data.length);
  const last = data[data.length - 1];
  const p95 = Math.max(...data.map(p => p.latency));
  const btn = 'text-sm font-medium px-3 py-2 rounded-lg border transition-colors';
  const podData = deployments.filter(d => d.status === 'running').flatMap(d =>
    Array.from({ length: Math.min(d.replicas, 3) }, (_, i) => ({
      pod: `${d.model.split(' ')[0].toLowerCase()}-${i}`,
      cpu: Math.min(95, parseInt(d.cpu) + i * 2),
      mem: Math.min(95, 30 + parseInt(d.cpu) + i),
    })));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select value={range} onChange={e => setRange(Number(e.target.value))}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
          <option value={6}>Last 6 points</option>
          <option value={12}>Last 12 points</option>
        </select>
        <button onClick={refresh} className={`${btn} flex items-center gap-1.5 bg-white border-slate-300 text-slate-700 hover:bg-slate-100`}>
          <RefreshCw size={14} /> Refresh now
        </button>
        <button onClick={() => setLive(!live)}
          className={`${btn} ${live ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-300 text-slate-600'}`}>
          Live updates: {live ? 'ON' : 'OFF'}
        </button>
        <a href="http://localhost:3000" target="_blank" rel="noreferrer"
          className={`${btn} ml-auto flex items-center gap-1.5 bg-white border-slate-300 text-slate-700 hover:bg-slate-100`}>
          <ExternalLink size={14} /> Open Grafana
        </a>
        <a href="http://localhost:9090" target="_blank" rel="noreferrer"
          className={`${btn} flex items-center gap-1.5 bg-white border-slate-300 text-slate-700 hover:bg-slate-100`}>
          <ExternalLink size={14} /> Open Prometheus
        </a>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Avg CPU"     value={`${avg('cpu')}%`} sub="across all pods"   icon={Cpu}       color="blue" />
        <StatCard label="Avg Memory"  value={`${avg('memory')}%`} sub="of node memory"    icon={HardDrive} color="purple" />
        <StatCard label="Req/min"     value={last.requests} sub="current"           icon={Zap}       color="green" />
        <StatCard label="P95 Latency" value={`${p95} ms`} sub="inference latency" icon={Activity}  color="orange" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">Requests per Minute</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" interval="preserveStartEnd" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Area type="monotone" dataKey="requests" stroke="#3b82f6" fill="url(#reqGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">Inference Latency (ms)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" interval="preserveStartEnd" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Line type="monotone" dataKey="latency" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">CPU & Memory Utilisation (%)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" interval="preserveStartEnd" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cpu"    stroke="#f59e0b" strokeWidth={2} dot={false} name="CPU %" />
              <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} dot={false} name="Memory %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">Per-Pod Resource Usage (%)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={podData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis dataKey="pod" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} width={72} />
              <Tooltip />
              <Legend />
              <Bar dataKey="cpu" fill="#3b82f6" name="CPU %" radius={[0, 3, 3, 0]} />
              <Bar dataKey="mem" fill="#8b5cf6" name="Mem %" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prometheus info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500">
        <p className="font-medium text-slate-600 mb-1">Prometheus Integration</p>
        <p>These metrics will stream live from <code className="bg-white px-1 rounded">http://prometheus:9090</code> via Grafana dashboards once the Kubernetes cluster is deployed. Current data is simulated for the dashboard demo.</p>
      </div>
    </div>
  );
}
