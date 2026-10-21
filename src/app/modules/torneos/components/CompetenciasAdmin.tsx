import CompetenciaForm from "./CompetenciaForm";
import { Link } from "react-router-dom";

import { useCompetenciasPorTorneo } from "../hooks/useCompetenciasPorTorneo";

interface Props {
  torneoId: string;
}

export default function CompetenciasAdmin({ torneoId }: Props) {
  const { competencias, cargando, creando, error, crearCompetencia } =
    useCompetenciasPorTorneo(torneoId);

  return (
    <section>
      <h3>Competencias</h3>

      {error && <p>{error}</p>}

      <CompetenciaForm
        torneoId={torneoId}
        creando={creando}
        onCrear={crearCompetencia}
      />

      <hr />

      {cargando && <p>Cargando competencias...</p>}

      {!cargando && competencias.length === 0 && (
        <p>Este torneo todavía no tiene competencias.</p>
      )}

      {!cargando && competencias.length > 0 && (
        <ul className="fox-card-grid">
          {competencias.map((competencia) => (
            <li className="fox-card" key={competencia.id}>
              <Link
                to={`/admin/torneos/${torneoId}/competencias/${competencia.id}`}
              >
                <strong>{competencia.nombre}</strong>
              </Link>
              <p className="fox-card-meta">{competencia.genero} · {competencia.estado}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
