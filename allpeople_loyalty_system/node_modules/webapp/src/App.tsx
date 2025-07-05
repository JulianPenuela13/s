import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// ✅ Importaciones corregidas
import CashierForm from './components/CashierForm';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { RewardsAdminPage } from './pages/RewardsAdminPage';
import { UsersAdminPage } from './pages/UsersAdminPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { ContingencyPage } from './pages/ContingencyPage';

// ✅ Tipo para el token JWT
interface UserToken {
  role: string;
}

// ✅ Componente de protección de rutas
const ProtectedRoute = ({
  children,
  roleRequired,
}: {
  children: React.ReactNode;
  roleRequired?: string;
}) => {
  const token = localStorage.getItem('authToken');

  if (!token) return <Navigate to="/login" />;

  try {
    const decodedToken: UserToken = jwtDecode(token);
    if (roleRequired && decodedToken.role !== roleRequired) {
      return <Navigate to="/unauthorized" />;
    }
    return <>{children}</>;
  } catch (error) {
    console.error('Token inválido:', error);
    localStorage.removeItem('authToken');
    return <Navigate to="/login" />;
  }
};

// ✅ Componente principal
function App() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken: UserToken = jwtDecode(token);
        setUserRole(decodedToken.role);
      } catch (error) {
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('authToken', token);
    const decodedToken: UserToken = jwtDecode(token);
    setUserRole(decodedToken.role);
    window.location.href = '/';
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUserRole(null);
    window.location.href = '/login';
  };

  return (
    <BrowserRouter>
      {/* Header superior con botón de logout */}
      {userRole && (
        <div
          style={{
            background: '#f5f5f5',
            padding: '10px 20px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            borderBottom: '1px solid #ddd',
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              background: '#dc3545',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      )}

      {/* Rutas */}
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/cajero" element={<ProtectedRoute><CashierForm /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roleRequired="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/rewards" element={<ProtectedRoute roleRequired="admin"><RewardsAdminPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roleRequired="admin"><UsersAdminPage /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute roleRequired="admin"><ReportsPage /></ProtectedRoute>} />
        <Route path="/admin/audit-logs" element={<ProtectedRoute roleRequired="admin"><AuditLogsPage /></ProtectedRoute>} />
        <Route path="/admin/contingency" element={<ProtectedRoute roleRequired="admin"><ContingencyPage /></ProtectedRoute>} />

        {/* Página de acceso denegado */}
        <Route
          path="/unauthorized"
          element={
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
              <h1>Acceso Denegado</h1>
              <p>No tienes los permisos necesarios para ver esta página.</p>
              <Link to="/">Volver a la página principal</Link>
            </div>
          }
        />

        {/* Ruta por defecto */}
        <Route
          path="*"
          element={
            !userRole ? <Navigate to="/login" /> :
            userRole === 'admin' ? <Navigate to="/admin" /> :
            <Navigate to="/cajero" />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
