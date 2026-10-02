import React from "react";

interface CuadroEliminatorioPanelProps {
  competenciaId?: string;
}

export const CuadroEliminatorioPanel: React.FC<CuadroEliminatorioPanelProps> = ({
  competenciaId,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4">
      <h3 className="text-lg font-bold">🏆 Cuadro Eliminatorio</h3>
      <p className="text-xs text-slate-400">
        Visualización de llaves de eliminación directa.
      </p>
      <div className="text-center text-slate-500 py-10 border border-dashed border-slate-800 rounded-xl text-xs">
        Sin datos de llave generados para la competencia {competenciaId || ""}.
      </div>
    </div>
  );
};