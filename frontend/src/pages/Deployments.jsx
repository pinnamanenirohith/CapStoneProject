import { useState } from 'react';
import { Play, Square, RotateCcw, ChevronUp, ChevronDown, Trash2, Plus, Rocket, Activity, Cpu } from 'lucide-react';
import Badge from '../components/common/Badge';
import StatCard from '../components/common/StatCard';
import { useData } from '../context/DataContext';

export default function Deployments() {
  const {
    models, deployments, deployModel, undeployModel,
    scaleDeployment, toggleDeployment, restartDeployment,
  } = useData();
  const [showNew, setShowNew] = useState(false);
  const [modelId, setModelId] = useState('');
  const [namespace, setNamespace] = useState('production');

  const available = models.filter(m => !deployments.some(d => d.model === m.name && d.status === 'running'));
  const running = deployments.filter(d => d.status === 'running').length;
  const totalReplicas = deployments.reduce((s, d) => s + d.replicas, 0);
  const totalReqs = deployments.reduce((s, d) => s + d.requests, 0);
  const namespaces = [...new Set(deployments.map(d => d.namespace))];

  const handleDeploy = (e) => {
    e.preventDefault();
    const id = Number(modelId || available[0]?.id);
    if (!id) return;
    deployModel(id, namespace);
    setShowNew(false);
    setModelId('');
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Running"        value={running}       sub="deployments"       icon={Rocket}   color="green" />
        <StatCard label="Total Replicas" value={totalReplicas} sub="across all pods"   icon={Activity} color="blue" />
        <StatCard label="Total Requests" value={totalReqs.toLocaleString()} sub="all time" icon={Cpu}  color="purple" />
        <StatCard label="Namespaces"     value={namespaces.length} sub={namespaces.join(', ') || '—'} icon={Rocket} color="orange" />
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          <Plus size={16} />
          New Deployment
        </button>
      </div>

      {showNew && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-blue-800 mb-4">Deploy a registered model</h3>
          {available.length === 0 ? (
            <p className="text-sm text-slate-500">Every registered model is already running. Upload a new model in the Model Registry first.</p>
          ) : (
            <form onSubmit={handleDeploy} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Model</label>
                <select value={modelId || available[0].id} onChange={e => setModelId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {available.map(m => <option key={m.id} value={m.id}>{m.name} {m.version}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Namespace</label>
                <select value={namespace} onChange={e => setNamespace(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>production</option>
                  <option>staging</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Deploy</button>
                <button type="button" onClick={() => setShowNew(false)}
                  className="bg-white hover:bg-slate-100 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg border border-slate-300 transition-colors">Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}

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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Replicas:</span>
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  <button onClick={() => scaleDeployment(d.id, -1)} title="Scale down"
                    className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors">
                    <ChevronDown size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{d.replicas}</span>
                  <button onClick={() => scaleDeployment(d.id, 1)} title="Scale up"
                    className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors">
                    <ChevronUp size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => restartDeployment(d.id)}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Restart">
                  <RotateCcw size={15} />
                </button>
                <button onClick={() => toggleDeployment(d.id)}
                  className={`p-2 rounded-lg transition-colors ${d.status === 'running'
                    ? 'text-red-500 hover:bg-red-50'
                    : 'text-green-500 hover:bg-green-50'}`}
                  title={d.status === 'running' ? 'Stop' : 'Start'}>
                  {d.status === 'running' ? <Square size={15} /> : <Play size={15} />}
                </button>
                <button onClick={() => undeployModel(d.model)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remove deployment">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {deployments.length === 0 && (
          <p className="col-span-full text-center text-slate-400 py-10">No deployments yet. Click “New Deployment”.</p>
        )}
      </div>
    </div>
  );
}
