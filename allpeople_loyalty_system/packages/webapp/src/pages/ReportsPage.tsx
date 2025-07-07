// packages/webapp/src/pages/ReportsPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../api/axiosConfig';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatCard = ({ title, value }: { title: string; value: number | string }) => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col justify-center items-center">
        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{value}</dd>
    </div>
);

const ReportTable = ({ title, data }: { title: string, data: any[] }) => {
    if (!data || data.length === 0) return null;
    const headers = Object.keys(data[0] || {});
    return (
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5">
            <h3 className="text-lg font-medium leading-6 text-gray-900 p-4 border-b border-gray-200">{title}</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {headers.map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                {headers.map(header => (
                                    <td key={header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row[header]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ReportsPage = () => {
    const [stats, setStats] = useState<any>({});
    const [reportTables, setReportTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // --- LA CORRECCIÓN DEFINITIVA ESTÁ AQUÍ ---
    // Usamos el token como una dependencia del useEffect.
    // Cada vez que el token cambie (un nuevo login), este efecto se ejecutará de nuevo.
    const token = localStorage.getItem('authToken');

    useEffect(() => {
      const fetchReportData = () => {
        setLoading(true);
        // Reseteamos los datos para evitar mostrar los antiguos mientras cargan los nuevos
        setStats({});
        setReportTables([]);
        setError('');

        Promise.all([
            api.get('/admin/reports/dashboard-stats'),
            api.get('/admin/reports/dynamic-tables')
        ]).then(([statsRes, tablesRes]) => {
            setStats(statsRes.data);
            setReportTables(tablesRes.data);
        }).catch(err => {
            console.error("Error fetching report data:", err);
            setError('No se pudieron cargar los datos de los reportes.');
        }).finally(() => {
            setLoading(false);
        });
      };
      
      // Solo intentamos cargar los datos si hay un token
      if (token) {
        fetchReportData();
      } else {
          setLoading(false); // Si no hay token, no hay nada que cargar
      }
      
    }, [token]);

    

    const topRewardsTable = reportTables.find(table => table.title === 'Top Recompensas (por Canjes)');
    const chartData = {
        labels: topRewardsTable?.data.map((r: any) => r.Recompensa) || [],
        datasets: [{
            label: '# de Canjes',
            data: topRewardsTable?.data.map((r: any) => r['Total Canjes']) || [],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
        }],
    };
    
    if (loading) {
        return <div className="p-8 text-center">Cargando informes...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600 bg-red-50 rounded-md">{error}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <nav className="flex items-center space-x-6 border-b border-gray-200 pb-4 mb-6">
              <Link to="/admin" className="text-lg text-gray-500 hover:text-gray-800">Estrategias</Link>
              <Link to="/admin/rewards" className="text-lg text-gray-500 hover:text-gray-800">Recompensas</Link>
              <Link to="/admin/users" className="text-lg text-gray-500 hover:text-gray-800">Usuarios</Link>
              <Link to="/admin/reports" className="text-lg font-semibold text-blue-600">Informes</Link>
              <Link to="/admin/audit-logs" className="text-lg text-gray-500 hover:text-gray-800">Registros</Link>
              <Link to="/admin/contingency" className="text-lg text-gray-500 hover:text-gray-800">Contingencia</Link>
            </nav>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">Informes de Lealtad</h1>

           

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                {stats.totalClients !== undefined && <StatCard title="Clientes Totales" value={stats.totalClients} />}
                {stats.totalPurchases !== undefined && <StatCard title="Compras de Lealtad" value={stats.totalPurchases} />}
                {stats.totalRedemptions !== undefined && <StatCard title="Total de Canjes" value={stats.totalRedemptions} />}
                {stats.totalPointsEarned !== undefined && <StatCard title="Puntos Ganados" value={stats.totalPointsEarned.toLocaleString('es-CO')} />}
                {stats.totalPointsRedeemed !== undefined && <StatCard title="Puntos Canjeados" value={stats.totalPointsRedeemed.toLocaleString('es-CO')} />}
                {stats.totalPointsExpired > 0 && <StatCard title="Puntos Vencidos" value={stats.totalPointsExpired.toLocaleString('es-CO')} />}
                {stats.totalCampaignPoints > 0 && <StatCard title="Puntos por Campañas" value={stats.totalCampaignPoints.toLocaleString('es-CO')} />}
                {stats.totalCashbackEarned > 0 && <StatCard title="Cashback Generado" value={stats.totalCashbackEarned.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} />}
                {stats.rewardsFromFrequency > 0 && <StatCard title="Premios por Frecuencia" value={stats.rewardsFromFrequency} />}
                {stats.rewardsFromSecret > 0 && <StatCard title="Recompensas Secretas" value={stats.rewardsFromSecret} />}
                {stats.rewardsFromRandom > 0 && <StatCard title="Premios por Sorteo" value={stats.rewardsFromRandom} />}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {reportTables.map(table => (
                    <ReportTable key={table.title} title={table.title} data={table.data} />
                ))}
            </div>

            {topRewardsTable && topRewardsTable.data.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 mt-6 p-4">
                    <h3 className="text-lg font-medium text-center text-gray-800 mb-4">Gráfico de Recompensas Más Populares</h3>
                    <div className="h-80">
                        <Bar options={{ responsive: true, maintainAspectRatio: false }} data={chartData} />
                    </div>
                </div>
            )}
        </div>
    );
};