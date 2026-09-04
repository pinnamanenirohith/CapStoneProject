import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ModelRegistry from './pages/ModelRegistry';
import Deployments from './pages/Deployments';
import Inference from './pages/Inference';
import Monitoring from './pages/Monitoring';
import APIGateway from './pages/APIGateway';
import EdgeClient from './pages/EdgeClient';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"   element={<Dashboard />} />
            <Route path="models"      element={<ModelRegistry />} />
            <Route path="deployments" element={<Deployments />} />
            <Route path="inference"   element={<Inference />} />
            <Route path="monitoring"  element={<Monitoring />} />
            <Route path="gateway"     element={<APIGateway />} />
            <Route path="edge"        element={<EdgeClient />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
