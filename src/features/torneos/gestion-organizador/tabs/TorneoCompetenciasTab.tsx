import React, { useState } from "react";
import { CompetenciaForm } from "../competencias/CompetenciaForm";
import type { Competencia } from "../../../../domain/competencia/competencia.types";
import type { Pareja } from "../../../../domain/pareja/pareja.types";

interface TorneoCompetenciasTabProps {
  torneoId: string;
  competencias: Competencia[];
  parejas: Pareja[];
  onCambiarEstadoCompetencia?: (
    competenciaId: string,
    nuevoEstado: any,
  ) => Promise<void>;
}

export const TorneoCompetenciasTab: React.FC<TorneoCompetenciasTabProps> = ({
  torneoId,
  competencias,
  parejas,
  onCambiarEstadoCompetencia,
}) => {
  const [modoCrearCompetencia, setModoCrearCompetencia] = useState(false);
  const [categoriaExpandidaId, setCategoriaExpandidaId] = useState<
    string | null
  >(null);
  const [cargandoId, setCargandoId] = useState<string | null>(null);

  const competenciasDelTorneo = competencias.filter(
    (c) => c.torneoId === torneoId,
  );

  const handleCambioEstado = async (
    competenciaId: string,
    nuevoEstado: string,
  ) => {
    setCargandoId(competenciaId);
    try {
      if (onCambiarEstadoCompetencia) {
        await onCambiarEstadoCompetencia(competenciaId, nuevoEstado);
      }
    } catch (error) {
      console.error("Error al cambiar estado de competencia:", error);
    } finally {
      setCargandoId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Categorías Habilitadas
        </h3>
        <button
          onClick={() => setModoCrearCompetencia(!modoCrearCompetencia)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition shadow-md"
        >
          {modoCrearCompetencia ? "✕ Cancelar" : "➕ Nueva Categoría"}
        </button>
      </div>

      {modoCrearCompetencia && (
        <div className="bg-slate-800/90 p-4 rounded-2xl border border-blue-500/30 shadow-lg">
          <CompetenciaForm
            torneoId={torneoId}
            onSuccess={() => setModoCrearCompetencia(false)}
          />
        </div>
      )}

      <div className="space-y-3">
        {competenciasDelTorneo.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-10 border border-dashed border-slate-800 rounded-2xl">
            No hay categorías creadas para este torneo aún.
          </p>
        ) : (
          competenciasDelTorneo.map((comp) => {
            const parejasCat = parejas.filter(
              (p) => p.competenciaId === comp.id,
            );
            const estaExpandida = categoriaExpandidaId === comp.id;
            const cargando = cargandoId === comp.id;

            return (
              <div
                key={comp.id}
                className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 transition hover:border-slate-600"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div
                    onClick={() =>
                      setCategoriaExpandidaId(estaExpandida ? null : comp.id)
                    }
                    className="cursor-pointer select-none flex-1"
                  >
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">
                        {comp.nombre || comp.categoriaId}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          (comp.estado as string) === "CERRADA" ||
                          (comp.estado as string) === "cerrada"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : (comp.estado as string) === "EN_JUEGO" ||
                                (comp.estado as string) === "en_juego"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : (comp.estado as string) === "FINALIZADA" ||
                                  (comp.estado as string) === "finalizada"
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {comp.estado || "ABIERTA"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-1">
                      <span>
                        Parejas:{" "}
                        <strong className="text-slate-200">
                          {parejasCat.length}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Inscripción:{" "}
                        <strong className="text-emerald-400">
                          ${comp.precioInscripcionBase || 0}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      disabled={cargando || !onCambiarEstadoCompetencia}
                      value={comp.estado || "ABIERTA"}
                      onChange={(e) =>
                        handleCambioEstado(comp.id, e.target.value)
                      }
                      className="bg-slate-900 border border-slate-700 text-xs font-semibold rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      <option value="ABIERTA">🟢 Abierta</option>
                      <option value="CERRADA">🔒 Cerrada</option>
                      <option value="EN_JUEGO">⚔️ En Juego</option>
                      <option value="FINALIZADA">🏆 Finalizada</option>
                    </select>

                    <button
                      onClick={() =>
                        setCategoriaExpandidaId(estaExpandida ? null : comp.id)
                      }
                      className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/50 hover:text-white"
                    >
                      {estaExpandida ? "▲ Ocultar" : "▼ Detalles"}
                    </button>
                  </div>
                </div>

                {estaExpandida && (
                  <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">
                      Parejas Registradas
                    </span>
                    {parejasCat.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">
                        Sin parejas anotadas.
                      </p>
                    ) : (
                      parejasCat.map((p) => (
                        <div
                          key={p.id}
                          className="bg-slate-900/90 p-3 rounded-xl flex justify-between items-center text-xs border border-slate-800"
                        >
                          <div>
                            <p className="font-semibold text-slate-200">
                              {p.jugador1?.nombre} {p.jugador1?.apellido} /{" "}
                              {p.jugador2?.nombre} {p.jugador2?.apellido}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.estadoPago === "APROBADO"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : p.estadoPago === "RECHAZADO"
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {p.estadoPago || "PENDIENTE"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
