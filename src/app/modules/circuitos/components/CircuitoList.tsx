import { Link } from "react-router-dom";

import type { Circuito } from "../../../../domain/circuito/circuito.types";

interface Props {
  circuitos: Circuito[];
}

export default function CircuitoList({ circuitos }: Props) {
  if (circuitos.length === 0) {
    return <p>No hay circuitos registrados.</p>;
  }

  return (
    <ul>
      {circuitos.map((circuito) => (
        <li key={circuito.id}>
          <Link to={`/circuitos/${circuito.id}`}>
            {circuito.nombre}
          </Link>

          {" — "}

          {circuito.temporada}
        </li>
      ))}
    </ul>
  );
}