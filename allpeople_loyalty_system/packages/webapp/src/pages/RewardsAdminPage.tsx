// packages/webapp/src/pages/RewardsAdminPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

type RewardType = 'standard' | 'secret';
interface Reward {
  id: string;
  name: string;
  description: string;
  cost_in_points: number;
  stock: number;
  type: RewardType;
  is_active: boolean;
}
type RewardDto = Omit<Reward, 'id'>;

const token = localStorage.getItem('authToken');
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { Authorization: `Bearer ${token}` },
});

const RewardForm = ({ reward, onSave, onCancel }: { reward: Reward | null, onSave: (data: Partial<RewardDto>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState({
        name: reward?.name || '',
        description: reward?.description || '',
        cost_in_points: reward?.cost_in_points || 0,
        stock: reward?.stock ?? -1,
        type: reward?.type || 'standard',
        is_active: reward?.is_active ?? true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // Si es un checkbox, usamos 'checked' en lugar de 'value'
        const inputValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(inputValue) : inputValue,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">{reward ? 'Editar Recompensa' : 'Crear Nueva Recompensa'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre de la Recompensa</label>
            {/* CAMBIO: Añadida clase para resaltar el campo */}
            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
            {/* CAMBIO: Añadida clase para resaltar el campo */}
            <select id="type" name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="standard">Estándar (Visible para todos)</option>
              <option value="secret">Secreta (Se desbloquea por reglas)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cost_in_points" className="block text-sm font-medium text-gray-700">Costo en Puntos</label>
              {/* CAMBIO: Añadida clase para resaltar el campo */}
              <input id="cost_in_points" name="cost_in_points" type="number" value={formData.cost_in_points} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Existencias (-1 para ilimitado)</label>
              {/* CAMBIO: Añadida clase para resaltar el campo */}
              <input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
            {/* CAMBIO: Añadida clase para resaltar el campo */}
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div className="flex items-center">
            <input id="is_active" name="is_active" type="checkbox" checked={formData.is_active} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">Recompensa Activa</label>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Componente Principal de la Página ---
export const RewardsAdminPage = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  const fetchRewards = () => {
    setIsLoading(true);
    api.get('/rewards').then(response => {
      setRewards(response.data);
      setError('');
    }).catch(err => {
      console.error("Error fetching rewards:", err);
      setError('No se pudieron cargar las recompensas.');
    }).finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchRewards(); }, []);

  const handleOpenForm = (reward: Reward | null = null) => {
    setError('');
    setEditingReward(reward);
    setIsFormVisible(true);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
    setEditingReward(null);
  };

  const handleSaveReward = (rewardData: Partial<RewardDto>) => {
    
    const promise = editingReward
    ? api.patch(`/rewards/${editingReward.id}`, rewardData)
    : api.post('/rewards', rewardData);

  promise.then(() => {
    fetchRewards();
    handleCloseForm();
  }).catch(err => {
    console.error("Error saving reward:", err);
    setError(err.response?.data?.message || 'No se pudo guardar la recompensa.');
  });
};

  const handleDeleteReward = (rewardId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta recompensa?")) {
      const actor = { userId: "admin-id-placeholder", email: "admin@allpeople.com" };
      api.delete(`/rewards/${rewardId}`, { data: { actor } }).then(() => {
          fetchRewards();
      }).catch(err => {
          console.error("Error deleting reward:", err);
          setError('No se pudo eliminar la recompensa.');
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <nav className="flex items-center space-x-6 border-b border-gray-200 pb-4 mb-6">
        <Link to="/admin" className="text-lg text-gray-500 hover:text-gray-800">Estrategias</Link>
        <Link to="/admin/rewards" className="text-lg text-gray-500 hover:text-gray-800">Recompensas</Link>
        <Link to="/admin/users" className="text-lg text-gray-500 hover:text-gray-800">Usuarios</Link>
        <Link to="/admin/reports" className="text-lg font-semibold text-blue-600">Reportes</Link>
        <Link to="/admin/audit-logs" className="text-lg text-gray-500 hover:text-gray-800">Logs</Link>
        <Link to="/admin/contingency" className="text-lg text-gray-500 hover:text-gray-800">Contingencia</Link>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Recompensas</h1>
        <button className="px-4 py-2 font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700" onClick={() => handleOpenForm()}>
          + Crear Nueva Recompensa
        </button>
      </div>

      {isFormVisible && <RewardForm reward={editingReward} onSave={handleSaveReward} onCancel={handleCloseForm} />}

      <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 mt-6">
        {isLoading ? <p className="text-center p-4">Cargando recompensas...</p> : error ? <p className="text-red-500 p-4">{error}</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo (Puntos)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Existencias</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rewards.map(reward => (
                  <tr key={reward.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{reward.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{reward.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{reward.cost_in_points}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{reward.stock === -1 ? 'Ilimitado' : reward.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reward.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {reward.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => handleOpenForm(reward)} className="px-3 py-1 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Editar</button>
                      <button onClick={() => handleDeleteReward(reward.id)} className="px-3 py-1 text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};