import { calcularTablaZona, clasificarParejasZona } from "../../../../domain/competencia/competencia.tabla";
import type { Partido } from "../../../../domain/partido/partido.types";
import type { Resultado } from "../../../../domain/resultado/resultado.types";
import type { Zona } from "../../../../domain/competencia/competencia.zonas.types";
import type { ReglamentoCompetencia } from "../../../../domain/competencia/competencia.types";

interface Props {
  zonas: Zona[];
  partidos: Partido[];
  resultados: Resultado[];
  parejasClasificanPorZona: number;
  reglamento?: ReglamentoCompetencia;
  nombrePareja: (parejaId: string) => string;
}

export default function TablaZonaAdmin({
  zonas,
  partidos,
  resultados,
  parejasClasificanPorZona,
  reglamento,
  nombrePareja,
}: Props) {
  if (zonas.length === 0) return null;
  if (!reglamento || reglamento.estado !== "aprobado") {
    return (
      <p role="status" className="mt-5 text-amber-300">
        Las posiciones y la clasificación quedan ocultas hasta que el administrador
        apruebe el reglamento de esta competencia.
      </p>
    );
  }

  return (
    <section aria-label="Tablas de posiciones por zona" className="mt-5 space-y-5">
      <h4 className="text-lg font-semibold">Tablas de posiciones</h4>
      {zonas.slice().sort((a, b) => a.orden - b.orden).map((zona) => {
        try {
          const tabla = calcularTablaZona(
            zona,
            partidos,
            resultados,
            reglamento.criteriosDesempate,
          );
          const clasificacion = tabla.completa
            ? clasificarParejasZona(
                tabla,
                parejasClasificanPorZona,
                reglamento.criteriosDesempate,
              )
            : null;

          return (
            <article key={zona.id}>
              <h5 className="font-semibold">{zona.nombre}</h5>
              {tabla.partidosPendientes > 0 && (
                <p role="status">
                  {tabla.partidosPendientes} partido(s) pendiente(s) o sin resultado oficial.
                </p>
              )}
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Pos.</th><th>Pareja</th><th>PJ</th><th>PG</th><th>PP</th>
                      <th>Sets</th><th>Dif. sets</th><th>Games</th><th>Dif. games</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabla.filas.map((fila) => (
                      <tr key={fila.parejaId}>
                        <td>{fila.posicion}</td>
                        <td>{nombrePareja(fila.parejaId)}</td>
                        <td>{fila.partidosJugados}</td>
                        <td>{fila.victorias}</td>
                        <td>{fila.derrotas}</td>
                        <td>{fila.setsGanados}-{fila.setsPerdidos}</td>
                        <td>{fila.diferenciaSets}</td>
                        <td>{fila.gamesGanados}-{fila.gamesPerdidos}</td>
                        <td>{fila.diferenciaGames}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {clasificacion?.bloqueadaPorEmpate && (
                <p role="alert">
                  La clasificación está detenida: hay un empate en el corte entre {clasificacion.empateEnCorte
                    .map(nombrePareja).join(", ")}. Resolución configurada: {reglamento.empatePersistente.replaceAll("_", " ")}.
                  El procedimiento todavía no se ejecuta automáticamente.
                </p>
              )}
              {clasificacion && !clasificacion.bloqueadaPorEmpate && (
                <p>
                  Clasificadas: {clasificacion.clasificados.map(nombrePareja).join(", ")}
                </p>
              )}
            </article>
          );
        } catch (error) {
          return (
            <article key={zona.id} role="alert">
              <h5 className="font-semibold">{zona.nombre}</h5>
              <p>{error instanceof Error ? error.message : "No se pudo calcular la tabla."}</p>
            </article>
          );
        }
      })}
    </section>
  );
}
