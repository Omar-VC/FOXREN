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
          <ul>
            {complejos.map((complejo) => (
              <li key={complejo.id}>
                <strong>{complejo.nombre}</strong>
                {" — "}
                {complejo.ciudad},{" "}
                {complejo.provincia}
                {" — "}
                {complejo.cantidadCanchas} canchas
              </li>
            ))}
          </ul>
        )}
    </section>
  );
}