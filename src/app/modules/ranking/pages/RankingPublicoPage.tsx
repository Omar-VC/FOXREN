import { useMemo, useState } from "react";

import type { GeneroCompetencia } from "../../../../domain/competencia/competencia.types";
import TablaRankingPublico from "../components/TablaRankingPublico";
import { useRankingsPublicos } from "../hooks/useRankingsPublicos";

const GENEROS: { valor: GeneroCompetencia; etiqueta: string }[] = [
  { valor: "MASCULINO", etiqueta: "Masculino" },
  { valor: "FEMENINO", etiqueta: "Femenino" },
  { valor: "MIXTO", etiqueta: "Mixto" },
];

const CLASE_SELECT =
  "rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white focus:border-[var(--color-accent)] focus:outline-none";

export default function RankingPublicoPage() {
  const { rankings, cargando, error } = useRankingsPublicos();
  const [circuitoElegido, setCircuitoElegido] = useState("");
  const [genero, setGenero] = useState<GeneroCompetencia>("MASCULINO");

  const circuitos = useMemo(() => {
    const porId = new Map<string, string>();
    for (const ranking of rankings) {
      porId.set(ranking.circuitoId, ranking.circuitoNombre);
    }
    return [...porId.entries()].map(([id, nombre]) => ({ id, nombre }));
  }, [rankings]);

  const circuitoId = circuitoElegido || circuitos[0]?.id || "";
  const ranking = rankings.find(
    (item) => item.circuitoId === circuitoId && item.genero === genero,
  );

  if (cargando) {
    return (
      <p className="py-12 text-center text-xs text-[var(--color-text-muted)]">
        Cargando ranking...
      </p>
    );
  }

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white tracking-tight m-0">Ranking</h1>
        <p className="text-xs text-[var(--color-text-muted)] m-0">
          Posiciones por circuito. Solo aparecen los jugadores que autorizaron su publicación.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          ⚠️ {error}
        </div>
      )}

      {circuitos.length === 0 && !error ? (
        <p className="py-8 text-center text-xs text-[var(--color-text-muted)]">
          Todavía no hay rankings publicados.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            {circuitos.length > 1 && (
              <select
                value={circuitoId}
                onChange={(e) => setCircuitoElegido(e.target.value)}
                className={CLASE_SELECT}
                aria-label="Circuito"
              >
                {circuitos.map((circuito) => (
                  <option key={circuito.id} value={circuito.id}>
                    {circuito.nombre}
                  </option>
                ))}
              </select>
            )}

            <div className="flex gap-2">
              {GENEROS.map((item) => (
                <button
                  key={item.valor}
                  type="button"
                  onClick={() => setGenero(item.valor)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                    genero === item.valor
                      ? "border-[var(--color-accent)] bg-[#32113d] text-[var(--color-accent)]"
                      : "border-white/10 text-slate-300 hover:border-white/30"
                  }`}
                >
                  {item.etiqueta}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-3">
            {ranking && (
              <p className="text-xs text-[var(--color-text-muted)] m-0">
                {ranking.circuitoNombre} · Temporada {ranking.temporada}
              </p>
            )}
            <TablaRankingPublico filas={ranking?.filas ?? []} />
          </div>
        </>
      )}
    </section>
  );
}
