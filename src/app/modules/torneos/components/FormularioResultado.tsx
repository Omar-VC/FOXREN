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
  cantidadSets: 1 | 2 | 3;
  marcadores: MarcadorSet[];
  ganadorEspecialId: string;
  resultadoOficial: boolean;
  guardandoResultado: boolean;
  mensajeResultado: string | null;
  errorResultado: string | null;
  setPartidoSeleccionadoId: (id: string) => void;
  setTipoResultado: (tipo: TipoResultado) => void;
  setCantidadSets: (cantidad: 1 | 2 | 3) => void;
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
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--border-radius)] p-5 shadow-lg">
      <h4 className="text-lg font-semibold text-slate-100 mb-4">
        Registrar resultado
      </h4>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Partido</label>
          <select
            value={partidoSeleccionadoId}
            onChange={(e) => {
              setPartidoSeleccionadoId(e.target.value);
              setErrorResultado(null);
              setMensajeResultado(null);
            }}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white"
          >
            <option value="">Seleccionar partido</option>
            {partidos
              .filter(
                (partido) =>
                  !["finalizado", "walkover", "abandono"].includes(
                    partido.estado,
                  ),
              )
              .map((partido) => (
                <option key={partido.id} value={partido.id}>
                  {partido.estado === "suspendido"
                    ? "Resolver suspensión: "
                    : ""}
                  {nombrePareja(partido.pareja1Id ?? "")} vs.{" "}
                  {nombrePareja(partido.pareja2Id ?? "")}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Tipo de resultado
          </label>
          <select
            value={tipoResultado}
            onChange={(e) => {
              setTipoResultado(e.target.value as TipoResultado);
              setErrorResultado(null);
            }}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white"
          >
            <option value="normal">Partido normal</option>
            <option value="walkover">Walkover</option>
            <option value="abandono">Abandono</option>
            <option value="suspension">Suspensión</option>
          </select>
        </div>

        {tipoResultado === "normal" && (
          <>
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Cantidad de sets
              </label>
              <select
                value={cantidadSets}
                onChange={(e) =>
                  setCantidadSets(Number(e.target.value) as 1 | 2 | 3)
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white"
              >
                <option value={1}>Un set</option>
                <option value={2}>Dos sets</option>
                <option value={3}>Tres sets</option>
              </select>
            </div>

            {marcadores.slice(0, cantidadSets).map((marcador, indice) => (
              <div
                key={indice}
                className="rounded-lg border border-slate-700 p-3 space-y-3"
              >
                <p className="text-sm font-semibold text-slate-200">
                  Set {indice + 1}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-slate-400">
                    {nombrePareja(
                      partidos.find((p) => p.id === partidoSeleccionadoId)
                        ?.pareja1Id ?? "",
                    )}
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
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white"
                    />
                  </label>

                  <label className="text-xs text-slate-400">
                    {nombrePareja(
                      partidos.find((p) => p.id === partidoSeleccionadoId)
                        ?.pareja2Id ?? "",
                    )}
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
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white"
                    />
                  </label>
                </div>

                {Number(marcador.juegosPareja1) === 6 &&
                  Number(marcador.juegosPareja2) === 6 && (
                    <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                      <p className="text-sm font-medium text-amber-300">
                        Tie-break
                      </p>

                      <p className="text-xs text-slate-400">
                        Ingresá los puntos del desempate. El set se completará
                        automáticamente como 7-6 para la pareja ganadora.
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <label className="text-xs text-slate-400">
                          Puntos pareja 1
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
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white"
                          />
                        </label>

                        <label className="text-xs text-slate-400">
                          Puntos pareja 2
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
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white"
                          />
                        </label>
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
                          <p className="text-sm font-semibold text-emerald-300">
                            Resultado del set:{" "}
                            {Number(marcador.tieBreakPareja1) >
                            Number(marcador.tieBreakPareja2)
                              ? "7-6 para la pareja 1"
                              : "6-7 para la pareja 2"}
                          </p>
                        )}
                    </div>
                  )}
              </div>
            ))}
          </>
        )}

        {(tipoResultado === "walkover" || tipoResultado === "abandono") && (
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Pareja ganadora
            </label>
            <select
              value={ganadorEspecialId}
              onChange={(e) => setGanadorEspecialId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white"
            >
              <option value="">Seleccionar pareja</option>
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

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={resultadoOficial}
            onChange={(e) => setResultadoOficial(e.target.checked)}
            className="accent-emerald-500"
          />
          Resultado oficial (genera historial)
        </label>

        {errorResultado && (
          <p className="text-sm text-red-300">{errorResultado}</p>
        )}

        {mensajeResultado && (
          <p className="text-sm text-emerald-300">{mensajeResultado}</p>
        )}

        <button
          type="button"
          onClick={guardarResultado}
          disabled={guardandoResultado || !partidoSeleccionadoId}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {guardandoResultado ? "Guardando..." : "Guardar resultado"}
        </button>
      </div>
    </div>
  );
}
