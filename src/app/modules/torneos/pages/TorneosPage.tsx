import { Link } from "react-router-dom";

import { useTorneos } from "../hooks/useTorneos";

export default function TorneosPage() {
  const {
    torneos,
    cargando,
    error,
  } = useTorneos();

  if (cargando) {
    return <p>Cargando torneos...</p>;
  }

  return (
    <section>
      <h1>Torneos</h1>

      {error && <p>{error}</p>}

      {torneos.length === 0 ? (
        <p>No hay torneos registrados.</p>
      ) : (
        <ul className="fox-card-grid">
          {torneos.map((torneo) => (
            <li className="fox-card" key={torneo.id}>
              <Link to={`/torneos/${torneo.id}`}>
                {torneo.nombre}
              </Link>
              <p className="fox-card-meta">{torneo.estado}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
