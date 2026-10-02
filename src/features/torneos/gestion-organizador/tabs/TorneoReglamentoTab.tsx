import React from "react";
import type { Torneo } from "../../../../domain/torneo/torneo.types";

interface TorneoReglamentoTabProps {
  torneo: Torneo;
}

export const TorneoReglamentoTab: React.FC<TorneoReglamentoTabProps> = ({ torneo }) => {
  return (
    <div className="space-y-4 text-xs">
      <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-2xl space-y-3">
        <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
          <span>📜</span> Reglamento y Formato del Torneo
        </h4>
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-slate-300">
          <p>El formato de juego se define según la cantidad de parejas inscriptas aprobadas en cada categoría.</p>
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-2xl space-y-3">
        <h4 className="font-bold text-slate-200">Datos de Transferencia y Cobro</h4>
        <div>
          <label className="text-slate-400 block mb-1">Alias de Pago para Inscriptos</label>
          <input
            type="text"
            disabled
            value={torneo.datosPago?.alias || "No configurado"}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-300 font-mono text-xs cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
};