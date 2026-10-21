import type { Complejo } from "../../../../domain/complejo/complejo.types";

interface Props {
  complejos: Complejo[];
  cargando: boolean;
  error: string | null;
}

export default function ComplejosDelCircuito({
  complejos,
  cargando,
  error,
}: Props) {
  return (
    <section>
      <h2>Complejos asociados</h2>

      {cargando && (
        <p>Cargando complejos...</p>
      )}

      {error && (
        <p>{error}</p>
      )}

      {!cargando &&
        !error &&
        complejos.length === 0 && (
          <p>
            Este circuito todavía no tiene
            complejos asociados.
          </p>
        )}

      {!cargando &&
        complejos.length > 0 && (
          <ul className="fox-card-grid">
            {complejos.map((complejo) => (
              <li className="fox-card" key={complejo.id}>
                <strong>{complejo.nombre}</strong>
                <p className="fox-card-meta">{complejo.ciudad}, {complejo.provincia}</p>
                <p>{complejo.cantidadCanchas} canchas</p>
              </li>
            ))}
          </ul>
        )}
    </section>
  );
}
