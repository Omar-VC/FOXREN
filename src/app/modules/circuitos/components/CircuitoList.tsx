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
    <ul className="fox-card-grid">
      {circuitos.map((circuito) => (
        <li className="fox-card" key={circuito.id}>
          <Link to={`/circuitos/${circuito.id}`}>
            {circuito.nombre}
          </Link>
          <p className="fox-card-meta">Temporada {circuito.temporada}</p>
        </li>
      ))}
    </ul>
  );
}
