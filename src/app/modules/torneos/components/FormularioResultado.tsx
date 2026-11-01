import { useCallback } from "react";
import type { Partido } from "../../../../domain/partido/partido.types";
import type { TipoResultado } from "../../../../domain/resultado/resultado.types";

type MarcadorSet = {
  juegosPareja1: string;
  juegosPareja2: string;
  tieBreakPareja1: string;
  tieBreakPareja2: string;
};

interface Props {
  partidos: Partido[];
  partidoSeleccionadoId: string;
  tipoResultado: TipoResultado;
  cantidadSets: 2 | 3;
  marcadores: MarcadorSet[];
  ganadorEspecialId: string;
  resultadoOficial: boolean;
  guardandoResultado: boolean;
  mensajeResultado: string | null;
  errorResultado: string | null;
  setPartidoSeleccionadoId: (id: string) => void;
  setTipoResultado: (tipo: TipoResultado) => void;
  setCantidadSets: (cantidad: 2 | 3) => void;
  setMarcadores: React.Dispatch<React.SetStateAction<MarcadorSet[]>>;
  setGanadorEspecialId: (id: string) => void;
  setResultadoOficial: (oficial: boolean) => void;
  setErrorResultado: (mensaje: string | null) => void;
  setMensajeResultado: (mensaje: string | null) => void;
  nombrePareja: (parejaId: string) => string;
  guardarResultado: () => Promise<void>;
}

