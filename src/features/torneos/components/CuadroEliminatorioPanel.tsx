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
  const cuartos = partidosLlave.filter((p) => p.ronda === "CUARTOS");
  const semifinales = partidosLlave.filter((p) => p.ronda === "SEMIFINAL");
  const final = partidosLlave.find((p) => p.ronda === "FINAL");

  // Helper para formatear el marcador global de sets: "6-4 6-3"
  const renderMarcadorSets = (partido: LlavePartido) => {
    if (!partido.sets || partido.sets.length === 0) return null;
    return (
      <div className="flex gap-1 font-mono text-amber-400 font-bold text-xs">
        {partido.sets.map((s, idx) => (
          <span key={idx} className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800">
            {s.juegosPareja1}-{s.juegosPareja2}
          </span>
        ))}
      </div>
    );
  };

  if (partidosLlave.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm">
        <p className="font-semibold text-slate-400 mb-1">Cuadro principal no generado</p>
        <p className="text-xs text-slate-500">
          Completa los partidos de la fase de grupos para habilitar las llaves de eliminación directa.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-md">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <h3 className="font-bold text-amber-400 text-sm uppercase tracking-wide flex items-center gap-2">
          🏆 Cuadro Principal (Playoffs)
        </h3>
        <span className="text-xs text-slate-500">Eliminación Directa</span>
      </div>

      <div
        className={`grid gap-6 items-center ${
          cuartos.length > 0
            ? "grid-cols-1 md:grid-cols-3"
            : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {/* Columna Cuartos de Final (Si existen) */}
        {cuartos.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
              Cuartos de Final
            </h4>
            {cuartos.map((p) => (
              <TarjetaPartidoKey
                key={p.id}
                partido={p}
                onCargarResultado={onCargarResultado}
                renderMarcadorSets={renderMarcadorSets}
              />
            ))}
          </div>
        )}

        {/* Columna Semifinales */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
            Semifinales
          </h4>
          {semifinales.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-4">A definir</p>
          ) : (
            semifinales.map((p) => (
              <TarjetaPartidoKey
                key={p.id}
                partido={p}
                onCargarResultado={onCargarResultado}
                renderMarcadorSets={renderMarcadorSets}
              />
            ))
          )}
        </div>

        {/* Columna Gran Final */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider text-center flex items-center justify-center gap-1">
            <span>👑 Gran Final</span>
          </h4>
          {final ? (
            <div className="bg-slate-950 p-4 rounded-xl border-2 border-amber-500/40 space-y-3 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-bl uppercase">
                Título
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-sm">
                  <span
                    className={
                      final.ganadorParejaId === final.pareja1Id
                        ? "font-bold text-amber-400"
                        : "text-slate-200"
                    }
                  >
                    {final.nombrePareja1 || "Por definir"}
                  </span>
                </div>

                <div className="border-t border-slate-800/80 my-1" />

                <div className="flex justify-between items-center text-sm">
                  <span
                    className={
                      final.ganadorParejaId === final.pareja2Id
                        ? "font-bold text-amber-400"
                        : "text-slate-200"
                    }
                  >
                    {final.nombrePareja2 || "Por definir"}
                  </span>
                </div>
              </div>

              {final.estado === "FINALIZADO" && (
                <div className="pt-1 flex justify-center">{renderMarcadorSets(final)}</div>
              )}

              <button
                onClick={() => onCargarResultado(final)}
                className="w-full mt-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2 rounded-lg transition shadow-lg shadow-amber-600/20"
              >
                {final.estado === "FINALIZADO" ? "Editar Final" : "Cargar Resultado Final"}
              </button>
            </div>
          ) : (
            <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 border-dashed text-center text-xs text-slate-600">
              Esperando finalistas
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface TarjetaPartidoProps {
  partido: LlavePartido;
  onCargarResultado: (partido: LlavePartido) => void;
  renderMarcadorSets: (partido: LlavePartido) => React.ReactNode;
}

const TarjetaPartidoKey: React.FC<TarjetaPartidoProps> = ({
  partido,
  onCargarResultado,
  renderMarcadorSets,
}) => {
  const finalizado = partido.estado === "FINALIZADO";

  return (
    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 space-y-2 shadow-lg hover:border-slate-700 transition">
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span
            className={
              partido.ganadorParejaId === partido.pareja1Id
                ? "font-bold text-emerald-400"
                : "text-slate-200"
            }
          >
            {partido.nombrePareja1 || "A confirmar"}
          </span>
        </div>

        <div className="border-t border-slate-800/60 my-1" />

        <div className="flex justify-between items-center text-xs">
          <span
            className={
              partido.ganadorParejaId === partido.pareja2Id
                ? "font-bold text-emerald-400"
                : "text-slate-200"
            }
          >
            {partido.nombrePareja2 || "A confirmar"}
          </span>
        </div>
      </div>

      {finalizado && <div className="pt-1 flex justify-end">{renderMarcadorSets(partido)}</div>}

      <button
        onClick={() => onCargarResultado(partido)}
        className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] py-1.5 rounded-lg transition font-medium"
      >
        {finalizado ? "Editar Resultado" : "Cargar Resultado"}
      </button>
    </div>
  );
};