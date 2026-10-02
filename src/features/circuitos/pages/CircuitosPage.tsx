// src/features/circuitos/pages/CircuitosPage.tsx
import React, { useEffect, useState } from "react";
import { circuitosRepository } from "../../../infrastructure/repositories/circuitosRepository";
import { torneosRepository } from "../../../infrastructure/repositories/torneosRepository";
import type { Circuito } from "../../../domain/circuito/circuito.types";
import type { Torneo } from "../../../domain/torneo/torneo.types";
import { Link } from "react-router-dom";

export const CircuitosPage: React.FC = () => {
  const [circuitos, setCircuitos] = useState<Circuito[]>([]);
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarCircuitosPublicos = async () => {
      try {
        setLoading(true);
        const [dataCircuitos, dataTorneos] = await Promise.all([
          circuitosRepository.obtenerCircuitos(),
          torneosRepository.obtenerTorneos()
        ]);
        setCircuitos(dataCircuitos);
        setTorneos(dataTorneos);
      } catch (err) {
        console.error("Error al cargar circuitos públicos:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarCircuitosPublicos();
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-gray-400">Cargando circuitos oficiales...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Circuitos Oficiales</h1>
        <p className="text-gray-400 text-sm mt-1">
          Listado de circuitos y competencias de la temporada actual.
        </p>
      </div>

      {circuitos.length === 0 ? (
        <div className="bg-gray-900/60 p-8 border border-gray-800 rounded-xl text-center text-gray-500">
          No hay circuitos activos en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {circuitos.map((circuito) => {
            const torneosDelCircuito = torneos.filter((t) => t.circuitoId === circuito.id);

            return (
              <div 
                key={circuito.id}
                className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold text-[var(--color-primary-light)] uppercase tracking-wider">
                        Temporada {circuito.temporada}
                      </span>
                      <h2 className="text-2xl font-black text-white mt-0.5">{circuito.nombre}</h2>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                      {circuito.estado}
                    </span>
                  </div>

                  <div className="space-y-2 mt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Torneos del Circuito ({torneosDelCircuito.length}):
                    </h3>

                    {torneosDelCircuito.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">Próximamente se asignarán torneos a este circuito.</p>
                    ) : (
                      <ul className="space-y-2">
                        {torneosDelCircuito.map((torneo) => (
                          <li 
                            key={torneo.id}
                            className="bg-gray-950/60 border border-gray-800/80 p-3 rounded-xl flex justify-between items-center text-xs"
                          >
                            <div>
                              <span className="font-bold text-gray-200 block">{torneo.nombre}</span>
                              <span className="text-gray-400 text-[11px]">Sede: {torneo.sede}</span>
                            </div>
                            <Link 
                              to={`/torneos/${torneo.id}`}
                              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-[11px] font-semibold rounded-lg transition"
                            >
                              Ver Torneo
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};