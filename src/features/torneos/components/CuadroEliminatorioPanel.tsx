import React from "react";
import type { LlavePartido } from "../../../domain/llave/llave.types";

interface CuadroEliminatorioPanelProps {
  partidosLlave: LlavePartido[];
  onCargarResultado: (partido: LlavePartido) => void;
}

export const CuadroEliminatorioPanel: React.FC<CuadroEliminatorioPanelProps> = ({
  partidosLlave,
  onCargarResultado,
}) => {
  const semifinales = partidosLlave.filter((p) => p.ronda === "SEMIFINAL");
  const final = partidosLlave.find((p) => p.ronda === "FINAL");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
      <h3 className="font-bold text-amber-400 text-sm uppercase tracking-wide border-b border-slate-800 pb-3">
        🏆 Cuadro Principal (Playoffs)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Columna Semifinales */}
        <div className="space-y-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Semifinales</h4>
          {semifinales.map((p) => (
            <div key={p.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 shadow-lg">
              <div className="flex justify-between items-center text-xs">
                <span className={p.ganadorParejaId === p.pareja1Id ? "font-bold text-emerald-400" : "text-slate-200"}>
                  {p.nombrePareja1}
                </span>
                {p.estado === "FINALIZADO" && (
                  <span className="font-mono text-amber-400 font-bold">
                    {p.sets.map((s) => `${s.juegosPareja1}`).join("-")}
                  </span>
                )}
              </div>
              <div className="border-t border-slate-800/60 my-1" />
              <div className="flex justify-between items-center text-xs">
                <span className={p.ganadorParejaId === p.pareja2Id ? "font-bold text-emerald-400" : "text-slate-200"}>
                  {p.nombrePareja2}
                </span>
                {p.estado === "FINALIZADO" && (
                  <span className="font-mono text-amber-400 font-bold">
                    {p.sets.map((s) => `${s.juegosPareja2}`).join("-")}
                  </span>
                )}
              </div>
              <button
                onClick={() => onCargarResultado(p)}
                className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] py-1 rounded transition"
              >
                {p.estado === "FINALIZADO" ? "Editar Resultado" : "Cargar Resultado"}
              </button>
            </div>
          ))}
        </div>

        {/* Columna Final */}
        <div className="space-y-6">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider text-center"> Gran Final</h4>
          {final && (
            <div className="bg-slate-950 p-4 rounded-xl border-2 border-amber-500/30 space-y-3 shadow-2xl">
              <div className="flex justify-between items-center text-sm">
                <span className={final.ganadorParejaId === final.pareja1Id ? "font-bold text-amber-400" : "text-slate-200"}>
                  {final.nombrePareja1}
                </span>
                {final.estado === "FINALIZADO" && (
                  <span className="font-mono text-amber-400 font-bold">
                    {final.sets.map((s) => `${s.juegosPareja1}`).join("-")}
                  </span>
                )}
              </div>
              <div className="border-t border-slate-800 my-1" />
              <div className="flex justify-between items-center text-sm">
                <span className={final.ganadorParejaId === final.pareja2Id ? "font-bold text-amber-400" : "text-slate-200"}>
                  {final.nombrePareja2}
                </span>
                {final.estado === "FINALIZADO" && (
                  <span className="font-mono text-amber-400 font-bold">
                    {final.sets.map((s) => `${s.juegosPareja2}`).join("-")}
                  </span>
                )}
              </div>
              <button
                onClick={() => onCargarResultado(final)}
                className="w-full mt-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-1.5 rounded transition"
              >
                {final.estado === "FINALIZADO" ? "Editar Final" : "Cargar Resultado Final"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};