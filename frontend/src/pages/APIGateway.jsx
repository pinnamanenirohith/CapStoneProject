import { Shield, Key, Globe, Lock } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { mockGatewayLogs } from '../services/api';

const statusColor = {
  200: 'text-green-600 bg-green-50',
  201: 'text-blue-600 bg-blue-50',
  403: 'text-red-600 bg-red-50',
  404: 'text-orange-600 bg-orange-50',
  500: 'text-red-700 bg-red-50',
};

const methodColor = {
  GET:    'text-blue-600 bg-blue-50',
  POST:   'text-green-600 bg-green-50',
  PUT:    'text-yellow-600 bg-yellow-50',
  DELETE: 'text-red-600 bg-red-50',
};

const routes = [
  { path: '/api/v1/models',           method: 'GET/POST', auth: 'JWT', role: 'USER/ADMIN', rateLimit: '100/min' },
  { path: '/api/v1/models/:id',       method: 'DELETE',   auth: 'JWT', role: 'ADMIN',      rateLimit: '20/min'  },
  { path: '/api/v1/inference/:model', method: 'POST',     auth: 'JWT', role: 'USER/ADMIN', rateLimit: '200/min' },
  { path: '/api/v1/deployments',      method: 'GET/POST', auth: 'JWT', role: 'ADMIN',      rateLimit: '50/min'  },
  { path: '/api/v1/metrics',          method: 'GET',      auth: 'JWT', role: 'ADMIN',      rateLimit: '60/min'  },
  { path: '/api/v1/auth/login',       method: 'POST',     auth: 'None','role': 'Public',   rateLimit: '10/min'  },
];

export default function APIGateway() {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Requests Today"  value="16,264" sub="↑ 12% vs yesterday"    icon={Globe}  color="blue" />
        <StatCard label="Auth Success"    value="99.6%"  sub="JWT validation rate"   icon={Key}    color="green" />
        <StatCard label="403 Blocked"     value="38"     sub="unauthorized attempts" icon={Lock}   color="red" />
        <StatCard label="Avg Latency"     value="12 ms"  sub="gateway overhead"      icon={Shield} color="purple" />
      </div>

      {/* Route config */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">Registered Routes (Spring Boot Gateway)</p>
          <p className="text-xs text-slate-400 mt-0.5">JWT + RBAC enforcement — all requests pass through port 8080</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Path</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Method</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Auth</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Role Required</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Rate Limit</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-700">{r.path}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.method}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.auth === 'JWT' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {r.auth}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">{r.role}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{r.rateLimit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Live access log */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">Access Logs</p>
          <p className="text-xs text-slate-400 mt-0.5">Most recent requests through the gateway</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-medium text-slate-600">Time</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Method</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Path</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Latency</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Client IP</th>
              </tr>
            </thead>
            <tbody>
              {mockGatewayLogs.map(log => (
                <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors font-mono">
                  <td className="px-4 py-2.5 text-xs text-slate-400">{log.time}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${methodColor[log.method] || 'text-slate-600 bg-slate-100'}`}>
                      {log.method}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-700">{log.path}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColor[log.status] || 'text-slate-600 bg-slate-100'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{log.latency}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-400">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
