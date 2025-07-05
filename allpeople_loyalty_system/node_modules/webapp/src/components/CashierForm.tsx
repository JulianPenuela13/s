import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ClientSummary {
  id: string;
  document_id: string;
  full_name: string;
  total_points: number;
}

interface Reward {
  id: string;
  name: string;
  cost_in_points: number;
}

const token = localStorage.getItem('authToken');
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { Authorization: `Bearer ${token}` },
});

const CashierForm: React.FC = () => {
  const [viewMode, setViewMode] = useState<'search' | 'create'>('search');
  const [searchDocId, setSearchDocId] = useState('');
  const [clientSummary, setClientSummary] = useState<ClientSummary | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);

  const performSearch = async (docId: string) => {
    if (!docId) return;
    setMessage('');
    setIsError(false);
    try {
      const response = await api.get(`/clients/summary/${docId}`);
      setClientSummary(response.data);
      setViewMode('search');
    } catch {
      setIsError(true);
      setMessage(`Cliente con cédula ${docId} no encontrado.`);
      setClientSummary(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchDocId);
  };

  const handleRegisterPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientSummary) return;

    setMessage('');
    setIsError(false);
    try {
      await api.post('/purchases', {
        client_document_id: clientSummary.document_id,
        amount: Number(purchaseAmount),
      });
      setMessage('Compra registrada con éxito.');
      setPurchaseAmount('');
      await performSearch(clientSummary.document_id);
    } catch {
      setIsError(true);
      setMessage('Error al registrar la compra.');
    }
  };

  const handleClientCreated = (client: ClientSummary) => {
    performSearch(client.document_id);
  };

  const handleRedeem = async (reward: Reward) => {
    if (!clientSummary || !window.confirm(`¿Confirmas el canje de "${reward.name}"?`)) return;
    try {
      await api.post('/redemptions', {
        clientId: clientSummary.id,
        rewardId: reward.id,
      });
      setMessage(`¡Canje de "${reward.name}" exitoso!`);
      setIsRedeemModalOpen(false);
      await performSearch(clientSummary.document_id);
    } catch (error: any) {
      setIsError(true);
      const errorMessage = error.response?.data?.message || 'Error al procesar el canje.';
      setMessage(errorMessage);
      setIsRedeemModalOpen(false);
    }
  };

  const NewClientForm = ({
    onClientCreated,
    onCancel,
  }: {
    onClientCreated: (client: ClientSummary) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      document_id: '',
      full_name: '',
      phone_number: '',
      birth_date: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const response = await api.post('/clients', formData);
        onClientCreated(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al crear el cliente.');
      }
    };

    return (
      <div className="border p-4 rounded bg-gray-50">
        <h2 className="font-bold text-lg mb-3">Crear Nuevo Cliente</h2>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input name="document_id" value={formData.document_id} onChange={handleChange} placeholder="Cédula" required className="w-full border px-3 py-2 rounded" />
          <input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Nombre Completo" required className="w-full border px-3 py-2 rounded" />
          <input name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Celular (WhatsApp)" required className="w-full border px-3 py-2 rounded" />
          <input name="birth_date" value={formData.birth_date} onChange={handleChange} type="date" className="w-full border px-3 py-2 rounded" />
          {error && <p className="text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Guardar Cliente</button>
            <button type="button" onClick={onCancel} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancelar</button>
          </div>
        </form>
      </div>
    );
  };

  const RedeemModal = ({
    client,
    onClose,
    onRedeem,
  }: {
    client: ClientSummary;
    onClose: () => void;
    onRedeem: (reward: Reward) => void;
  }) => {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
      const fetchRewards = async () => {
        try {
          const res = await api.get('/rewards', { params: { context: 'redemption' } });
          const unlocked = await api.get(`/clients/${client.id}/unlocked-rewards`);
          const unlockedRewards = unlocked.data.map((r: any) => r.reward).filter(Boolean);
          const validRewards = res.data.filter((r: Reward) => r.cost_in_points <= client.total_points);
          setRewards([...unlockedRewards, ...validRewards]);
        } catch {
          setError('Error al cargar recompensas.');
        } finally {
          setLoading(false);
        }
      };
      fetchRewards();
    }, [client.id]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-md w-[90%] max-w-lg">
          <h2 className="font-bold text-xl mb-4">Canjear Recompensas</h2>
          {loading && <p>Cargando...</p>}
          {error && <p className="text-red-600">{error}</p>}
          <ul className="space-y-2">
            {rewards.map((r) => (
              <li key={r.id} className="flex justify-between items-center border-b pb-2">
                <span>{r.name} ({r.cost_in_points} pts)</span>
                <button onClick={() => onRedeem(r)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Canjear</button>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-right">
            <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cerrar</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-xl mx-auto mt-10 px-4 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-center">Estación del Cajero - All People</h1>

      {!clientSummary && (
        <div className="flex justify-center gap-4 mb-6">
          <button onClick={() => setViewMode('search')} disabled={viewMode === 'search'} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">Buscar Cliente</button>
          <button onClick={() => setViewMode('create')} disabled={viewMode === 'create'} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">+ Nuevo Cliente</button>
        </div>
      )}

      {viewMode === 'search' && !clientSummary && (
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <input type="text" value={searchDocId} onChange={(e) => setSearchDocId(e.target.value)} required placeholder="Cédula del Cliente" className="w-full px-4 py-2 border border-gray-300 rounded" />
          <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Buscar</button>
        </form>
      )}

      {viewMode === 'create' && !clientSummary && (
        <NewClientForm onClientCreated={handleClientCreated} onCancel={() => setViewMode('search')} />
      )}

      {clientSummary && (
        <>
          <div className="bg-green-50 border border-green-400 rounded-md p-4 mb-6">
            <p><strong>Nombre:</strong> {clientSummary.full_name}</p>
            <p><strong>Cédula:</strong> {clientSummary.document_id}</p>
            <p className="text-xl font-bold text-green-700">Puntos: {clientSummary.total_points}</p>
            <button onClick={() => { setClientSummary(null); setSearchDocId(''); }} className="mt-3 bg-gray-400 text-white px-3 py-2 rounded hover:bg-gray-500">Buscar Otro</button>
          </div>

          <form onSubmit={handleRegisterPurchase} className="space-y-3 mb-6">
            <input type="number" value={purchaseAmount} onChange={(e) => setPurchaseAmount(e.target.value)} placeholder="Valor de la compra" className="w-full px-4 py-2 border border-gray-300 rounded" required />
            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Registrar Compra</button>
          </form>

          <div className="text-center">
            <button onClick={() => setIsRedeemModalOpen(true)} className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700">Canjear Puntos</button>
          </div>
        </>
      )}

      {message && (
        <p className={`mt-4 font-medium ${isError ? 'text-red-600' : 'text-green-600'}`}>{message}</p>
      )}

      {isRedeemModalOpen && clientSummary && (
        <RedeemModal client={clientSummary} onClose={() => setIsRedeemModalOpen(false)} onRedeem={handleRedeem} />
      )}
    </div>
  );
};

export default CashierForm;