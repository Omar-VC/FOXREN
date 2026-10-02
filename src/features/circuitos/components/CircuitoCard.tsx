// src/features/circuitos/components/CircuitoCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import type { Circuito } from "../../../domain/circuito/circuito.types";
import type { Torneo } from "../../../domain/torneo/torneo.types";

interface CircuitoCardProps {
  circuito: Circuito;
  torneosDelCircuito: Torneo[];
}

export const CircuitoCard: React.FC<CircuitoCardProps> = ({ circuito, torneosDelCircuito }) => {
  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
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
};