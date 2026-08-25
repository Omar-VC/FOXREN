import React from "react";

export const FiltersPanel: React.FC = () => {
  return (
    <div className="bg-[rgba(255,255,255,0.05)] p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-lg font-bold text-[var(--color-primary-light)] mb-2">
        Filtros
      </h2>
      <p className="text-gray-400 text-sm">
        Aquí van los filtros (estado, torneo, circuito).
      </p>
    </div>
  );
};
