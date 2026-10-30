import { useState } from 'react';
import { Upload, Search, Trash2, Eye, Rocket } from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', version: '', framework: 'PyTorch', size: '' };

const formatSize = (bytes) => bytes >= 1048576
  ? `${(bytes / 1048576).toFixed(1)} MB`
  : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export default function ModelRegistry() {
  const { models, deployments, addModel, deleteModel, deployModel, undeployModel, toast, addLog } = useData();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [viewId, setViewId] = useState(null);

  const viewing = models.find(m => m.id === viewId);
  const viewingDeployment = viewing && deployments.find(d => d.model === viewing.name);

  const filtered = models.filter(m =>
    (statusFilter === 'all' || m.status === statusFilter) &&
    (m.name.toLowerCase().includes(search.toLowerCase()) ||
     m.framework.toLowerCase().includes(search.toLowerCase()))
  );

  const handleUpload = (e) => {
    e.preventDefault();
    addModel(form);
    setShowUpload(false);
    setForm(emptyForm);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(f => ({ ...f, size: formatSize(file.size), name: f.name || file.name.replace(/\.[^.]+$/, '') }));
  };

  const handleDelete = (m) => {
    if (!isAdmin) {
      addLog('DELETE', `/api/v1/models/${m.id}`, 403, '6ms', '10.0.0.9');
      toast('403 Forbidden — only ADMIN can delete models', 'error');
      return;
    }
    if (window.confirm(`Delete "${m.name}"? This also removes its deployment.`)) {
      deleteModel(m.id);
      if (viewId === m.id) setViewId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search models..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All statuses</option>
          <option value="deployed">Deployed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Upload size={16} />
          Upload Model
        </button>
      </div>

      {/* Upload form */}
      {showUpload && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-blue-800 mb-4">Upload New Model</h3>
          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Model Name</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                placeholder="e.g. ResNet-50 Classifier"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Version</label>
              <input required value={form.version} onChange={e => setForm({...form, version: e.target.value})}
                placeholder="e.g. v1.0.0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Framework</label>
              <select value={form.framework} onChange={e => setForm({...form, framework: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {['PyTorch', 'TensorFlow', 'Scikit-learn', 'HuggingFace', 'ONNX'].map(f => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Model file (optional){form.size && <span className="ml-2 text-slate-400">· {form.size}</span>}
              </label>
              <input type="file" onChange={handleFile}
                className="block w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white file:text-blue-600 file:text-sm" />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Register Model
              </button>
              <button type="button" onClick={() => { setShowUpload(false); setForm(emptyForm); }}
                className="bg-white hover:bg-slate-100 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg border border-slate-300 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['#', 'Model Name', 'Version', 'Framework', 'Size', 'Status', 'Uploaded', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{m.name}</td>
                <td className="px-4 py-3 text-slate-600 font-mono text-xs">{m.version}</td>
                <td className="px-4 py-3 text-slate-600">{m.framework}</td>
                <td className="px-4 py-3 text-slate-600">{m.size}</td>
                <td className="px-4 py-3"><Badge status={m.status} /></td>
                <td className="px-4 py-3 text-slate-400">{m.uploadedAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewId(m.id)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View">
                      <Eye size={15} />
                    </button>
                    {m.status !== 'deployed' && (
                      <button onClick={() => deployModel(m.id)}
                        className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Deploy">
                        <Rocket size={15} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(m)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-slate-400">No models found</td></tr>
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
          {filtered.length} of {models.length} models
        </div>
      </div>

      {/* Detail modal */}
      {viewing && (
        <Modal title={viewing.name} onClose={() => setViewId(null)}>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {[
              ['Version', viewing.version],
              ['Framework', viewing.framework],
              ['Size', viewing.size],
              ['Uploaded by', viewing.uploadedBy],
              ['Uploaded on', viewing.uploadedAt],
              ['Replicas', viewingDeployment ? viewingDeployment.replicas : '—'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-slate-400">{k}</dt>
                <dd className="font-medium text-slate-800">{v}</dd>
              </div>
            ))}
            <div>
              <dt className="text-xs text-slate-400">Status</dt>
              <dd className="mt-0.5"><Badge status={viewing.status} /></dd>
            </div>
          </dl>
          <div className="flex gap-2 mt-6">
            {viewing.status === 'deployed' ? (
              <button onClick={() => undeployModel(viewing.name)}
                className="bg-white hover:bg-red-50 text-red-600 text-sm font-medium px-4 py-2 rounded-lg border border-red-200 transition-colors">
                Undeploy
              </button>
            ) : (
              <button onClick={() => deployModel(viewing.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Deploy to production
              </button>
            )}
            <button onClick={() => setViewId(null)}
              className="bg-white hover:bg-slate-100 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg border border-slate-300 transition-colors">
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
