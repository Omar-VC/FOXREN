// src/features/admin/pages/GestionCircuitos.tsx

import React, { useState, useEffect } from 'react';
import { circuitosRepository } from '../../../infrastructure/repositories/circuitosRepository';
import type { Circuito } from '../../../domain/circuito/circuito.types';

export const GestionCircuitos: React.FC = () => {
  const [circuitos, setCircuitos] = useState<Circuito[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario Circuito
  const [nombre, setNombre] = useState('');
  const [temporada, setTemporada] = useState('2026');

  // Formulario Llave
  const [circuitoSeleccionado, setCircuitoSeleccionado] = useState('');
  const [nombreOrg, setNombreOrg] = useState('');
  const [emailOrg, setEmailOrg] = useState('');
  const [llaveGenerada, setLlaveGenerada] = useState<string | null>(null);

  useEffect(() => {
    cargarCircuitos();
  }, []);

  const cargarCircuitos = async () => {
    setLoading(true);
    const data = await circuitosRepository.obtenerCircuitos();
    setCircuitos(data);
    if (data.length > 0) setCircuitoSeleccionado(data[0].id);
    setLoading(false);
  };

  const handleCrearCircuito = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return alert('Ingresá el nombre del circuito');

    try {
      await circuitosRepository.crearCircuito({
        nombre,
        temporada,
        estado: 'activo',
      });
      alert('¡Circuito creado con éxito!');
      setNombre('');
      cargarCircuitos();
    } catch (err) {
      console.error(err);
      alert('Error al crear circuito');
    }
  };

  const handleEmitirLlave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreOrg || !emailOrg || !circuitoSeleccionado) {
      return alert('Completá todos los campos de la llave');
    }

    // Generamos un código corto alfanumérico para la llave (ej: FOX-8X912)
    const codigoUnico = `FOX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    try {
      await circuitosRepository.emitirLlave({
        codigo: codigoUnico,
        circuitoId: circuitoSeleccionado,
        nombreOrganizador: nombreOrg,
        emailOrganizador: emailOrg,
      });
      setLlaveGenerada(codigoUnico);
      setNombreOrg('');
      setEmailOrg('');
    } catch (err) {
      console.error(err);
      alert('Error al emitir llave');
    }
  };

  if (loading) return <p className="text-white p-6">Cargando circuitos...</p>;

  return (
    <div className="space-y-8 text-white p-2">
      {/* CREAR CIRCUITO */}
      <section className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Crear Nuevo Circuito</h2>
        <form onSubmit={handleCrearCircuito} className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col flex-1 min-w-[200px]">
            <label className="text-xs text-gray-400 mb-1">Nombre del Circuito</label>
            <input
              type="text"
              placeholder="Ej: Circuito Patagónico 2026"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <div className="flex flex-col w-32">
            <label className="text-xs text-gray-400 mb-1">Temporada</label>
            <input
              type="text"
              value={temporada}
              onChange={(e) => setTemporada(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-500 font-medium px-4 py-2 rounded text-sm transition"
          >
            Crear Circuito
          </button>
        </form>
      </section>

      {/* EMITIR LLAVE DE ORGANIZADOR */}
      <section className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Emitir Llave para Organizador</h2>
        {circuitos.length === 0 ? (
          <p className="text-gray-400 text-sm">Primero debés crear un circuito para emitir llaves.</p>
        ) : (
          <form onSubmit={handleEmitirLlave} className="space-y-4 max-w-lg">
            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Seleccionar Circuito</label>
              <select
                value={circuitoSeleccionado}
                onChange={(e) => setCircuitoSeleccionado(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none"
              >
                {circuitos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.temporada})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Nombre del Organizador / Club</label>
              <input
                type="text"
                placeholder="Ej: Padel Club Neuquén"
                value={nombreOrg}
                onChange={(e) => setNombreOrg(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Email del Organizador</label>
              <input
                type="email"
                placeholder="organizador@email.com"
                value={emailOrg}
                onChange={(e) => setEmailOrg(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 font-medium px-4 py-2 rounded text-sm transition w-full"
            >
              Generar Llave de Acceso
            </button>
          </form>
        )}

        {llaveGenerada && (
          <div className="mt-4 p-4 bg-gray-900 border border-blue-500/50 rounded-lg">
            <p className="text-sm text-gray-300">Llave generada con éxito:</p>
            <p className="text-2xl font-mono font-bold text-yellow-400 mt-1">{llaveGenerada}</p>
            <p className="text-xs text-gray-400 mt-1">
              Compartí este código con el organizador para que active su panel.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};