// packages/webapp/src/App.tsx

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Importaciones de tus páginas y componentes
import CashierForm from './components/CashierForm';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { RewardsAdminPage } from './pages/RewardsAdminPage';
import { UsersAdminPage } from './pages/UsersAdminPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { ContingencyPage } from './pages/ContingencyPage';
import { EmpresasAdminPage } from './pages/EmpresasAdminPage';

// Tipo para el token JWT
interface UserToken {
  rol: string;
}

// Función para obtener el rol del token de forma segura
const getRoleFromToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  try {
    // Nos aseguramos de que el rol siempre esté en minúsculas
    return jwtDecode<UserToken>(token).rol.toLowerCase();
  } catch (error) {
    console.error("Token inválido o expirado:", error);
    localStorage.removeItem('authToken');
    return null;
  }
};

// Componente de protección de rutas
const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const userRole = getRoleFromToken();
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }
  // Comparamos el rol del usuario (ya en minúsculas) con la lista de roles permitidos
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
};

// Componente que maneja la lógica principal
const AppLogic = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(getRoleFromToken);

  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('authToken', token);
    const role = getRoleFromToken(); // Usamos nuestra función segura
    setUserRole(role);
    
    if (role === 'super_admin') {
      navigate('/super-admin/empresas');
    } else if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/cajero');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUserRole(null);
    navigate('/login');
  };

  return (
    <>
      {userRole && (
        <header className="bg-gray-100 p-4 flex justify-end items-center border-b">
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Cerrar sesión
          </button>
        </header>
      )}
      <main>
        <Routes>
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          
          {/* --- LA CORRECCIÓN DEFINITIVA ESTÁ AQUÍ --- */}
          {/* Ahora la lista de roles permitidos usa la palabra correcta en inglés 'cashier' */}
          <Route path="/cajero" element={<ProtectedRoute allowedRoles={['admin', 'cashier', 'supervisor']}><CashierForm /></ProtectedRoute>} />
          
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/rewards" element={<ProtectedRoute allowedRoles={['admin']}><RewardsAdminPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersAdminPage /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><ReportsPage /></ProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['admin']}><AuditLogsPage /></ProtectedRoute>} />
          <Route path="/admin/contingency" element={<ProtectedRoute allowedRoles={['admin']}><ContingencyPage /></ProtectedRoute>} />
          <Route path="/super-admin/empresas" element={<ProtectedRoute allowedRoles={['super_admin']}><EmpresasAdminPage /></ProtectedRoute>} />

          <Route path="/unauthorized" element={
            <div className="text-center mt-20">
              <h1 className="text-2xl font-bold">Acceso Denegado</h1>
              <p>No tienes los permisos necesarios para ver esta página.</p>
              <Link to="/" className="text-blue-600 hover:underline">Volver a la página principal</Link>
            </div>
          }/>

          <Route path="/" element={
            !userRole ? <Navigate to="/login" /> :
            userRole === 'super_admin' ? <Navigate to="/super-admin/empresas" /> :
            userRole === 'admin' ? <Navigate to="/admin" /> :
            <Navigate to="/cajero" />
          }/>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLogic />
    </BrowserRouter>
  );
}

export default App;