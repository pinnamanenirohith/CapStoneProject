import { useState } from 'react';
import { Upload, Search, Trash2, Eye } from 'lucide-react';
import Badge from '../components/common/Badge';
import { mockModels } from '../services/api';

export default function ModelRegistry() {
  const [models, setModels] = useState(mockModels);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ name: '', version: '', framework: 'PyTorch' });

  const filtered = models.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.framework.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = (e) => {
    e.preventDefault();
    const newModel = {
      id: models.length + 1,
      ...form,
      size: 'Unknown',
      status: 'pending',
      uploadedBy: 'admin',
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    setModels([...models, newModel]);
    setShowUpload(false);
    setForm({ name: '', version: '', framework: 'PyTorch' });
  };

  const handleDelete = (id) => {
    setModels(models.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search models..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Version</label>
              <input required value={form.version} onChange={e => setForm({...form, version: e.target.value})}
                placeholder="e.g. v1.0.0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Framework</label>
              <select value={form.framework} onChange={e => setForm({...form, framework: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {['PyTorch', 'TensorFlow', 'Scikit-learn', 'HuggingFace', 'ONNX'].map(f => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3 flex gap-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Register Model
              </button>
              <button type="button" onClick={() => setShowUpload(false)}
                className="bg-white hover:bg-slate-100 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg border border-slate-300 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-medium text-slate-600">#</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Model Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Version</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Framework</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Size</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Uploaded</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-400">{m.id}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{m.name}</td>
                <td className="px-4 py-3 text-slate-600 font-mono text-xs">{m.version}</td>
                <td className="px-4 py-3 text-slate-600">{m.framework}</td>
                <td className="px-4 py-3 text-slate-600">{m.size}</td>
                <td className="px-4 py-3"><Badge status={m.status} /></td>
                <td className="px-4 py-3 text-slate-400">{m.uploadedAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => handleDelete(m.id)}
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
    </div>
  );
}
