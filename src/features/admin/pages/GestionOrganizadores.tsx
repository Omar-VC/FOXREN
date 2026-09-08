// src/features/admin/pages/GestionOrganizadores.tsx

import React, { useEffect, useState } from 'react';
import { organizadoresRepository } from '../../../infrastructure/repositories/organizadoresRepository';
import type { Organizador } from '../../../domain/organizador/organizador.types';

export const GestionOrganizadores: React.FC = () => {
  const [organizadores, setOrganizadores] = useState<Organizador[]>([]);
  const [loading, setLoading] = useState(true);

  const [dniCuit, setDniCuit] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [clubSede, setClubSede] = useState('');
  const [telefono, setTelefono] = useState('');
  const [localidad, setLocalidad] = useState('');

  useEffect(() => {
    cargarOrganizadores();
  }, []);

  const cargarOrganizadores = async () => {
    try {
      const data = await organizadoresRepository.obtenerTodos();
      setOrganizadores(data);
    } catch (err) {
      console.error("Error al cargar organizadores:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dniCuit || !nombreCompleto) {
      alert("Completá DNI/CUIT y Nombre.");
      return;
    }

    try {
      const existente = await organizadoresRepository.buscarPorDni(dniCuit);
      if (existente) {
        alert("Ya existe un organizador registrado con este DNI/CUIT.");
        return;
      }

      await organizadoresRepository.crearOrganizador({
        dniCuit,
        nombreCompleto,
        clubSede,
        telefono,
        localidad,
        estado: 'activo',
      });

      alert("Organizador registrado con éxito.");
      setDniCuit('');
      setNombreCompleto('');
      setClubSede('');
      setTelefono('');
      setLocalidad('');
      cargarOrganizadores();
    } catch (err) {
      console.error(err);
      alert("Error al guardar el organizador.");
    }
  };

  if (loading) return <p className="text-gray-400">Cargando lista de organizadores...</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[var(--color-primary-light)]">Padrón de Organizadores</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Alta */}
        <div className="bg-gray-900/60 p-5 rounded-[var(--border-radius)] border border-gray-800">
          <h2 className="text-lg font-bold mb-4">Registrar Nuevo Organizador</h2>
          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <div>
              <label className="block text-xs text-gray-400 mb-1">DNI / CUIT</label>
              <input
                type="text"
                required
                placeholder="Ej: 30123456"
                value={dniCuit}
                onChange={(e) => setDniCuit(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Nombre Completo / Razón Social</label>
              <input
                type="text"
                required
                placeholder="Ej: Marcos Pérez"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Club / Sede Principal</label>
              <input
                type="text"
                placeholder="Ej: Neuquén Pádel Club"
                value={clubSede}
                onChange={(e) => setClubSede(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Teléfono</label>
                <input
                  type="text"
                  placeholder="299..."
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Localidad</label>
                <input
                  type="text"
                  placeholder="Ej: Neuquén"
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[var(--color-primary)] font-bold rounded text-white hover:opacity-90 transition mt-2"
            >
              Guardar Organizador
            </button>
          </form>
        </div>

        {/* Lista de Organizadores */}
        <div className="lg:col-span-2 bg-gray-900/60 p-5 rounded-[var(--border-radius)] border border-gray-800">
          <h2 className="text-lg font-bold mb-4 text-[var(--color-primary-light)]">Organizadores Registrados</h2>
          {organizadores.length === 0 ? (
            <p className="text-sm text-gray-500">No hay organizadores dados de alta.</p>
          ) : (
            <ul className="space-y-3">
              {organizadores.map((org) => (
                <li
                  key={org.id}
                  className="p-4 bg-gray-900/80 border border-gray-800 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-2"
                >
                  <div>
                    <span className="font-bold text-white text-base block">{org.nombreCompleto}</span>
                    <span className="text-xs text-amber-400 font-mono">DNI/CUIT: {org.dniCuit}</span>
                    <span className="text-xs text-gray-400 block">
                      {org.clubSede} | {org.localidad} | Tel: {org.telefono}
                    </span>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-green-900/60 text-green-300 border border-green-700/50 rounded uppercase font-semibold">
                    {org.estado}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};