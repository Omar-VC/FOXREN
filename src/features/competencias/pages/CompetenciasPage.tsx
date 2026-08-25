import React from "react";
import { CompetenciaCard } from "../components/CompetenciaCard";
import { FiltersPanel } from "../components/FiltersPanel";

export const CompetenciasPage: React.FC = () => {
  // Por ahora usamos mock data
  const competencias = [
    { id: 1, nombre: "Liga Neuquén", estado: "Inscripciones abiertas", fecha: "Septiembre 2026" },
    { id: 2, nombre: "Circuito Patagonia", estado: "En curso", fecha: "Agosto 2026" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Competencias</h1>

      {/* Panel de filtros */}
      <FiltersPanel />

      {/* Listado de competencias */}
      <div className="grid gap-4 mt-4">
        {competencias.map((comp) => (
          <CompetenciaCard key={comp.id} competencia={comp} />
        ))}
      </div>
    </div>
  );
};
