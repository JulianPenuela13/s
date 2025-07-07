// packages/webapp/src/pages/EmpresasAdminPage.tsx

import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig'; // <-- 1. IMPORTAMOS NUESTRA INSTANCIA SEGURA DE API

// --- Tipos de Datos ---
interface Empresa {
  id: number;
  nombre_empresa: string;
  plan_suscripcion: string;
  estado_suscripcion: 'activa' | 'suspendida';
  twilio_phone_number: string | null;
  wpp_session_name: string | null; // Añadido para consistencia
  fecha_creacion: string;
}

// --- Formulario para Crear/Editar Empresa ---
const EmpresaForm = ({ onSave, onCancel }: { onSave: (data: any) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    plan_suscripcion: 'basico',
    whatsapp_provider: 'none',
    twilio_phone_number: '',
    wpp_session_name: '',
    admin_full_name: '',
    admin_email: '',
    admin_password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 m-4 overflow-y-auto max-h-[90vh]">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Registrar Nueva Empresa</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-medium text-gray-800 px-2">Datos de la Empresa</legend>
            <div>
              <label htmlFor="nombre_empresa" className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
              <input id="nombre_empresa" name="nombre_empresa" type="text" value={formData.nombre_empresa} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="plan_suscripcion" className="block text-sm font-medium text-gray-700">Plan</label>
              <select id="plan_suscripcion" name="plan_suscripcion" value={formData.plan_suscripcion} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="basico">Básico</option>
                <option value="pro">Pro</option>
                <option value="premium">Premium</option>
              </select>
            </div>
             <div>
                <label htmlFor="whatsapp_provider" className="block text-sm font-medium text-gray-700">Proveedor de WhatsApp</label>
                <select id="whatsapp_provider" name="whatsapp_provider" value={formData.whatsapp_provider} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="none">Ninguno (Desactivado)</option>
                  <option value="twilio">Twilio (API Oficial - De Pago)</option>
                  <option value="wppconnect">WPPConnect (WhatsApp Personal - Gratis)</option>
                </select>
              </div>

              {formData.whatsapp_provider === 'twilio' && (
                <div>
                  <label htmlFor="twilio_phone_number" className="block text-sm font-medium text-gray-700">Número de Twilio (+código país)</label>
                  <input id="twilio_phone_number" name="twilio_phone_number" type="text" value={formData.twilio_phone_number} onChange={handleChange} placeholder="Ej: 573001234567" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
              )}
              
              {formData.whatsapp_provider === 'wppconnect' && (
                <div>
                  <label htmlFor="wpp_session_name" className="block text-sm font-medium text-gray-700">Nombre de la Sesión WPPConnect</label>
                  <input id="wpp_session_name" name="wpp_session_name" type="text" value={formData.wpp_session_name} onChange={handleChange} placeholder="Ej: empresa_tienda_a" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
              )}
          </fieldset>
          
          <fieldset className="border p-4 rounded-md">
             <legend className="text-lg font-medium text-gray-800 px-2">Usuario Administrador Inicial</legend>
            <div>
              <label htmlFor="admin_full_name" className="block text-sm font-medium text-gray-700">Nombre Completo del Admin</label>
              <input id="admin_full_name" name="admin_full_name" type="text" value={formData.admin_full_name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="admin_email" className="block text-sm font-medium text-gray-700">Email del Admin</label>
              <input id="admin_email" name="admin_email" type="email" value={formData.admin_email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
             <div>
              <label htmlFor="admin_password" className="block text-sm font-medium text-gray-700">Contraseña Temporal</label>
              <input id="admin_password" name="admin_password" type="password" value={formData.admin_password} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
          </fieldset>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Guardar Empresa y Admin</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EmpresasAdminPage = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  const fetchEmpresas = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/super-admin/empresas');
      setEmpresas(response.data);
    } catch (err) {
      setError('No se pudieron cargar las empresas. ¿Tienes permisos de Super Admin?');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);
  
  const handleSaveEmpresa = async (data: any) => {
    setIsLoading(true);
    try {
      const empresaResponse = await api.post('/super-admin/empresas', {
        nombre_empresa: data.nombre_empresa,
        plan_suscripcion: data.plan_suscripcion,
        whatsapp_provider: data.whatsapp_provider,
        twilio_phone_number: data.twilio_phone_number || null,
        wpp_session_name: data.wpp_session_name || null,
      });
      const nuevaEmpresaId = empresaResponse.data.id;

      await api.post(`/super-admin/empresas/${nuevaEmpresaId}/crear-admin`, {
        full_name: data.admin_full_name,
        email: data.admin_email,
        password: data.admin_password,
      });

      alert('¡Empresa y administrador creados con éxito!');
      setIsFormVisible(false);
      fetchEmpresas();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la empresa.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleEstado = async (empresa: Empresa) => {
    const action = empresa.estado_suscripcion === 'activa' ? 'suspender' : 'reactivar';
    if (!window.confirm(`¿Estás seguro de que quieres ${action} a la empresa "${empresa.nombre_empresa}"?`)) return;
    
    setIsLoading(true);
    try {
        await api.patch(`/super-admin/empresas/${empresa.id}/${action}`);
        fetchEmpresas();
    } catch (err: any) {
        setError(err.response?.data?.message || `Error al ${action} la empresa.`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleDelete = async (empresaId: number) => {
    if (!window.confirm("ADVERTENCIA: Esta acción eliminará la empresa y TODOS sus datos de forma permanente. ¿Estás seguro?")) return;
    
    setIsLoading(true);
    try {
        await api.delete(`/super-admin/empresas/${empresaId}`);
        fetchEmpresas();
    } catch (err: any) {
        setError(err.response?.data?.message || 'Error al eliminar la empresa.');
    } finally {
        setIsLoading(false);
    }
  };

  if (isLoading && !isFormVisible) return <div className="p-8 text-center">Cargando empresas...</div>;
  if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-md">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {isFormVisible && <EmpresaForm onSave={handleSaveEmpresa} onCancel={() => setIsFormVisible(false)} />}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Panel de Super-Admin - Empresas</h1>
        <button 
          onClick={() => setIsFormVisible(true)}
          className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          + Registrar Nueva Empresa
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {empresas.map((empresa) => (
                <tr key={empresa.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{empresa.nombre_empresa}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 uppercase">{empresa.plan_suscripcion}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${empresa.estado_suscripcion === 'activa' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {empresa.estado_suscripcion}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    <button onClick={() => handleToggleEstado(empresa)} className="text-yellow-600 hover:text-yellow-900">
                      {empresa.estado_suscripcion === 'activa' ? 'Suspender' : 'Reactivar'}
                    </button>
                    <button onClick={() => handleDelete(empresa.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};