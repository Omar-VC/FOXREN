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
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--border-radius)] p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-lg font-semibold text-slate-100">Partidos</h4>
          <p className="text-xs text-slate-400 mt-1">
            {partidos.length} partido{partidos.length === 1 ? "" : "s"}{" "}
            generado{partidos.length === 1 ? "" : "s"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => actualizarPartidos()}
          disabled={cargandoPartidos}
          className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800 disabled:opacity-50"
        >
          {cargandoPartidos ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {cargandoPartidos ? (
        <p className="text-sm text-slate-400">Cargando partidos...</p>
      ) : errorPartidos ? (
        <p className="text-sm text-red-300">{errorPartidos}</p>
      ) : partidos.length === 0 ? (
        <p className="text-sm text-slate-400">
          Todavía no hay partidos generados para esta competencia.
        </p>
      ) : (
        <div className="space-y-3">
          {partidos.map((partido) => (
            <article
              key={partido.id}
              className="rounded-xl border border-[var(--color-border)] bg-slate-950/40 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                  {nombreZona(partido.zonaId)}
                </span>

                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    partido.estado === "finalizado"
                      ? "bg-emerald-950 text-emerald-300"
                      : partido.estado === "en_juego"
                        ? "bg-sky-950 text-sky-300"
                        : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {etiquetaEstadoPartido(partido.estado)}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-100 font-medium">
                    {nombrePareja(partido.pareja1Id)}
                  </p>
                  {partido.ganadorParejaId === partido.pareja1Id && (
                    <span className="text-xs text-emerald-400">Ganadora</span>
                  )}
                </div>

                <p className="text-xs font-semibold text-slate-500">VS</p>

                <div>
                  <p className="text-slate-100 font-medium">
                    {nombrePareja(partido.pareja2Id)}
                  </p>
                  {partido.ganadorParejaId === partido.pareja2Id && (
                    <span className="text-xs text-emerald-400">Ganadora</span>
                  )}
                </div>
              </div>

              {partido.sets.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Resultado</p>
                  <div className="flex flex-wrap gap-2">
                    {partido.sets.map((set) => (
                      <span
                        key={set.setNumero}
                        className="text-sm font-semibold text-slate-200"
                      >
                        {set.juegosPareja1}-{set.juegosPareja2}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(partido.fechaHora || partido.cancha) && (
                <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                  {partido.fechaHora && (
                    <p>
                      Fecha:{" "}
                      {new Date(partido.fechaHora).toLocaleString("es-AR")}
                    </p>
                  )}
                  {partido.cancha && <p>Cancha: {partido.cancha}</p>}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}