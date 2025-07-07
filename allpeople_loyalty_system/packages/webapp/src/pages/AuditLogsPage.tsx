// packages/webapp/src/pages/AuditLogsPage.tsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

// --- Tipos de Datos ---
interface AuditLog {
  id: number;
  created_at: string;
  action: string;
  details: any;
  user: {
    email: string;
  } | null;
}



// --- NUEVA FUNCIÓN "TRADUCTORA" ---
const formatAuditLog = (log: AuditLog): { action: string, details: string } => {
  const details = log.details || {};

  switch (log.action) {
    case 'USER_CREATE':
      return {
        action: '👤 Creó un Usuario',
        details: `Email: ${details.email}`,
      };
    case 'USER_UPDATE':
      return {
        action: '✏️ Actualizó un Usuario',
        // AHORA MOSTRAMOS EL EMAIL DEL USUARIO AFECTADO
        details: `Usuario afectado: ${details.updatedUserEmail}`,
      };
    case 'USER_DELETE':
      return {
        action: '🗑️ Eliminó un Usuario',
        details: `Email: ${details.email}`,
      };
    case 'STRATEGY_TOGGLE':
      // AHORA LA ACCIÓN ES ESPECÍFICA (ACTIVÓ O DESACTIVÓ)
      return {
        action: details.isActive ? '✅ Activó Estrategia' : ' Desactivó Estrategia',
        // Y MOSTRAMOS EL NOMBRE DE LA ESTRATEGIA
        details: `Estrategia: ${details.strategyName}`,
      };
    case 'STRATEGY_SETTINGS_UPDATE':
        return {
          action: '⚙️ Actualizó Configuración',
          details: `Estrategia: ${details.strategyName}`,
      };
    case 'REWARD_CREATE':
      return {
        action: '🎁 Creó Recompensa',
        details: `Nombre: ${details.rewardName}`,
      };
    case 'REWARD_UPDATE':
      return {
        action: '✏️ Actualizó Recompensa',
        details: `Nombre: ${details.rewardName}`,
      };
    case 'REWARD_DELETE':
      return {
        action: '🗑️ Eliminó Recompensa',
        details: `Nombre: ${details.rewardName}`,
      };
    default:
      return {
        action: log.action,
        details: JSON.stringify(details, null, 2),
      };
  }
};


// --- Componente Principal de la Página ---
export const AuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/audit-logs')
      .then(res => setLogs(res.data))
      .catch(err => {
        console.error("Error fetching audit logs:", err);
        setError('No se pudieron cargar los registros de auditoría.');
      })
      .finally(() => setIsLoading(false));
  }, []);
  
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <nav className="flex items-center space-x-6 border-b border-gray-200 pb-4 mb-6">
        <Link to="/admin" className="text-lg text-gray-500 hover:text-gray-800">Estrategias</Link>
        <Link to="/admin/rewards" className="text-lg text-gray-500 hover:text-gray-800">Recompensas</Link>
        <Link to="/admin/users" className="text-lg text-gray-500 hover:text-gray-800">Usuarios</Link>
        <Link to="/admin/reports" className="text-lg text-gray-500 hover:text-gray-800">Reportes</Link>
        <Link to="/admin/audit-logs" className="text-lg font-semibold text-blue-600">Logs de Auditoría</Link>
        <Link to="/admin/contingency" className="text-lg text-gray-500 hover:text-gray-800">Contingencia</Link>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">Registros de Auditoría del Sistema</h1>

      <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 mt-6">
        {isLoading ? <p className="text-center p-4">Cargando logs...</p> : error ? <p className="text-red-600 p-4">{error}</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map(log => {
                  const formattedLog = formatAuditLog(log);
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(log.created_at).toLocaleString('es-CO', {dateStyle: 'short', timeStyle: 'short'})}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{log.user?.email || 'Sistema'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{formattedLog.action}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formattedLog.details}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};