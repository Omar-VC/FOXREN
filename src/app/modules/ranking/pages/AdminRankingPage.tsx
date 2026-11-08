import { useState } from "react";

import { actualizarTodosLosRankings } from "../../../../application/ranking/actualizarRankingsCircuito";
import type { ResultadoRankingCircuito } from "../../../../application/ranking/actualizarRankingsCircuito";

/**
 * Administración del ranking (superadmin). Los rankings se actualizan solos al
 * cargar un resultado y al aprobar un jugador; este botón los recalcula todos,
 * por ejemplo después de cambiar la tabla de puntos o el permiso de un jugador.
 */
export default function AdminRankingPage() {
  const [trabajando, setTrabajando] = useState(false);
  const [resultados, setResultados] = useState<ResultadoRankingCircuito[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function recalcular() {
    setTrabajando(true);
    setError(null);
    try {
      setResultados(await actualizarTodosLosRankings());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron recalcular los rankings.");
    } finally {
      setTrabajando(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white tracking-tight m-0">Ranking</h1>
        <p className="text-xs text-[var(--color-text-muted)] m-0">
          Los rankings se actualizan solos al cargar un resultado y al aprobar un jugador.
          Usá este botón para recalcular todos los circuitos manualmente.
        </p>
      </div>

      <button
        type="button"
        onClick={() => void recalcular()}
        disabled={trabajando}
        className="fox-button-primary text-xs py-2.5 px-4 font-semibold disabled:opacity-50"
      >
        {trabajando ? "Recalculando..." : "Recalcular todos los rankings"}
      </button>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          ⚠️ {error}
        </div>
      )}

      {resultados && resultados.length === 0 && (
        <p className="text-xs text-[var(--color-text-muted)] m-0">
          No hay circuitos creados: no hay rankings que publicar.
        </p>
      )}

      {resultados && resultados.length > 0 && (
        <ul className="space-y-3 p-0 m-0 list-none">
          {resultados.map((item) => (
            <li
              key={item.circuitoId}
              className="bg-black/20 border border-white/5 rounded-2xl p-4 space-y-1"
            >
              <strong className="text-sm text-white">{item.circuitoNombre}</strong>
              {item.error ? (
                <p className="text-xs text-red-400 m-0">No se pudo actualizar: {item.error}</p>
              ) : item.resumen ? (
                <p className="text-xs text-[var(--color-text-muted)] m-0">
                  Jugadores: {item.resumen.jugadoresTotales} · con permiso de publicación:{" "}
                  {item.resumen.jugadoresConPermiso} · en el ranking: masculino{" "}
                  {item.resumen.filasPorGenero.MASCULINO}, femenino{" "}
                  {item.resumen.filasPorGenero.FEMENINO}, mixto{" "}
                  {item.resumen.filasPorGenero.MIXTO}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
