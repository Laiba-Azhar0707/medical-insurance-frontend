import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Layout from './Layout';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import ClaimHistory from './ClaimHistory';
import AdminPanel from './AdminPanel';

function ProtectedRoute({ token, children }) {
  if (!token) return <Navigate to="/" replace />;
  return children;
}

function AdminRoute({ token, user, children }) {
  if (!token) return <Navigate to="/" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            token ? (
              <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />
            ) : (
              <Login onLoginSuccess={(t, u) => { setToken(t); setUser(u); }} />
            )
          }
        />

        <Route
          element={
            <ProtectedRoute token={token}>
              <Layout user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard token={token} user={user} />} />
          <Route path="/history" element={<ClaimHistory token={token} />} />
        </Route>

        <Route
          path="/admin"
          element={
            <AdminRoute token={token} user={user}>
              <AdminLayout user={user} onLogout={handleLogout} />
            </AdminRoute>
          }
        >
          <Route index element={<AdminPanel token={token} />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;