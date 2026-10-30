import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockModels, mockDeployments, mockMetrics, mockGatewayLogs } from '../services/api';

const DataContext = createContext(null);

const clock = () => new Date().toLocaleTimeString('en-GB');
const today = () => new Date().toISOString().split('T')[0];
const jitter = (v, range, min = 0, max = Infinity) =>
  Math.min(max, Math.max(min, Math.round(v + (Math.random() - 0.5) * range)));

const seedMetrics = () => mockMetrics.labels.map((time, i) => ({
  time,
  requests: mockMetrics.requestsPerMin[i],
  latency:  mockMetrics.latencyMs[i],
  cpu:      mockMetrics.cpuPercent[i],
  memory:   mockMetrics.memoryPercent[i],
}));

const seedActivity = [
  { id: 1, action: 'Model Deployed',    model: 'ResNet-50 v2.1.0', status: 'deployed', time: '2 min ago',  read: false },
  { id: 2, action: 'Inference Request', model: 'BERT v1.3.2',      status: 'running',  time: '5 min ago',  read: false },
  { id: 3, action: 'Upload Success',    model: 'YOLOv8 v1.0.0',    status: 'pending',  time: '30 min ago', read: true },
  { id: 4, action: 'Deployment Failed', model: 'GPT-2 v1.0.1',     status: 'failed',   time: '1 hr ago',   read: true },
];

let nextId = 100;

export function DataProvider({ children }) {
  const [models, setModels] = useState(mockModels);
  const [deployments, setDeployments] = useState(mockDeployments);
  const [metrics, setMetrics] = useState(seedMetrics);
  const [logs, setLogs] = useState(mockGatewayLogs);
  const [activity, setActivity] = useState(seedActivity);
  const [toasts, setToasts] = useState([]);
  const [live, setLive] = useState(true);

  const toast = useCallback((message, type = 'success') => {
    const id = nextId++;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const dismissToast = (id) => setToasts(t => t.filter(x => x.id !== id));

  const addActivity = useCallback((action, model, status) => {
    setActivity(a => [{ id: nextId++, action, model, status, time: 'just now', read: false }, ...a].slice(0, 20));
  }, []);

  const markAllRead = () => setActivity(a => a.map(x => ({ ...x, read: true })));

  const addLog = useCallback((method, path, status, latency = '12ms', ip = '192.168.1.10') => {
    setLogs(l => [{ id: nextId++, time: clock(), method, path, status, latency, ip }, ...l].slice(0, 50));
  }, []);

  // ── Metrics ────────────────────────────────────────────────────────────────
  const tickMetrics = useCallback(() => {
    setMetrics(m => {
      const last = m[m.length - 1];
      return [...m.slice(1), {
        time: clock(),
        requests: jitter(last.requests, 30, 60, 260),
        latency:  jitter(last.latency, 14, 25, 120),
        cpu:      jitter(last.cpu, 12, 15, 95),
        memory:   jitter(last.memory, 4, 40, 90),
      }];
    });
  }, []);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(tickMetrics, 5000);
    return () => clearInterval(t);
  }, [live, tickMetrics]);

  const refresh = () => {
    tickMetrics();
    addLog('GET', '/api/v1/metrics', 200, '9ms');
    toast('Data refreshed');
  };

  // ── Models ─────────────────────────────────────────────────────────────────
  const addModel = ({ name, version, framework, size }) => {
    const model = {
      id: nextId++, name, version, framework,
      size: size || 'Unknown', status: 'pending',
      uploadedBy: 'admin', uploadedAt: today(),
    };
    setModels(m => [...m, model]);
    addActivity('Upload Success', `${name} ${version}`, 'pending');
    addLog('POST', '/api/v1/models/upload', 201, '340ms');
    toast(`Registered ${name} ${version}`);
  };

  const deleteModel = (id) => {
    const model = models.find(m => m.id === id);
    if (!model) return;
    setModels(m => m.filter(x => x.id !== id));
    setDeployments(d => d.filter(x => x.model !== model.name));
    addLog('DELETE', `/api/v1/models/${id}`, 200, '14ms');
    toast(`Deleted ${model.name}`, 'info');
  };

  const deployModel = (id, namespace = 'production') => {
    const model = models.find(m => m.id === id);
    if (!model) return;
    setModels(m => m.map(x => x.id === id ? { ...x, status: 'deployed' } : x));
    setDeployments(d => {
      const existing = d.find(x => x.model === model.name);
      if (existing) {
        return d.map(x => x.model === model.name
          ? { ...x, status: 'running', replicas: Math.max(1, x.replicas), namespace, version: model.version }
          : x);
      }
      return [...d, {
        id: nextId++, model: model.name, version: model.version, replicas: 1,
        status: 'running', cpu: '5%', memory: '0.3 GB', requests: 0,
        namespace, deployedAt: today(),
      }];
    });
    addActivity('Model Deployed', `${model.name} ${model.version}`, 'deployed');
    addLog('POST', '/api/v1/deployments', 201, '212ms');
    toast(`Deployed ${model.name} to ${namespace}`);
  };

  // Removes the deployment and sends the model back to the registry as "pending"
  const undeployModel = (modelName) => {
    setDeployments(d => d.filter(x => x.model !== modelName));
    setModels(m => m.map(x => x.name === modelName ? { ...x, status: 'pending' } : x));
    toast(`Removed deployment of ${modelName}`, 'info');
  };

  // ── Deployments ────────────────────────────────────────────────────────────
  const scaleDeployment = (id, delta) => {
    setDeployments(d => d.map(x => x.id === id ? { ...x, replicas: Math.max(0, x.replicas + delta) } : x));
  };

  const toggleDeployment = (id) => {
    const dep = deployments.find(x => x.id === id);
    if (!dep) return;
    const next = dep.status === 'running' ? 'stopped' : 'running';
    setDeployments(d => d.map(x => x.id === id ? { ...x, status: next, replicas: next === 'running' ? Math.max(1, x.replicas) : x.replicas } : x));
    toast(`${dep.model} ${next === 'running' ? 'started' : 'stopped'}`, next === 'running' ? 'success' : 'info');
  };

  const restartDeployment = (id) => {
    const dep = deployments.find(x => x.id === id);
    if (!dep) return;
    setDeployments(d => d.map(x => x.id === id ? { ...x, status: 'pending' } : x));
    toast(`Restarting ${dep.model}...`, 'info');
    setTimeout(() => {
      setDeployments(d => d.map(x => x.id === id ? { ...x, status: 'running' } : x));
      toast(`${dep.model} is running again`);
    }, 1800);
  };

  const recordInference = (modelName) => {
    setDeployments(d => d.map(x => x.model === modelName ? { ...x, requests: x.requests + 1 } : x));
  };

  return (
    <DataContext.Provider value={{
      models, deployments, metrics, logs, activity, toasts, live,
      setLive, toast, dismissToast, addActivity, markAllRead, addLog, refresh,
      addModel, deleteModel, deployModel, undeployModel,
      scaleDeployment, toggleDeployment, restartDeployment, recordInference,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
