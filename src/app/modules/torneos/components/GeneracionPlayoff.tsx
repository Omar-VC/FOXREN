import type { Competencia } from "../../../../domain/competencia/competencia.types";
import type { PlanPlayoff } from "../../../../domain/competencia/competencia.playoff.preparacion";
import type { Zona } from "../../../../domain/competencia/competencia.zonas.types";
import { etiquetaFase } from "../../../../domain/competencia/competencia.playoff.rules";

interface Props {
  competencia: Competencia;
  /** Resultado de planificarPlayoff con los datos actuales (null mientras no se puede calcular). */
  plan: PlanPlayoff | null;
  zonas: Zona[];
  nombrePareja: (parejaId: string) => string;
  generando: boolean;
  error: string | null;
  onGenerar: () => void;
}

const CAJA =
  "bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--border-radius)] p-5 shadow-lg";

export default function GeneracionPlayoff({
  competencia,
  plan,
  zonas,
  nombrePareja,
  generando,
  error,
  onGenerar,
}: Props) {
  const esDirecta = competencia.formato === "eliminacion_directa";

  if (competencia.playoffGenerado) return null;
  if (!esDirecta && !competencia.zonasGeneradas) return null;

  const estadoOk = esDirecta
    ? competencia.estado === "inscripciones_cerradas"
    : competencia.estado === "inscripciones_cerradas" || competencia.estado === "en_curso";

  const zonaDe = (parejaId: string) =>
    zonas.find((zona) => zona.parejaIds.includes(parejaId))?.nombre;

  const puedeGenerar = estadoOk && plan?.ok === true && !generando;

  return (
    <div className={CAJA}>
      <h3 className="text-lg font-semibold text-slate-100 mb-1">
        {esDirecta ? "Generar llave" : "Generar playoff"}
      </h3>

      {esDirecta && !estadoOk && (
        <p className="text-sm text-slate-400 mb-3">
          Cerrá las inscripciones para poder generar la llave.
        </p>
      )}

      {plan && !plan.ok && (
        <div className="mb-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
          <p className="text-sm font-medium text-amber-200 mb-1">
            Todavía no se puede armar el playoff:
          </p>
          <ul className="list-disc pl-5 text-sm text-amber-100 space-y-0.5">
            {plan.bloqueos.map((bloqueo) => (
              <li key={bloqueo}>{bloqueo}</li>
            ))}
          </ul>
        </div>
      )}

      {plan?.ok && (
        <>
          <p className="text-sm text-slate-400 mb-3">
            {plan.cuadro.cantidadParejas} parejas · cuadro de {plan.cuadro.tamano} ·{" "}
            {plan.cuadro.byes} {plan.cuadro.byes === 1 ? "bye" : "byes"} ·{" "}
            {plan.cuadro.totalRondas} rondas. Vista previa: se genera igual que se ve acá.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Siembra
              </h4>
              <ol className="space-y-1 text-sm">
                {plan.siembra.map((parejaId, indice) => (
                  <li key={parejaId} className="flex gap-2 text-slate-200">
                    <span className="w-6 shrink-0 text-right font-mono text-slate-500">
                      {indice + 1}
                    </span>
                    <span className="truncate">{nombrePareja(parejaId)}</span>
                    {!esDirecta && zonaDe(parejaId) && (
                      <span className="shrink-0 text-xs text-slate-500">
                        ({zonaDe(parejaId)})
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Cruces de primera ronda
              </h4>
              <ul className="space-y-1.5 text-sm">
                {plan.cuadro.partidos
                  .filter((p) => p.ronda === 1)
                  .map((p) => (
                    <li
                      key={p.id}
                      className="rounded border border-slate-700 px-2 py-1 text-slate-200"
                    >
                      <span className="text-xs text-slate-500">
                        {etiquetaFase(p.fase)} {p.partidoNumero}:{" "}
                      </span>
                      {p.esBye
                        ? `${nombrePareja(p.pareja1Id ?? p.pareja2Id ?? "")} — libre (bye)`
                        : `${p.pareja1Id ? nombrePareja(p.pareja1Id) : "?"} vs. ${
                            p.pareja2Id ? nombrePareja(p.pareja2Id) : "?"
                          }`}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {!esDirecta && (
        <details className="mt-4 text-sm text-slate-400">
          <summary className="cursor-pointer text-slate-300">Criterio de cruces</summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              Clasifican las primeras {competencia.parejasClasificanPorZona ?? 2} de cada zona.
            </li>
            <li>Se siembra: primero los 1° de zona, después los 2°, y así.</li>
            <li>
              Dentro de cada posición se ordena por promedio por partido (% de victorias,
              diferencia de sets, diferencia de games), para comparar zonas de distinto tamaño.
            </li>
            <li>Si sigue el empate, desempata un sorteo reproducible.</li>
            <li>Cuadro estándar: mejor sembrado contra el peor; los byes van a los mejores.</li>
            <li>En primera ronda se evita cruzar parejas de la misma zona cuando se puede.</li>
          </ol>
        </details>
      )}

      {error && <p className="mt-3 text-sm text-red-300 whitespace-pre-line">{error}</p>}

      <button
        type="button"
        onClick={onGenerar}
        disabled={!puedeGenerar}
        className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {generando ? "Generando..." : esDirecta ? "Generar llave" : "Generar playoff"}
      </button>
    </div>
  );
}
