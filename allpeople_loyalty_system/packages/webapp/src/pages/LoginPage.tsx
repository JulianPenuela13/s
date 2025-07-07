// packages/webapp/src/pages/LoginPage.tsx

import React, { useState } from 'react';
import api from '../api/axiosConfig';



// Añadimos una nueva prop para comunicar el éxito al componente padre (App)
interface LoginPageProps {
  onLoginSuccess: (token: string) => void;
}

export const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  const [email, setEmail] = useState('admin@allpeople.com');
  const [password, setPassword] = useState('strongpassword');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;

      if (access_token) {
        // En lugar de recargar la página, llamamos a la función que nos pasó el padre
        onLoginSuccess(access_token);
      }
    } catch (err) {
      setError('Email o contraseña incorrectos.');
      console.error(err);
    }
  };

  // ... el resto del return del JSX queda exactamente igual ...
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión - All People</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};
