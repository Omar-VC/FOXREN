import React from "react";

interface Competencia {
  id: number;
  nombre: string;
  estado: string;
  fecha: string;
}

export const CompetenciaCard: React.FC<{ competencia: Competencia }> = ({ competencia }) => {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-4 shadow-md">
      <h2 className="text-xl font-semibold text-[var(--color-primary-light)]">
        {competencia.nombre}
      </h2>
      <p className="text-gray-300">{competencia.estado}</p>
      <p className="text-gray-400 text-sm">{competencia.fecha}</p>
    </div>
  );
};
