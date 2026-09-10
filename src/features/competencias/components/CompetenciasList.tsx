// src/features/competencias/components/CompetenciasList.tsx

import React, { useEffect, useState } from "react";
import type { Competencia } from "../../../domain/competencia/competencia.types";
import { competenciasRepository } from "../../../infrastructure/repositories/competenciasRepository";

interface CompetenciasListProps {
  torneoId: string;
  onSeleccionarCompetencia?: (competencia: Competencia) => void;
}

export const CompetenciasList: React.FC<CompetenciasListProps> = ({
  torneoId,
  onSeleccionarCompetencia,
}) => {
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarCompetencias = async () => {
    try {
      setCargando(true);
      const data = await competenciasRepository.obtenerPorTorneoId(torneoId);
      setCompetencias(data);
    } catch (error) {
      console.error("Error al obtener competencias del torneo:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (torneoId) {
      cargarCompetencias();
    }
  }, [torneoId]);

  if (cargando) {
    return (
      <div className="p-4 text-center text-xs text-gray-400 animate-pulse">
        Cargando categorías activas...
      </div>
    );
  }

  if (competencias.length === 0) {
    return (
      <div className="p-4 border border-dashed border-gray-800 rounded text-center text-xs text-gray-500">
        No hay categorías/competencias registradas para este torneo.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {competencias.map((comp) => (
        <div
          key={comp.id}
          className="bg-gray-800/60 border border-gray-700/60 p-3.5 rounded flex justify-between items-center hover:border-[var(--color-primary)] transition"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-white">{comp.nombre}</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-gray-700 text-[var(--color-primary-light)]">
                {comp.genero}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Cupo: <strong className="text-gray-200">{comp.cupoMaximoParejas} parejas</strong> | Inscripción:{" "}
              <strong className="text-green-400">${comp.precioInscripcionBase}</strong>
            </p>
          </div>

          {onSeleccionarCompetencia && (
            <button
              type="button"
              onClick={() => onSeleccionarCompetencia(comp)}
              className="px-3 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-xs font-bold rounded transition"
            >
              Inscribirse
            </button>
          )}
        </div>
      ))}
    </div>
  );
};