// src/features/auth/pages/AuthPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../infrastructure/firebase/firebase';

export const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/foxren-admin');
    } catch (err: any) {
      setError('Credenciales inválidas o sin permisos de acceso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-[var(--overlay-dark)] backdrop-blur-md rounded-[var(--border-radius)] border border-gray-800 shadow-[var(--shadow-card)]">
        <h2 className="text-2xl font-bold text-center text-[var(--color-primary-light)] mb-6">
          Acceso Administrador
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-500/50 text-red-200 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900/80 border border-gray-700 rounded text-white focus:outline-none focus:border-[var(--color-primary)] transition"
              placeholder="admin@foxren.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900/80 border border-gray-700 rounded text-white focus:outline-none focus:border-[var(--color-primary)] transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white font-bold rounded-[var(--border-radius)] shadow-[var(--shadow-card)] transition duration-300"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};