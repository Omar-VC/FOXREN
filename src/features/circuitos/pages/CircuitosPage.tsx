// src/features/circuitos/pages/CircuitosPage.tsx
import React, { useEffect, useState } from "react";
import { circuitosRepository } from "../../../infrastructure/repositories/circuitosRepository";
import { torneosRepository } from "../../../infrastructure/repositories/torneosRepository";
import type { Circuito } from "../../../domain/circuito/circuito.types";
import type { Torneo } from "../../../domain/torneo/torneo.types";
import { CircuitoCard } from "../components/CircuitoCard";

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
              <CircuitoCard 
                key={circuito.id} 
                circuito={circuito} 
                torneosDelCircuito={torneosDelCircuito} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
};