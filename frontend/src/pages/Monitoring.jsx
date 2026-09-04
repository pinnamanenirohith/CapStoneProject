import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import StatCard from '../components/common/StatCard';
import { Activity, Cpu, HardDrive, Zap } from 'lucide-react';
import { mockMetrics } from '../services/api';

const data = mockMetrics.labels.map((label, i) => ({
  time: label,
  requests: mockMetrics.requestsPerMin[i],
  latency:  mockMetrics.latencyMs[i],
  cpu:      mockMetrics.cpuPercent[i],
  memory:   mockMetrics.memoryPercent[i],
}));

const podData = [
  { pod: 'resnet-0',  cpu: 42, mem: 68 },
  { pod: 'resnet-1',  cpu: 44, mem: 70 },
  { pod: 'resnet-2',  cpu: 39, mem: 66 },
  { pod: 'bert-0',    cpu: 61, mem: 82 },
  { pod: 'bert-1',    cpu: 58, mem: 79 },
  { pod: 'xgboost-0', cpu: 18, mem: 32 },
];

export default function Monitoring() {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Avg CPU"     value="40%"   sub="across all pods"   icon={Cpu}       color="blue" />
        <StatCard label="Avg Memory"  value="65%"   sub="3.2 GB / 8 GB"    icon={HardDrive} color="purple" />
        <StatCard label="Req/min"     value="162"   sub="current"           icon={Zap}       color="green" />
        <StatCard label="P95 Latency" value="82 ms" sub="inference latency" icon={Activity}  color="orange" />
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
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} />
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
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} />
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
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} />
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
