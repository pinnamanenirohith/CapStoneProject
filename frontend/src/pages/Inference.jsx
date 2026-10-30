import { useState } from 'react';
import { Send, Clock, CheckCircle, Trash2, Copy } from 'lucide-react';
import { useData } from '../context/DataContext';

const sampleInputs = {
  'ResNet-50 Image Classifier': '{"image_url": "https://example.com/cat.jpg"}',
  'BERT Sentiment Analyzer':    '{"text": "The cloud-native platform is working great!"}',
  'XGBoost Fraud Detector':     '{"amount": 2500.00, "merchant": "Online Store", "hour": 14}',
  'YOLOv8 Object Detector':     '{"image_url": "https://example.com/street.jpg", "confidence": 0.5}',
};

const mockResponses = {
  'ResNet-50 Image Classifier': { prediction: 'cat', confidence: 0.97, class_id: 281, latency_ms: 43 },
  'BERT Sentiment Analyzer':    { sentiment: 'POSITIVE', score: 0.992, label: 'LABEL_1', latency_ms: 118 },
  'XGBoost Fraud Detector':     { fraud: false, probability: 0.03, risk_level: 'LOW', latency_ms: 11 },
  'YOLOv8 Object Detector':     { objects: [{ label: 'person', confidence: 0.91, bbox: [120, 80, 340, 450] }], latency_ms: 67 },
};

export default function Inference() {
  const { deployments, recordInference, addLog, addActivity, toast } = useData();
  const deployed = deployments.filter(d => d.status === 'running');
  const [selectedName, setSelected] = useState(deployed[0]?.model || '');
  const selected = deployed.some(d => d.model === selectedName) ? selectedName : (deployed[0]?.model || '');
  const [input, setInput] = useState(sampleInputs[selected] || '{"input": [1, 2, 3]}');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleModelChange = (name) => {
    setSelected(name);
    setInput(sampleInputs[name] || '{"input": [1, 2, 3]}');
    setResult(null);
  };

  const handleInfer = async (e) => {
    e.preventDefault();
    const endpoint = `/api/v1/inference/${selected.toLowerCase().replace(/\s+/g, '-')}`;
    if (!selected) { toast('No running deployment - deploy a model first', 'error'); return; }
    try { JSON.parse(input); } catch {
      addLog('POST', endpoint, 400, '2ms');
      toast('Invalid JSON payload (400 Bad Request)', 'error');
      return;
    }
    setLoading(true);
    setResult(null);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    const response = mockResponses[selected] || { prediction: 'class_' + Math.floor(Math.random() * 10), confidence: +(0.8 + Math.random() * 0.19).toFixed(2), latency_ms: 30 + Math.floor(Math.random() * 60) };
    setResult(response);
    recordInference(selected);
    addLog('POST', endpoint, 200, `${response.latency_ms}ms`);
    addActivity('Inference Request', selected, 'running');
    setHistory(prev => [{ model: selected, input, response, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {/* Left: request panel */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Send Inference Request</h3>
          <form onSubmit={handleInfer} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Select Model (deployed)</label>
              <select value={selected} onChange={e => handleModelChange(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {deployed.length === 0 && <option value="">No running deployments</option>}
                {deployed.map(m => (
                  <option key={m.id} value={m.model}>{m.model} {m.version}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Input Payload (JSON)
                <button type="button" onClick={() => setInput(sampleInputs[selected] || '{}')}
                  className="ml-2 text-blue-500 hover:text-blue-700 font-normal">use sample</button>
              </label>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                rows={6}
                placeholder='{"key": "value"}'
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
              <span>Endpoint: <code className="text-slate-600">POST /api/v1/inference/{selected.toLowerCase().replace(/\s+/g, '-')}</code></span>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors">
              {loading ? <Clock size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? 'Running inference...' : 'Run Inference'}
            </button>
          </form>
        </div>

        {/* Response */}
        {result && (
          <div className="bg-white rounded-xl border border-green-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-sm font-semibold text-slate-700">Response</span>
              <button type="button" onClick={() => { navigator.clipboard?.writeText(JSON.stringify(result, null, 2)); toast('Copied to clipboard', 'info'); }}
                className="ml-2 text-slate-400 hover:text-slate-700" title="Copy"><Copy size={14} /></button>
              <span className="ml-auto text-xs text-slate-400">{result.latency_ms} ms</span>
            </div>
            <pre className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Right: history */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">Request History</h3>
          {history.length > 0 && (
            <button onClick={() => setHistory([])} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-600">
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No requests yet. Run an inference to see history.</p>
        ) : (
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="border border-slate-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-700">{h.model}</span>
                  <span className="text-xs text-slate-400">{h.time}</span>
                </div>
                <pre className="text-xs text-slate-500 bg-slate-50 rounded p-2 overflow-auto max-h-20">
                  {JSON.stringify(h.response, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
