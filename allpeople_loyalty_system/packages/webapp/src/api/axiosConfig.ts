// src/api/axiosConfig.ts
import axios from 'axios';

const api = axios.create({
  // Usamos una variable de entorno para la URL de la API
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  //baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
});

// Usamos un "interceptor" para añadir el token a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;