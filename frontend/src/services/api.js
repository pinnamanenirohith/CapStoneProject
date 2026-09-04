import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

// ── Mock data (used until real backend is wired) ─────────────────────────────

export const mockModels = [
  { id: 1, name: 'ResNet-50 Image Classifier', version: 'v2.1.0', framework: 'PyTorch', size: '98 MB', status: 'deployed', uploadedBy: 'admin', uploadedAt: '2026-08-28' },
  { id: 2, name: 'BERT Sentiment Analyzer',    version: 'v1.3.2', framework: 'TensorFlow', size: '440 MB', status: 'deployed', uploadedBy: 'admin', uploadedAt: '2026-08-25' },
  { id: 3, name: 'YOLOv8 Object Detector',     version: 'v1.0.0', framework: 'PyTorch', size: '22 MB', status: 'pending',  uploadedBy: 'admin', uploadedAt: '2026-09-01' },
  { id: 4, name: 'GPT-2 Text Generator',       version: 'v1.0.1', framework: 'HuggingFace', size: '548 MB', status: 'failed',   uploadedBy: 'admin', uploadedAt: '2026-08-30' },
  { id: 5, name: 'XGBoost Fraud Detector',     version: 'v3.0.0', framework: 'Scikit-learn', size: '12 MB', status: 'deployed', uploadedBy: 'admin', uploadedAt: '2026-08-20' },
];

export const mockDeployments = [
  { id: 1, model: 'ResNet-50 Image Classifier', version: 'v2.1.0', replicas: 3, status: 'running',  cpu: '42%', memory: '1.2 GB', requests: 4821, namespace: 'production', deployedAt: '2026-08-28' },
  { id: 2, model: 'BERT Sentiment Analyzer',    version: 'v1.3.2', replicas: 2, status: 'running',  cpu: '61%', memory: '3.8 GB', requests: 2340, namespace: 'production', deployedAt: '2026-08-25' },
  { id: 3, model: 'XGBoost Fraud Detector',     version: 'v3.0.0', replicas: 1, status: 'running',  cpu: '18%', memory: '0.4 GB', requests: 9103, namespace: 'production', deployedAt: '2026-08-20' },
  { id: 4, model: 'YOLOv8 Object Detector',     version: 'v1.0.0', replicas: 0, status: 'pending',  cpu: '0%',  memory: '0 GB',   requests: 0,    namespace: 'staging',    deployedAt: '2026-09-01' },
];

export const mockMetrics = {
  requestsPerMin: [120, 135, 118, 142, 160, 155, 170, 148, 162, 175, 190, 185],
  latencyMs:      [45,  48,  43,  52,  61,  55,  58,  47,  53,  49,  62,  57],
  cpuPercent:     [38,  41,  36,  45,  55,  51,  48,  43,  50,  46,  59,  54],
  memoryPercent:  [62,  63,  61,  64,  67,  66,  65,  64,  66,  65,  68,  67],
  labels: ['08:00','08:05','08:10','08:15','08:20','08:25','08:30','08:35','08:40','08:45','08:50','08:55'],
};

export const mockGatewayLogs = [
  { id: 1, time: '09:04:21', method: 'POST', path: '/api/v1/inference/resnet50', status: 200, latency: '43ms', ip: '192.168.1.10' },
  { id: 2, time: '09:04:19', method: 'GET',  path: '/api/v1/models',            status: 200, latency: '8ms',  ip: '192.168.1.22' },
  { id: 3, time: '09:04:18', method: 'POST', path: '/api/v1/inference/bert',    status: 200, latency: '121ms',ip: '192.168.1.10' },
  { id: 4, time: '09:04:15', method: 'POST', path: '/api/v1/inference/xgboost', status: 200, latency: '11ms', ip: '10.0.0.5' },
  { id: 5, time: '09:04:10', method: 'POST', path: '/api/v1/models/upload',     status: 201, latency: '340ms',ip: '192.168.1.1' },
  { id: 6, time: '09:04:05', method: 'DELETE',path:'/api/v1/models/4',          status: 403, latency: '6ms',  ip: '10.0.0.9' },
];

export default api;
