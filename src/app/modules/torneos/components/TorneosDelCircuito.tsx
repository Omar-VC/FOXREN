import type { Torneo } from "../../../../domain/torneo/torneo.types";

interface Props {
  torneos: Torneo[];
  cargando: boolean;
  error: string | null;
}

export default function TorneosDelCircuito({
  torneos,
  cargando,
  error,
}: Props) {
  return (
    <section>
      <h2>Torneos</h2>

      {cargando && (
        <p>Cargando torneos...</p>
      )}

      {error && (
        <p>{error}</p>
      )}

      {!cargando &&
        !error &&
        torneos.length === 0 && (
          <p>
            Este circuito todavía no tiene
            torneos registrados.
          </p>
        )}

      {!cargando &&
        torneos.length > 0 && (
          <ul>
            {torneos.map((torneo) => (
              <li key={torneo.id}>
                <strong>{torneo.nombre}</strong>
                {" — "}
                {torneo.estado}
              </li>
            ))}
          </ul>
        )}
    </section>
  );
}