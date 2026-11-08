import type { FilaRankingPublico } from "../../../../domain/ranking/ranking.circuito";

interface Props {
  filas: FilaRankingPublico[];
}

export default function TablaRankingPublico({ filas }: Props) {
  if (filas.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-[var(--color-text-muted)] m-0">
        Todavía no hay jugadores en este ranking.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            <th className="py-2 pr-3 font-medium">#</th>
            <th className="py-2 pr-3 font-medium">Jugador</th>
            <th className="py-2 pr-3 font-medium">Categoría</th>
            <th className="py-2 pr-3 text-right font-medium">Torneos</th>
            <th className="py-2 text-right font-medium">Puntos</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, indice) => (
            <tr
              key={`${fila.posicion}-${fila.apellido}-${fila.nombre}-${indice}`}
              className="border-b border-white/5 text-slate-200"
            >
              <td className="py-2.5 pr-3 font-mono text-[var(--color-accent)]">
                {fila.posicion}
              </td>
              <td className="py-2.5 pr-3">
                <span className="font-semibold text-white">
                  {fila.nombre} {fila.apellido}
                </span>
                {fila.apodo && (
                  <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                    “{fila.apodo}”
                  </span>
                )}
              </td>
              <td className="py-2.5 pr-3">{fila.categoria ?? "—"}</td>
              <td className="py-2.5 pr-3 text-right">{fila.competenciasJugadas}</td>
              <td className="py-2.5 text-right font-bold text-white">{fila.puntos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
