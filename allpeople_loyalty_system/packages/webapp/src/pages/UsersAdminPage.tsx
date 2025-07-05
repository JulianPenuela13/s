// packages/webapp/src/pages/UsersAdminPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

type UserRole = 'admin' | 'supervisor' | 'cashier';
interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
}
type UserDto = Omit<User, 'id'> & { password?: string };

const token = localStorage.getItem('authToken');
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { Authorization: `Bearer ${token}` },
});

const UserForm = ({ user, onSave, onCancel }: { user: User | null, onSave: (data: Partial<UserDto>) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    role: user?.role || 'cashier',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSend: Partial<UserDto> = { ...formData };
    if (user && !formData.password) {
      delete dataToSend.password;
    }
    onSave(dataToSend);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            {/* CAMBIO: Clases para resaltar el campo */}
            <input id="full_name" name="full_name" type="text" value={formData.full_name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            {/* CAMBIO: Clases para resaltar el campo */}
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required disabled={!!user} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100" />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rol</label>
            {/* CAMBIO: Clases para resaltar el campo */}
            <select id="role" name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="cashier">Cajero</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
            {/* CAMBIO: Clases para resaltar el campo */}
            <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder={user ? 'Dejar en blanco para no cambiar' : 'Mínimo 8 caracteres'} required={!user} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              {user ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const UsersAdminPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = () => {
    setIsLoading(true);
    api.get('/users').then(response => {
      setUsers(response.data);
    }).catch(err => {
      console.error("Error fetching users:", err);
      setError('No se pudieron cargar los usuarios.');
    }).finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpenForm = (user: User | null = null) => {
    setEditingUser(user);
    setIsFormVisible(true);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
    setEditingUser(null);
  };

  const handleSaveUser = (userData: Partial<UserDto>) => {
    const promise = editingUser
      ? api.patch(`/users/${editingUser.id}`, userData)
      : api.post('/users', userData);
    promise.then(() => {
      fetchUsers();
      handleCloseForm();
    }).catch(err => {
      console.error("Error saving user:", err);
      setError('No se pudo guardar el usuario.');
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      api.delete(`/users/${userId}`).then(() => {
        fetchUsers();
      }).catch(err => {
        console.error("Error deleting user:", err);
        setError('No se pudo eliminar el usuario.');
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <nav className="flex items-center space-x-6 border-b border-gray-200 pb-4 mb-6">
        <Link to="/admin" className="text-lg text-gray-500 hover:text-gray-800">Estrategias</Link>
        <Link to="/admin/rewards" className="text-lg text-gray-500 hover:text-gray-800">Recompensas</Link>
        <Link to="/admin/users" className="text-lg font-semibold text-blue-600">Usuarios</Link>
        <Link to="/admin/reports" className="text-lg text-gray-500 hover:text-gray-800">Reportes</Link>
        <Link to="/admin/audit-logs" className="text-lg text-gray-500 hover:text-gray-800">Logs</Link>
        <Link to="/admin/contingency" className="text-lg text-gray-500 hover:text-gray-800">Contingencia</Link>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Usuarios</h1>
        <button className="px-4 py-2 font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700" onClick={() => handleOpenForm()}>
          + Crear Nuevo Usuario
        </button>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-3 rounded-md my-4">{error}</p>}
      {isFormVisible && <UserForm user={editingUser} onSave={handleSaveUser} onCancel={handleCloseForm} />}

      <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 mt-6">
        {isLoading ? <p className="text-center p-4">Cargando usuarios...</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => handleOpenForm(user)} className="px-3 py-1 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Editar</button>
                      <button onClick={() => handleDeleteUser(user.id)} className="px-3 py-1 text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700">Eliminar</button>
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