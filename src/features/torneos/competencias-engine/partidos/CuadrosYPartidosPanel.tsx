import React from "react";
import type { Pareja } from "../../../../domain/pareja/pareja.types";

interface CuadrosYPartidosPanelProps {
  competenciaId: string;
  parejasAprobadas: Pareja[];
}

export const CuadrosYPartidosPanel: React.FC<CuadrosYPartidosPanelProps> = ({
  competenciaId,
  parejasAprobadas,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold">⚔️ Cuadros y Partidos</h3>
          <p className="text-xs text-slate-400">
            Gestión de zonas, fixture y eliminación directa.
          </p>
        </div>
        <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full font-semibold">
          Parejas Inscriptas: {parejasAprobadas.length}
        </span>
      </div>

      {!competenciaId ? (
        <div className="text-center text-slate-400 py-10 text-xs">
          Seleccioná una categoría para ver sus partidos.
        </div>
      ) : (
        <div className="text-center text-slate-400 py-12 border border-dashed border-slate-800 rounded-xl">
          <p className="text-sm font-medium text-slate-300">
            Módulo de partidos y cruces en desarrollo
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Acá se generarán las zonas, el fixture y los cuadros eliminatorios.
          </p>
        </div>
      )}
    </div>
  );
};