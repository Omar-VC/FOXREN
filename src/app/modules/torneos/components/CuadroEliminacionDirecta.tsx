import type { Partido, SetResultado } from "../../../../domain/partido/partido.types";
import { etiquetaFase } from "../../../../domain/competencia/competencia.playoff.rules";

interface Props {
  partidos: Partido[];
  nombrePareja: (parejaId: string) => string;
  /** Partido elegido en el formulario de resultado (se resalta en el cuadro). */
  partidoSeleccionadoId?: string;
  /** Elige el partido para cargarle el resultado en el formulario. Sin esto, el cuadro es solo lectura. */
  onSeleccionarPartido?: (partidoId: string) => void;
  /** Botón "Actualizar" (solo admin; la vista pública se actualiza sola). */
  actualizarPartidos?: () => void;
}

const ESTADOS_CERRADOS: Partido["estado"][] = ["finalizado", "walkover", "abandono"];

function textoSet(set: SetResultado, lado: 1 | 2): string {
  const propios = lado === 1 ? set.juegosPareja1 : set.juegosPareja2;
  const tb = lado === 1 ? set.tieBreakPareja1 : set.tieBreakPareja2;
  if (set.tipo === "super_tiebreak") return `[${tb ?? propios}]`;
  return tb !== undefined && tb !== null ? `${propios}(${tb})` : `${propios}`;
}

export default function CuadroEliminacionDirecta({
  partidos,
  nombrePareja,
  partidoSeleccionadoId,
  onSeleccionarPartido,
  actualizarPartidos,
}: Props) {
  const llave = partidos.filter((p) => p.tipoPartido === "eliminacion_directa");

  if (llave.length === 0) {
    return (
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--border-radius)] p-5 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-100 mb-2">Cuadro de playoff</h3>
        <p className="text-sm text-slate-400">Todavía no se generó la llave.</p>
      </div>
    );
  }

  const porRonda = new Map<number, Partido[]>();
  for (const partido of llave) {
    const ronda = Number(partido.ronda ?? 0);
    porRonda.set(ronda, [...(porRonda.get(ronda) ?? []), partido]);
  }
  for (const lista of porRonda.values()) {
    lista.sort((a, b) => (a.partidoNumero ?? 0) - (b.partidoNumero ?? 0));
  }
  const rondas = [...porRonda.keys()].sort((a, b) => a - b);

  // Quién alimenta a cada lado de cada partido (para mostrar "Ganador Semifinal 1").
  const alimentador = new Map<string, Partido>();
  for (const partido of llave) {
    if (partido.partidoSiguienteId && partido.ladoSiguiente) {
      alimentador.set(`${partido.partidoSiguienteId}:${partido.ladoSiguiente}`, partido);
    }
  }

  function nombreLado(partido: Partido, lado: 1 | 2): string {
    const id = lado === 1 ? partido.pareja1Id : partido.pareja2Id;
    if (id) return nombrePareja(id);
    if (partido.esBye) return "Libre (bye)";
    const origen = alimentador.get(`${partido.id}:${lado}`);
    if (origen) {
      return `Ganador ${etiquetaFase(origen.fase ?? "")} ${origen.partidoNumero ?? ""}`.trim();
    }
    return "Por definir";
  }

  const final = llave.find((p) => p.fase === "final");
  const campeonId = final?.ganadorParejaId;

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--border-radius)] p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-slate-100">Cuadro de playoff</h3>
        {actualizarPartidos && (
          <button
            type="button"
            onClick={actualizarPartidos}
            className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800"
          >
            Actualizar
          </button>
        )}
      </div>

      {campeonId && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-center">
          <p className="text-xs uppercase tracking-wider text-amber-300">Campeón</p>
          <p className="text-lg font-bold text-amber-100">{nombrePareja(campeonId)}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {rondas.map((ronda) => {
            const lista = porRonda.get(ronda) ?? [];
            return (
              <div key={ronda} className="w-64 shrink-0 flex flex-col">
                <h4 className="pb-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {etiquetaFase(lista[0]?.fase ?? `ronda_de_${ronda}`)}
                </h4>
                <div className="flex flex-1 flex-col justify-around gap-3">
                  {lista.map((partido) => {
                    const cerrado = ESTADOS_CERRADOS.includes(partido.estado);
                    const suspendido = partido.estado === "suspendido";
                    const listo =
                      !partido.esBye && !!partido.pareja1Id && !!partido.pareja2Id;
                    const seleccionado = partido.id === partidoSeleccionadoId;

                    return (
                      <div
                        key={partido.id}
                        className={`rounded-lg border p-3 ${
                          seleccionado
                            ? "border-emerald-400 bg-emerald-950/30"
                            : cerrado
                              ? "bg-emerald-950/20 border-emerald-500/30"
                              : suspendido
                                ? "bg-amber-950/20 border-amber-500/40"
                                : "bg-slate-950/40 border-slate-700"
                        } ${partido.esBye ? "opacity-60" : ""}`}
                      >
                        {([1, 2] as const).map((lado) => {
                          const id = lado === 1 ? partido.pareja1Id : partido.pareja2Id;
                          const gana = !!id && partido.ganadorParejaId === id;
                          return (
                            <div
                              key={lado}
                              className="flex items-center justify-between gap-2 py-0.5 text-sm"
                            >
                              <span
                                className={`truncate ${
                                  id ? "text-slate-100" : "italic text-slate-500"
                                } ${gana ? "font-bold" : ""}`}
                                title={nombreLado(partido, lado)}
                              >
                                {gana && <span className="text-emerald-400">✓ </span>}
                                {nombreLado(partido, lado)}
                              </span>
                              <span className="shrink-0 font-mono text-xs text-slate-300">
                                {partido.sets.map((s) => textoSet(s, lado)).join(" ")}
                              </span>
                            </div>
                          );
                        })}

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] uppercase text-slate-500">
                            {partido.esBye
                              ? "Avanza sin jugar"
                              : cerrado
                                ? partido.estado === "finalizado"
                                  ? "Finalizado"
                                  : partido.estado === "walkover"
                                    ? "Walkover"
                                    : "Abandono"
                                : suspendido
                                  ? "Suspendido"
                                  : listo
                                    ? "Pendiente"
                                    : "Esperando rivales"}
                          </span>
                          {onSeleccionarPartido && listo && !cerrado && (
                            <button
                              type="button"
                              onClick={() => onSeleccionarPartido?.(partido.id)}
                              className="text-xs px-2 py-1 rounded border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400"
                            >
                              {suspendido ? "Resolver suspensión" : "Cargar resultado"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
