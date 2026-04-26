import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ParticipantDashboard from './pages/ParticipantDashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '44px', height: '44px', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? `/${user.role}` : "/login"} replace />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}`} replace /> : <Register />} />

      <Route element={<Layout />}>
        <Route path="/participant" element={
          <ProtectedRoute allowedRole="participant"><ParticipantDashboard /></ProtectedRoute>
        } />
        <Route path="/judge" element={
          <ProtectedRoute allowedRole="judge"><JudgeDashboard /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
