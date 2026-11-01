import type { Partido } from "../../../../domain/partido/partido.types";

interface Props {
  partidos: Partido[];
  actualizarPartidos: () => void;
  cargandoPartidos: boolean;
  errorPartidos: string | null;
  nombrePareja: (parejaId: string) => string;
  nombreZona: (zonaId?: string) => string;
  etiquetaEstadoPartido: (estado: Partido["estado"]) => string;
}

export default function ListaPartidos({
  partidos,
  actualizarPartidos,
  cargandoPartidos,
  errorPartidos,
  nombrePareja,
  nombreZona,
  etiquetaEstadoPartido,
}: Props) {
  // Función auxiliar para colorear el badge de estado del partido
  const obtenerEstiloEstado = (estado: Partido["estado"]) => {
    switch (estado) {
      case "finalizado":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
      case "en_juego":
        return "bg-sky-500/10 text-sky-300 border-sky-500/20";
      default:
        return "bg-white/[0.05] text-slate-300 border-[var(--color-border)]";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div>
          <h3 className="text-xl font-bold text-white tracking-wide">
            Partidos de la Competencia
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {partidos.length} partido{partidos.length === 1 ? "" : "s"} registrado{partidos.length === 1 ? "" : "s"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => actualizarPartidos()}
          disabled={cargandoPartidos}
          className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-[var(--color-border)] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 shadow-sm"
        >
          {cargandoPartidos ? "Actualizando..." : "Actualizar listado"}
        </button>
      </div>

      {cargandoPartidos ? (
        <div className="py-8 text-center text-slate-400 text-sm">
          Cargando partidos...
        </div>
      ) : errorPartidos ? (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-200 text-xs rounded-xl">
          {errorPartidos}
        </div>
      ) : partidos.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-6 text-center bg-white/[0.02] rounded-xl border border-[var(--color-border)]">
          Todavía no hay partidos generados para esta competencia.
        </p>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {partidos.map((partido) => {
            const esPareja1Ganadora = partido.pareja1Id && partido.ganadorParejaId === partido.pareja1Id;
            const esPareja2Ganadora = partido.pareja2Id && partido.ganadorParejaId === partido.pareja2Id;

            return (
              <article
                key={partido.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 shadow-sm hover:border-slate-500 transition-colors space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
                    {nombreZona(partido.zonaId)}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border shadow-sm ${obtenerEstiloEstado(
                      partido.estado
                    )}`}
                  >
                    ● {etiquetaEstadoPartido(partido.estado)}
                  </span>
                </div>

                {/* Enfrentamiento */}
                <div className="space-y-2 text-sm bg-[var(--color-bg-main)]/40 p-3 rounded-lg border border-[var(--color-border)]">
                  {/* Pareja 1 */}
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${esPareja1Ganadora ? "text-emerald-300 font-bold" : "text-white"}`}>
                      {partido.pareja1Id ? (
                        nombrePareja(partido.pareja1Id)
                      ) : (
                        <span className="text-slate-500 italic">Por definir</span>
                      )}
                    </span>
                    {esPareja1Ganadora && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase tracking-wider">
                        Ganadora
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest text-center">
                    vs
                  </div>

                  {/* Pareja 2 */}
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${esPareja2Ganadora ? "text-emerald-300 font-bold" : "text-white"}`}>
                      {partido.pareja2Id ? (
                        nombrePareja(partido.pareja2Id)
                      ) : (
                        <span className="text-slate-500 italic">Por definir</span>
                      )}
                    </span>
                    {esPareja2Ganadora && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase tracking-wider">
                        Ganadora
                      </span>
                    )}
                  </div>
                </div>

                {/* Resultados por Sets */}
                {partido.sets.length > 0 && (
                  <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Marcador:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {partido.sets.map((set) => (
                        <span
                          key={set.setNumero}
                          className="text-xs font-bold px-2 py-1 rounded bg-white/[0.06] border border-[var(--color-border)] text-slate-200 shadow-sm"
                        >
                          {set.juegosPareja1} - {set.juegosPareja2}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Información de Fecha / Cancha */}
                {(partido.fechaHora || partido.cancha) && (
                  <div className="pt-2 border-t border-[var(--color-border)] text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
                    {partido.fechaHora && (
                      <span>
                        📅 {new Date(partido.fechaHora).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    )}
                    {partido.cancha && (
                      <span className="px-2 py-0.5 rounded bg-white/[0.03] border border-[var(--color-border)] text-slate-300">
                        🏟️ {partido.cancha}
                      </span>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}