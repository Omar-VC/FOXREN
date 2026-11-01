import { calcularTablaZona, clasificarParejasZona } from "../../../../domain/competencia/competencia.tabla";
import type { Partido, FormatoPartido } from "../../../../domain/partido/partido.types";
import type { Resultado } from "../../../../domain/resultado/resultado.types";
import type { Zona } from "../../../../domain/competencia/competencia.zonas.types";
import type { ReglamentoCompetencia } from "../../../../domain/competencia/competencia.types";

interface Props {
  zonas: Zona[];
  partidos: Partido[];
  resultados: Resultado[];
  parejasClasificanPorZona: number;
  formatoPartidoZona: FormatoPartido;
  reglamento?: ReglamentoCompetencia;
  nombrePareja: (parejaId: string) => string;
}

export default function TablaZonaAdmin({
  zonas,
  partidos,
  resultados,
  parejasClasificanPorZona,
  formatoPartidoZona,
  reglamento,
  nombrePareja,
}: Props) {
  if (zonas.length === 0) return null;
  
  if (!reglamento || reglamento.estado !== "aprobado") {
    return (
      <div className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-amber-500/30 text-amber-300 text-sm">
        <p className="font-semibold">Reglamento pendiente de aprobación</p>
        <p className="mt-1 text-slate-300">
          Las posiciones y la clasificación quedan ocultas hasta que el administrador
          apruebe el reglamento de esta competencia.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Tablas de posiciones por zona" className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-100 tracking-wide">
          Tablas de Posiciones
        </h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] text-slate-300 font-medium">
          Zonas de clasificación
        </span>
      </div>

      <div className="space-y-6">
        {zonas.slice().sort((a, b) => a.orden - b.orden).map((zona) => {
          try {
            const tabla = calcularTablaZona(
              zona,
              partidos,
              resultados,
              reglamento.criteriosDesempate,
              formatoPartidoZona,
            );
            const clasificacion = tabla.completa
              ? clasificarParejasZona(
                  tabla,
                  parejasClasificanPorZona,
                  reglamento.criteriosDesempate,
                )
              : null;

            return (
              <article 
                key={zona.id}
                className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 shadow-lg space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]"></span>
                    {zona.nombre}
                  </h4>
                  {tabla.partidosPendientes > 0 ? (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300">
                      ⚠️ {tabla.partidosPendientes} partido(s) pendiente(s)
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                      ✓ Zona Completa
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-[var(--color-bg-surface)] text-slate-400 text-xs uppercase tracking-wider border-b border-[var(--color-border)]">
                        <th className="py-2.5 px-3 font-semibold text-center w-12">Pos</th>
                        <th className="py-2.5 px-4 font-semibold">Pareja</th>
                        <th className="py-2.5 px-3 font-semibold text-center">PJ</th>
                        <th className="py-2.5 px-3 font-semibold text-center">PG</th>
                        <th className="py-2.5 px-3 font-semibold text-center">PP</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Sets</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Dif. S</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Games</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Dif. G</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {tabla.filas.map((fila) => {
                        const esClasificado = clasificacion?.clasificados.includes(fila.parejaId);
                        return (
                          <tr 
                            key={fila.parejaId}
                            className={`transition-colors hover:bg-white/[0.02] ${
                              esClasificado ? "bg-emerald-500/[0.04]" : ""
                            }`}
                          >
                            <td className="py-3 px-3 text-center font-bold text-slate-200">
                              <span className={`inline-grid w-6 h-6 place-items-center rounded-full text-xs ${
                                fila.posicion <= parejasClasificanPorZona ? "bg-[var(--color-primary)] text-white font-extrabold shadow-sm" : "text-slate-400"
                              }`}>
                                {fila.posicion}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium text-white">
                              {nombrePareja(fila.parejaId)}
                            </td>
                            <td className="py-3 px-3 text-center text-slate-300">{fila.partidosJugados}</td>
                            <td className="py-3 px-3 text-center font-semibold text-emerald-400">{fila.victorias}</td>
                            <td className="py-3 px-3 text-center text-slate-400">{fila.derrotas}</td>
                            <td className="py-3 px-3 text-center text-slate-300">{fila.setsGanados}-{fila.setsPerdidos}</td>
                            <td className={`py-3 px-3 text-center font-medium ${
                              fila.diferenciaSets > 0 ? "text-emerald-400" : fila.diferenciaSets < 0 ? "text-red-400" : "text-slate-400"
                            }`}>
                              {fila.diferenciaSets > 0 ? `+${fila.diferenciaSets}` : fila.diferenciaSets}
                            </td>
                            <td className="py-3 px-3 text-center text-slate-300">{fila.gamesGanados}-{fila.gamesPerdidos}</td>
                            <td className={`py-3 px-3 text-center font-medium ${
                              fila.diferenciaGames > 0 ? "text-emerald-400" : fila.diferenciaGames < 0 ? "text-red-400" : "text-slate-400"
                            }`}>
                              {fila.diferenciaGames > 0 ? `+${fila.diferenciaGames}` : fila.diferenciaGames}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Secciones de Estado de Clasificación */}
                {clasificacion?.bloqueadaPorEmpate && (
                  <div className="p-3.5 rounded-lg bg-red-950/30 border border-red-500/30 text-red-200 text-xs space-y-1">
                    <p className="font-semibold flex items-center gap-1.5 text-red-300">
                      <span>⛔</span> Clasificación detenida por empate
                    </p>
                    <p>
                      Hay un empate en el corte entre: <strong className="text-white">{clasificacion.empateEnCorte.map(nombrePareja).join(", ")}</strong>. 
                      Resolución configurada: <span className="underline uppercase">{reglamento.empatePersistente.replaceAll("_", " ")}</span>.
                    </p>
                  </div>
                )}

                {clasificacion && !clasificacion.bloqueadaPorEmpate && (
                  <div className="p-3 rounded-lg bg-emerald-950/25 border border-emerald-500/25 text-emerald-300 text-xs flex items-center justify-between">
                    <span className="font-medium">
                      ✨ <strong className="text-white">Parejas Clasificadas:</strong> {clasificacion.clasificados.map(nombrePareja).join(", ")}
                    </span>
                  </div>
                )}
              </article>
            );
          } catch (error) {
            return (
              <article key={zona.id} className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-sm">
                <h5 className="font-semibold text-white">{zona.nombre}</h5>
                <p className="mt-1">{error instanceof Error ? error.message : "No se pudo calcular la tabla."}</p>
              </article>
            );
          }
        })}
      </div>
    </section>
  );
}