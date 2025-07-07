// packages/webapp/src/pages/ContingencyPage.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';


export const ContingencyPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ processed?: number, failed?: number, errors?: string[] } | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor, selecciona un archivo primero.');
      return;
    }

    setIsLoading(true);
    setError('');
    setUploadResult(null);

    // FormData es la forma estándar de enviar archivos a un API
    const formData = new FormData();
    formData.append('file', selectedFile); // 'file' debe coincidir con el FileInterceptor del backend

    try {
      const response = await api.post('/admin/contingency/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Hubo un error al subir o procesar el archivo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <nav className="flex items-center space-x-6 border-b border-gray-200 pb-4 mb-6">
        <Link to="/admin" className="text-lg text-gray-500 hover:text-gray-800">Estrategias</Link>
        <Link to="/admin/rewards" className="text-lg text-gray-500 hover:text-gray-800">Recompensas</Link>
        <Link to="/admin/users" className="text-lg text-gray-500 hover:text-gray-800">Usuarios</Link>
        <Link to="/admin/reports" className="text-lg text-gray-500 hover:text-gray-800">Reportes</Link>
        <Link to="/admin/audit-logs" className="text-lg text-gray-500 hover:text-gray-800">Logs</Link>
        <Link to="/admin/contingency" className="text-lg font-semibold text-blue-600">Contingencia</Link>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Carga de Compras por Contingencia</h1>
      <p className="text-sm text-gray-600 mb-6">
        Sube un archivo .csv con las compras registradas mientras el sistema estaba offline. El archivo debe tener las columnas: <code className="text-xs bg-gray-200 p-1 rounded">Cedula,Valor,NombreCompleto,Telefono,FechaNacimiento</code>.
      </p>
      
      <div className="card text-center p-6">
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button 
          onClick={handleUpload} 
          disabled={!selectedFile || isLoading} 
          className="mt-4 px-6 py-2 font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Procesando...' : 'Subir y Procesar Archivo'}
        </button>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-3 rounded-md my-4">{error}</p>}
      
      {uploadResult && (
        <div className="card mt-6">
          <h3 className="text-lg font-medium text-gray-900">Resultados de la Carga</h3>
          <p className="mt-2 text-sm text-green-600"><strong>Compras Procesadas con Éxito: {uploadResult.processed}</strong></p>
          <p className="mt-1 text-sm text-red-600"><strong>Filas con Errores: {uploadResult.failed}</strong></p>
          
          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-800">Detalle de Errores:</h4>
              <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-gray-600 bg-gray-50 p-3 rounded-md">
                {uploadResult.errors.map((e, index) => <li key={index}>{e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};