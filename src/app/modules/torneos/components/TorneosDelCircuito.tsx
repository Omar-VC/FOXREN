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
          <ul className="fox-card-grid">
            {torneos.map((torneo) => (
              <li className="fox-card" key={torneo.id}>
                <strong>{torneo.nombre}</strong>
                <p className="fox-card-meta">{torneo.estado}</p>
              </li>
            ))}
          </ul>
        )}
    </section>
  );
}
