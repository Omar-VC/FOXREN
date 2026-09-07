// src/features/competencias/pages/CompetenciasPage.tsx

import React, { useEffect, useState } from 'react';
import { circuitosRepository } from '../../../infrastructure/repositories/circuitosRepository';
import type { Circuito } from '../../../domain/circuito/circuito.types';

export const CompetenciasPage: React.FC = () => {
  const [circuitos, setCircuitos] = useState<Circuito[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarCircuitos = async () => {
      try {
        const data = await circuitosRepository.obtenerCircuitos();
        setCircuitos(data);
      } catch (error) {
        console.error("Error al obtener los circuitos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarCircuitos();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 text-center text-gray-400">
        Cargando circuitos del ecosistema...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-primary-light)]">Circuitos Oficiales</h1>
        <p className="text-gray-400 text-sm mt-1">
          Temporadas y campeonatos activos en la plataforma FOXREN.
        </p>
      </div>

      {circuitos.length === 0 ? (
        <div className="bg-gray-900/60 border border-gray-800 rounded-[var(--border-radius)] p-8 text-center text-gray-400">
          No hay circuitos registrados actualmente.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {circuitos.map((circuito) => (
            <div
              key={circuito.id}
              className="bg-gray-900/60 border border-gray-800 hover:border-[var(--color-primary)] rounded-[var(--border-radius)] p-6 shadow-[var(--shadow-card)] transition duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 bg-[var(--color-primary)] text-white rounded">
                    Temporada {circuito.temporada}
                  </span>
                  <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">
                    {circuito.estado}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{circuito.nombre}</h2>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-800/80 flex justify-between items-center text-sm">
                <span className="text-gray-400">Ver torneos asociados</span>
                <span className="text-[var(--color-primary-light)] font-bold">→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};