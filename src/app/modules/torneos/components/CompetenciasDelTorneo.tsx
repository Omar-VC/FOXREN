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
          <ul>
            {competencias.map((competencia) => (
              <li key={competencia.id}>
                <strong>{competencia.nombre}</strong>
                {" — "}
                {competencia.genero}
                {" — "}
                {competencia.estado}
              </li>
            ))}
          </ul>
        )}
    </section>
  );
}