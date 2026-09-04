import { useState } from 'react';
import { Cpu, Wifi, Thermometer, Send, RefreshCw } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const tempData = [
  { t: '08:00', temp: 44 }, { t: '08:05', temp: 46 }, { t: '08:10', temp: 48 },
  { t: '08:15', temp: 47 }, { t: '08:20', temp: 49 }, { t: '08:25', temp: 51 },
  { t: '08:30', temp: 50 }, { t: '08:35', temp: 48 }, { t: '08:40', temp: 52 },
  { t: '08:45', temp: 51 }, { t: '08:50', temp: 49 }, { t: '08:55', temp: 50 },
];

const recentRequests = [
  { time: '08:55:12', model: 'ResNet-50 Classifier', latency: '218 ms', status: 'running' },
  { time: '08:52:44', model: 'XGBoost Fraud Detector', latency: '87 ms',  status: 'running' },
  { time: '08:49:30', model: 'BERT Sentiment Analyzer', latency: '342 ms', status: 'running' },
  { time: '08:43:09', model: 'ResNet-50 Classifier', latency: '231 ms', status: 'failed'  },
];

export default function EdgeClient() {
  const [testPayload, setTestPayload] = useState('{"text": "Testing edge inference from Raspberry Pi 4"}');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const runTest = async (e) => {
    e.preventDefault();
    setTesting(true);
    await new Promise(r => setTimeout(r, 800));
    setTestResult({
      status: 'success',
      response: { sentiment: 'POSITIVE', score: 0.988, latency_ms: 342, source: 'edge-client-rpi4' },
    });
    setTesting(false);
  };

  return (
    <div className="space-y-4">
      {/* Device info banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
            <Cpu size={24} className="text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Raspberry Pi 4 Model B</p>
            <p className="text-xs text-slate-400">4 GB RAM · Quad-core ARM Cortex-A72 · 64 GB SD</p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Badge status="online" />
          <span className="text-xs text-slate-400">IP: 192.168.1.55</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="CPU Temp"     value="50°C"   sub="safe range < 80°C"      icon={Thermometer} color="orange" />
        <StatCard label="CPU Load"     value="34%"    sub="4 cores active"          icon={Cpu}         color="blue" />
        <StatCard label="Network"      value="22 Mbps" sub="WiFi · RSSI -52 dBm"   icon={Wifi}        color="green" />
        <StatCard label="Uptime"       value="6d 14h"  sub="since last reboot"      icon={RefreshCw}   color="purple" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Temperature chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">CPU Temperature (°C)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={tempData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="t" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[40, 60]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent inference calls from edge */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">Recent Edge → Cloud Requests</p>
          <div className="space-y-2">
            {recentRequests.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm text-slate-700">{r.model}</p>
                  <p className="text-xs text-slate-400">{r.time} · {r.latency}</p>
                </div>
                <Badge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Send Test Request from Edge Client</h3>
        <form onSubmit={runTest} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Payload (simulates Raspberry Pi sending data)</label>
            <textarea value={testPayload} onChange={e => setTestPayload(e.target.value)} rows={3}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <button type="submit" disabled={testing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
            {testing ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
            {testing ? 'Sending...' : 'Send via Edge Client'}
          </button>
        </form>
        {testResult && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs font-medium text-green-700 mb-2">Response from cloud inference:</p>
            <pre className="text-xs text-slate-700 overflow-auto">
              {JSON.stringify(testResult.response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
