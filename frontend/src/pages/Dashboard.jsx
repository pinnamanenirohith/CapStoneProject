import { Database, Rocket, Zap, Activity, CheckCircle, Clock, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import { mockModels, mockDeployments, mockMetrics } from '../services/api';

const chartData = mockMetrics.labels.map((label, i) => ({
  time: label,
  requests: mockMetrics.requestsPerMin[i],
  latency: mockMetrics.latencyMs[i],
}));

const recentActivity = [
  { action: 'Model Deployed',   model: 'ResNet-50 v2.1.0', time: '2 min ago',  status: 'deployed' },
  { action: 'Inference Request',model: 'BERT v1.3.2',      time: '5 min ago',  status: 'running'  },
  { action: 'Upload Success',   model: 'YOLOv8 v1.0.0',   time: '30 min ago', status: 'pending'  },
  { action: 'Deployment Failed',model: 'GPT-2 v1.0.1',    time: '1 hr ago',   status: 'failed'   },
];

export default function Dashboard() {
  const deployedCount = mockModels.filter(m => m.status === 'deployed').length;
  const runningDeploys = mockDeployments.filter(d => d.status === 'running').length;
  const totalRequests  = mockDeployments.reduce((s, d) => s + d.requests, 0);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Models"       value={mockModels.length}  sub={`${deployedCount} deployed`}  icon={Database}  color="blue" />
        <StatCard label="Active Deployments" value={runningDeploys}     sub="in production namespace"      icon={Rocket}    color="green" />
        <StatCard label="Total Requests"     value={totalRequests.toLocaleString()} sub="since last deploy" icon={Zap}       color="purple" />
        <StatCard label="Avg Latency"        value="49 ms"              sub="p95: 82 ms"                   icon={Activity}  color="orange" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">Requests / minute</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">Latency (ms)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Line type="monotone" dataKey="latency" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Active deployments */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">Active Deployments</p>
          <div className="space-y-3">
            {mockDeployments.map(d => (
              <div key={d.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{d.model}</p>
                  <p className="text-xs text-slate-400">{d.replicas} replica{d.replicas !== 1 ? 's' : ''} · CPU {d.cpu}</p>
                </div>
                <Badge status={d.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">Recent Activity</p>
          <div className="space-y-3">
            {recentActivity.map((a, i) => {
              const Icon = a.status === 'deployed' || a.status === 'running' ? CheckCircle : a.status === 'pending' ? Clock : XCircle;
              const color = a.status === 'deployed' || a.status === 'running' ? 'text-green-500' : a.status === 'pending' ? 'text-yellow-500' : 'text-red-500';
              return (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                  <Icon size={16} className={`mt-0.5 flex-shrink-0 ${color}`} />
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
      </div>
    </div>
  );
}
