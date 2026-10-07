import TorneoForm from "../components/TorneoForm";
import { useTorneos } from "../hooks/useTorneos";
import CompetenciasAdmin from "../components/CompetenciasAdmin";

export default function AdminTorneosPage() {
  const { torneos, cargando, creando, error, crearTorneo } = useTorneos();

  if (cargando) {
    return <p>Cargando torneos...</p>;
  }

  return (
    <section>
      <h1 className="admin-page-title">Administrar torneos</h1>

      <p className="admin-page-description">
        Creá y administrá los torneos de FOXREN.
      </p>

      {error && <p>{error}</p>}

      <TorneoForm creando={creando} onCrear={crearTorneo} />

      <hr />

      <h2>Torneos registrados</h2>

      {torneos.length === 0 ? (
        <p>No hay torneos registrados.</p>
      ) : (
        <ul>
          {torneos.map((torneo) => (
            <li key={torneo.id}>
              <strong>{torneo.nombre}</strong>

              {" — "}

              {torneo.estado}

              <CompetenciasAdmin torneoId={torneo.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