export default function FormularioResultado({
  partidos,
  partidoSeleccionadoId,
  tipoResultado,
  cantidadSets,
  marcadores,
  ganadorEspecialId,
  resultadoOficial,
  guardandoResultado,
  mensajeResultado,
  errorResultado,
  setPartidoSeleccionadoId,
  setTipoResultado,
  setCantidadSets,
  setMarcadores,
  setGanadorEspecialId,
  setResultadoOficial,
  setErrorResultado,
  setMensajeResultado,
  nombrePareja,
  guardarResultado,
}: Props) {
  const obtenerPartido = useCallback(() => {
    return partidos.find((p) => p.id === partidoSeleccionadoId);
  }, [partidos, partidoSeleccionadoId]);

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-border)] pb-3">
        <h3 className="text-xl font-bold text-white tracking-wide">
          Registro de Resultados
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Cargá marcadores, walkovers o incidencias de partidos
        </p>
      </div>

      <div className="space-y-4">
        {/* Selector de Partido */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Seleccionar Partido
          </label>
          <select
            value={partidoSeleccionadoId}
            onChange={(e) => {
              setPartidoSeleccionadoId(e.target.value);
              setErrorResultado(null);
              setMensajeResultado(null);
            }}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors shadow-sm"
          >
            <option value="">Seleccione un partido pendiente...</option>
            {partidos
              .filter(
                (partido) =>
                  !["finalizado", "walkover", "abandono"].includes(
                    partido.estado,
                  ),
              )
              .map((partido) => (
                <option key={partido.id} value={partido.id}>
                  {partido.estado === "suspendido" ? "⚠️ Resolver suspensión: " : ""}
                  {nombrePareja(partido.pareja1Id ?? "")} vs.{" "}
                  {nombrePareja(partido.pareja2Id ?? "")}
                </option>
              ))}
          </select>
        </div>

        {/* Tipo de Resultado */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Tipo de Resultado
          </label>
          <select
            value={tipoResultado}
            onChange={(e) => {
              setTipoResultado(e.target.value as TipoResultado);
              setErrorResultado(null);
            }}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors shadow-sm"
          >
            <option value="normal">Partido normal</option>
            <option value="walkover">Walkover (W.O.)</option>
            <option value="abandono">Abandono</option>
            <option value="suspension">Suspensión</option>
          </select>
        </div>

        {/* Configuración de Sets para Partido Normal */}
        {tipoResultado === "normal" && (
          <>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Cantidad de Sets
              </label>
              <select
                value={cantidadSets}
                onChange={(e) =>
                  setCantidadSets(Number(e.target.value) as 2 | 3)
                }
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors shadow-sm"
              >
                <option value={2}>Dos sets</option>
                <option value={3}>Tres sets</option>
              </select>
            </div>

            {marcadores.slice(0, cantidadSets).map((marcador, indice) => (
              <div
                key={indice}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]/60 p-4 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
                    Set {indice + 1}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-400 truncate">
                      {nombrePareja(
                        partidos.find((p) => p.id === partidoSeleccionadoId)
                          ?.pareja1Id ?? "",
                      )}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="7"
                      value={marcador.juegosPareja1}
                      onChange={(e) =>
                        setMarcadores((actual) =>
                          actual.map((item, i) =>
                            i === indice
                              ? { ...item, juegosPareja1: e.target.value }
                              : item,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-main)] px-3 py-2 text-sm text-white text-center font-bold focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-400 truncate">
                      {nombrePareja(
                        partidos.find((p) => p.id === partidoSeleccionadoId)
                          ?.pareja2Id ?? "",
                      )}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="7"
                      value={marcador.juegosPareja2}
                      onChange={(e) =>
                        setMarcadores((actual) =>
                          actual.map((item, i) =>
                            i === indice
                              ? { ...item, juegosPareja2: e.target.value }
                              : item,
                          ),
                        )
                      }
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-main)] px-3 py-2 text-sm text-white text-center font-bold focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>
                </div>

                {/* Sección Tie-break */}
                {Number(marcador.juegosPareja1) === 6 &&
                  Number(marcador.juegosPareja2) === 6 && (
                    <div className="space-y-2.5 rounded-lg border border-amber-500/30 bg-amber-500/[0.04] p-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                        <span>⚡</span> Tie-break detectado (6-6)
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Ingresá los puntos del desempate. El set se completará automáticamente como 7-6 para la pareja ganadora.
                      </p>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-slate-400">Puntos Pareja 1</label>
                          <input
                            type="number"
                            min="0"
                            value={marcador.tieBreakPareja1}
                            onChange={(e) =>
                              setMarcadores((actual) =>
                                actual.map((item, i) =>
                                  i === indice
                                    ? {
                                        ...item,
                                        tieBreakPareja1: e.target.value,
                                      }
                                    : item,
                                ),
                              )
                            }
                            className="w-full rounded-lg border border-amber-500/30 bg-[var(--color-bg-main)] px-2.5 py-1.5 text-xs text-white text-center font-bold focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] text-slate-400">Puntos Pareja 2</label>
                          <input
                            type="number"
                            min="0"
                            value={marcador.tieBreakPareja2}
                            onChange={(e) =>
                              setMarcadores((actual) =>
                                actual.map((item, i) =>
                                  i === indice
                                    ? {
                                        ...item,
                                        tieBreakPareja2: e.target.value,
                                      }
                                    : item,
                                ),
                              )
                            }
                            className="w-full rounded-lg border border-amber-500/30 bg-[var(--color-bg-main)] px-2.5 py-1.5 text-xs text-white text-center font-bold focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {Number(marcador.tieBreakPareja1) !==
                        Number(marcador.tieBreakPareja2) &&
                        Math.max(
                          Number(marcador.tieBreakPareja1),
                          Number(marcador.tieBreakPareja2),
                        ) >= 7 &&
                        Math.abs(
                          Number(marcador.tieBreakPareja1) -
                            Number(marcador.tieBreakPareja2),
                        ) >= 2 && (
                          <p className="text-xs font-bold text-emerald-300 pt-1 text-center">
                            ✓ Resultado del set:{" "}
                            {Number(marcador.tieBreakPareja1) >
                            Number(marcador.tieBreakPareja2)
                              ? "7-6 (Pareja 1)"
                              : "6-7 (Pareja 2)"}
                          </p>
                        )}
                    </div>
                  )}
              </div>
            ))}
          </>
        )}

        {/* Ganador para Walkover o Abandono */}
        {(tipoResultado === "walkover" || tipoResultado === "abandono") && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Pareja Ganadora por {tipoResultado === "walkover" ? "Walkover" : "Abandono"}
            </label>
            <select
              value={ganadorEspecialId}
              onChange={(e) => setGanadorEspecialId(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors shadow-sm"
            >
              <option value="">Seleccionar pareja ganadora...</option>
              {(() => {
                const partido = obtenerPartido();
                if (!partido) return null;
                return (
                  <>
                    <option value={partido.pareja1Id ?? ""}>
                      {partido.pareja1Id
                        ? nombrePareja(partido.pareja1Id)
                        : "Por definir"}
                    </option>
                    <option value={partido.pareja2Id ?? ""}>
                      {partido.pareja2Id
                        ? nombrePareja(partido.pareja2Id)
                        : "Por definir"}
                    </option>
                  </>
                );
              })()}
            </select>
          </div>
        )}

        {/* Checkbox Resultado Oficial */}
        <div className="pt-1">
          <label className="flex items-center gap-2.5 text-xs font-medium text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={resultadoOficial}
              onChange={(e) => setResultadoOficial(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--color-border)] bg-[var(--color-bg-main)] text-[var(--color-primary)] focus:ring-0 accent-[var(--color-primary)]"
            />
            <span>Resultado oficial (impacta en la tabla de posiciones y genera historial)</span>
          </label>
        </div>

        {/* Mensajes de Error / Éxito */}
        {errorResultado && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs rounded-xl">
            {errorResultado}
          </div>
        )}

        {mensajeResultado && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs rounded-xl">
            {mensajeResultado}
          </div>
        )}

        {/* Botón de Guardar */}
        <button
          type="button"
          onClick={guardarResultado}
          disabled={guardandoResultado || !partidoSeleccionadoId}
          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-3 text-xs font-bold text-white uppercase tracking-wider transition-colors disabled:opacity-50 shadow-lg shadow-emerald-900/20"
        >
          {guardandoResultado ? "Guardando resultado..." : "Guardar resultado oficial"}
        </button>
      </div>
    </div>
  );
}
