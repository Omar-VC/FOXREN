import { Link } from "react-router-dom";

import type { Competencia } from "../../../../domain/competencia/competencia.types";

interface Props {
  competencias: Competencia[];
  cargando: boolean;
  error: string | null;
}

export default function CompetenciasDelTorneo({
  competencias,
  cargando,
  error,
}: Props) {
  return (
    <section>
      <h2>Competencias</h2>

      {cargando && (
        <p>Cargando competencias...</p>
      )}

      {error && (
        <p>{error}</p>
      )}

      {!cargando &&
        !error &&
        competencias.length === 0 && (
          <p>
            Este torneo todavía no tiene
            competencias registradas.
          </p>
        )}

      {!cargando &&
        competencias.length > 0 && (
          <ul className="fox-card-grid">
            {competencias.map((competencia) => (
              <li key={competencia.id} className="list-none">
                <Link
                  to={`/torneos/${competencia.torneoId}/competencias/${competencia.id}`}
                  className="fox-card group block no-underline transition-all hover:border-[var(--color-accent)]"
                >
                  <strong>{competencia.nombre}</strong>
                  <p className="fox-card-meta">{competencia.genero} · {competencia.estado}</p>
                  <span className="text-xs font-semibold text-[var(--color-accent)]">
                    Ver zonas, partidos y resultados →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
    </section>
  );
}
