// packages/webapp/src/pages/AdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// --- Definimos los tipos que usaremos en esta página ---
type RewardType = 'standard' | 'secret';
interface Reward {
  id: string;
  name: string;
  type: RewardType;
  cost_in_points: number;
}
interface Strategy {
  id: string;
  key: string;
  name: string;
  is_active: boolean;
  settings: any;
}

// --- Instancia de API ---
const token = localStorage.getItem('authToken');
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { Authorization: `Bearer ${token}` },
});


// --- Componente para el Formulario de Configuración (conoce todas las estrategias) ---
const StrategySettingsForm = ({ strategy, rewards, onSave, onCancel }: { strategy: Strategy, rewards: Reward[], onSave: (settings: any) => void, onCancel: () => void }) => {
  const [settings, setSettings] = useState(strategy.settings || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + timezoneOffset);
    setSettings({ ...settings, [e.target.name]: adjustedDate.toISOString().split('T')[0] });
  };

  const handlePoolChange = (rewardId: string) => {
    const currentPool = settings.reward_pool_ids || [];
    const newPool = currentPool.includes(rewardId)
      ? currentPool.filter((id: string) => id !== rewardId)
      : [...currentPool, rewardId];
    setSettings({ ...settings, reward_pool_ids: newPool });
  };
  
  const handleAnnounce = async () => {
    if (!window.confirm(`¿Estás seguro de que quieres enviar un anuncio por WhatsApp a TODOS los clientes sobre esta campaña?`)) {
      return;
    }
    try {
      const response = await api.post('/admin/campaigns/announce');
      alert(response.data.message);
    } catch (error: any) {
      alert('Error al enviar el anuncio: ' + error.response?.data?.message);
    }
  };

  const renderFormFields = () => {
    switch (strategy.key) {
      case 'points':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="points_per_cop" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Puntos por cada $1 COP:</label>
              <input id="points_per_cop" type="number" value={settings.points_per_cop || ''} onChange={(e) => setSettings({ ...settings, points_per_cop: Number(e.target.value) })} className="text-gray-700 dark:text-gray-300" />
            </div>
            <hr className="dark:border-gray-600"/>
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">Configuración de Vencimiento</h4>
              <label className="flex items-center space-x-3  text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={settings.expiration_enabled || false} onChange={(e) => setSettings({ ...settings, expiration_enabled: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Activar vencimiento de puntos</span>
              </label>
              {settings.expiration_enabled && (
                <>
                  <div>
                    <label htmlFor="expiration_days" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Los puntos vencen después de (días):</label>
                    <input id="expiration_days" type="number" value={settings.expiration_days || ''} onChange={(e) => setSettings({ ...settings, expiration_days: Number(e.target.value) })} min="1" placeholder="Ej: 365" className="text-gray-700 dark:text-gray-300" />
                  </div>
                  <div>
                    <label htmlFor="notification_days_before" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notificar al cliente (días antes del vencimiento):</label>
                    <input id="notification_days_before" type="number" value={settings.notification_days_before || ''} onChange={(e) => setSettings({ ...settings, notification_days_before: Number(e.target.value) })} min="1" placeholder="Ej: 30" className="text-gray-700 dark:text-gray-300" />
                  </div>
                </>
              )}
            </div>
          </div>
        );
      case 'cashback':
        return (
          <div>
            <label className="text-gray-700 dark:text-gray-300">Porcentaje de Cashback (%):</label>
            <input type="number" value={settings.percentage || ''} onChange={(e) => setSettings({ ...settings, percentage: Number(e.target.value) })} style={{ width: '100%', padding: '8px', marginTop: '5px' }} min="0" max="100"  className="text-gray-700 dark:text-gray-300"/>
            <small className="text-gray-500 dark:text-gray-400">Ej: Si pones 5, un cliente recibe el 5% del valor de su compra.</small>
          </div>
        );
      case 'frequency':
        const standardRewardsForFrequency = rewards.filter(r => r.type === 'standard');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label className="text-gray-700 dark:text-gray-300">Compras requeridas para recompensa:</label>
              <input type="number" value={settings.required_purchases || ''} onChange={(e) => setSettings({ ...settings, required_purchases: Number(e.target.value) })} style={{ width: '100%', padding: '8px', marginTop: '5px' }} min="1" className="text-gray-700 dark:text-gray-300" />
              <small className="text-gray-500 dark:text-gray-400">Ej: Si pones 5, el cliente gana un premio en su 5ta compra.</small>
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-300">Recompensa a Otorgar:</label>
              <select value={settings.reward_to_unlock_id || ''} onChange={(e) => setSettings({ ...settings, reward_to_unlock_id: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px' }} className="text-gray-700 dark:text-gray-300">
                <option value="">-- Selecciona una recompensa --</option>
                {standardRewardsForFrequency.map(reward => (<option key={reward.id} value={reward.id}>{reward.name}</option>))}
              </select>
            </div>
          </div>
        );
      case 'campaigns':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label className="text-gray-700 dark:text-gray-300">Multiplicador de Puntos:</label>
              <input type="number" value={settings.multiplier || ''} onChange={(e) => setSettings({ ...settings, multiplier: Number(e.target.value) })} style={{ width: '100%', padding: '8px', marginTop: '5px' }} min="2" placeholder="Ej: 2 para doble, 3 para triple" className="text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-300">Fecha de Inicio:</label>
              <input type="date" name="start_date" value={settings.start_date || ''} onChange={handleDateChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} className="text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-300">Fecha de Fin:</label>
              <input type="date" name="end_date" value={settings.end_date || ''} onChange={handleDateChange} style={{ width: '100%', padding: '8px', marginTop: '5px' }} className="text-gray-700 dark:text-gray-300" />
            </div>
            {strategy.is_active && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ccc' }}>
                <h4 className="text-gray-700 dark:text-gray-300">Comunicar Campaña</h4>
                <p className="text-gray-700 dark:text-gray-300">Usa este botón para notificar a todos los clientes sobre esta campaña activa.</p>
                <button type="button" onClick={handleAnnounce} style={{background: 'blue', color: 'white'}} className="px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors">
                  Anunciar Campaña por WhatsApp
                </button>
              </div>
            )}
          </div>
        );
      case 'secret_rewards':
        const secretRewards = rewards.filter(r => r.type === 'secret');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label className="text-gray-700 dark:text-gray-300">Puntos necesarios para desbloquear:</label>
              <input type="number" value={settings.points_threshold || ''} onChange={(e) => setSettings({ ...settings, points_threshold: Number(e.target.value) })} style={{ width: '100%', padding: '8px', marginTop: '5px' }} min="1" className="text-gray-700 dark:text-gray-300"/>
              <small className="text-gray-700 dark:text-gray-300">Ej: Si pones 5000, el cliente debe acumular 5000 puntos en total.</small>
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-300">Recompensa a Desbloquear:</label>
              <select value={settings.reward_to_unlock_id || ''} onChange={(e) => setSettings({ ...settings, reward_to_unlock_id: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px' }} className="text-gray-700 dark:text-gray-300">
                <option value="" >-- Selecciona una recompensa secreta --</option>
                {secretRewards.map(reward => ( <option  key={reward.id} value={reward.id}>{reward.name}</option> ))}
              </select>
            </div>
          </div>
        );
      case 'random_prizes':
        const standardRewards = rewards.filter(r => r.type === 'standard');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label className="text-gray-700 dark:text-gray-300">Activar premio cada (N) compras:</label>
              <input type="number" value={settings.trigger_on_purchase_count || ''} onChange={(e) => setSettings({ ...settings, trigger_on_purchase_count: Number(e.target.value) })} style={{ width: '100%', padding: '8px', marginTop: '5px' }} min="1" className="text-gray-700 dark:text-gray-300"/>
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-300">Premios que entran en el sorteo (Piscina de Premios):</label>
              <div className="text-gray-700 dark:text-gray-300"  style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginTop: '5px' }}>
                {standardRewards.map(reward => (
                  <div key={reward.id}>
                    <label>
                      <input type="checkbox" checked={settings.reward_pool_ids?.includes(reward.id) || false} onChange={() => handlePoolChange(reward.id)} />
                      {reward.name} ({reward.cost_in_points} puntos)
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'birthday':
      return (
        <div className="text-gray-700 dark:text-gray-300" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label>Notificar al cliente (días antes del cumpleaños):</label>
            <input 
              type="number"
              value={settings.notification_days_before || ''}
              onChange={(e) => setSettings({ ...settings, notification_days_before: Number(e.target.value) })}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              min="0"
              placeholder="Ej: 7"
            />
          </div>
          <div>
            <label>Descuento a ofrecer (%):</label>
            <input
              type="number"
              value={settings.discount_percentage || ''}
              onChange={(e) => setSettings({ ...settings, discount_percentage: Number(e.target.value) })}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              min="1"
              placeholder="Ej: 15"
              className="text-gray-700 dark:text-gray-300"
            />
          </div>
          <div>
            <label>Plantilla del Mensaje de WhatsApp:</label>
            <textarea
              value={settings.message_template || ''}
              onChange={(e) => setSettings({ ...settings, message_template: e.target.value })}
              rows={4}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="Usa [NOMBRE] para personalizar el mensaje."
            />
            <small>Placeholder disponible: [NOMBRE]</small>
          </div>
        </div>
      );
      default:
        return <p>Esta estrategia no tiene configuraciones editables por ahora.</p>;
    }
  };

 return (
    <div className="rounded-xl border border-blue-300 dark:border-blue-600 p-6 bg-white dark:bg-gray-900 shadow-md">
      <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Configurando: {strategy.name}</h4>
      <form onSubmit={handleSubmit} className="space-y-6">
        {renderFormFields()}
        <div className="flex justify-end gap-4">
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow">Guardar</button>
          <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg">Cancelar</button>
        </div>
      </form>
    </div>
  );
};


// --- Componente Principal ---
export const AdminDashboard = () => {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [editingStrategyId, setEditingStrategyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.get('/admin/strategies'),
      api.get('/rewards')
    ]).then(([strategiesRes, rewardsRes]) => {
      setStrategies(strategiesRes.data);
      setRewards(rewardsRes.data);
    }).catch(err => {
      console.error(err);
      setError('No se pudieron cargar los datos iniciales.');
    }).finally(() => setIsLoading(false));
  }, []);

  const handleToggle = async (strategy: any) => {
    const newIsActive = !strategy.is_active;
    try {
      await api.patch(`/admin/strategies/${strategy.id}/toggle`, { is_active: newIsActive });
      setStrategies(prevStrategies => 
        prevStrategies.map(s => 
          s.id === strategy.id ? { ...s, is_active: newIsActive } : s
        )
      );
    } catch (err) {
      console.error(err);
      setError(`Error al actualizar la estrategia ${strategy.name}.`);
    }
  };
  
  const handleSaveSettings = async (strategyId: string, settings: any) => {
    try {
        await api.patch(`/admin/strategies/${strategyId}/settings`, { settings });
        setStrategies(prevStrategies => 
          prevStrategies.map(s => 
            s.id === strategyId ? { ...s, settings: { ...s.settings, ...settings } } : s
          )
        );
        setEditingStrategyId(null);
    } catch (err) {
        console.error(err);
        setError('Error al guardar la configuración.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <nav className="flex items-center space-x-6 border-b border-gray-200 pb-4 mb-6">
        <Link to="/admin" className="text-lg font-semibold text-blue-600">Estrategias</Link>
        <Link to="/admin/rewards" className="text-lg text-gray-500 hover:text-gray-800">Recompensas</Link>
        <Link to="/admin/users" className="text-lg text-gray-500 hover:text-gray-800">Usuarios</Link>
        <Link to="/admin/reports" className="text-lg text-gray-500 hover:text-gray-800">Reportes</Link>
        <Link to="/admin/audit-logs" className="text-lg text-gray-500 hover:text-gray-800">Logs</Link>
        <Link to="/admin/contingency" className="text-lg text-gray-500 hover:text-gray-800">Contingencia</Link>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">Panel de Estrategias</h1>
      
      {isLoading ? <p>Cargando estrategias...</p> : error && <p className="text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
      
      <ul className="space-y-4">
        {strategies.map((strategy) => (
          <li key={strategy.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg text-gray-800">{strategy.name}</span>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => editingStrategyId === strategy.id ? setEditingStrategyId(null) : setEditingStrategyId(strategy.id)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  {editingStrategyId === strategy.id ? 'Cerrar' : 'Configurar'}
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={strategy.is_active} onChange={() => handleToggle(strategy)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900">{strategy.is_active ? 'Activa' : 'Inactiva'}</span>
                </label>
              </div>
            </div>
            {editingStrategyId === strategy.id && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <StrategySettingsForm 
                  strategy={strategy} 
                  rewards={rewards}
                  onSave={(settings) => handleSaveSettings(strategy.id, settings)}
                  onCancel={() => setEditingStrategyId(null)}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};