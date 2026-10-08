import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import type { Competencia } from "../../../../domain/competencia/competencia.types";
import { competenciasRepository } from "../../../../infrastructure/repositories/competenciasRepository";
import ParejasAdmin from "../components/ParejasAdmin";

export default function CompetenciaAdminPage() {
  const { torneoId, competenciaId } = useParams();

  const [competencia, setCompetencia] =
    useState<Competencia | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarCompetencia() {
      if (!competenciaId) {
        setError("No se indicó una competencia.");
        setCargando(false);
        return;
      }

      try {
        setError(null);

        const datos =
          await competenciasRepository.obtenerPorId(
            competenciaId
          );

        setCompetencia(datos);
      } catch {
        setError(
          "No se pudo cargar la competencia."
        );
      } finally {
        setCargando(false);
      }
    }

    cargarCompetencia();
  }, [competenciaId]);

  if (cargando) {
    return <p>Cargando competencia...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!competencia) {
    return <p>Competencia no encontrada.</p>;
  }

  return (
    <section>
      <p>
        <Link
          to={
            torneoId
              ? `/admin/torneos`
              : "/admin/torneos"
          }
        >
          ← Volver a torneos
        </Link>
      </p>

      <h1 className="admin-page-title">
        {competencia.nombre}
      </h1>

      <p className="admin-page-description">
        Centro operativo de la competencia.
      </p>

      <hr />

      <h2>Información</h2>

      <p>
        Estado: {competencia.estado}
      </p>

      <p>
        Género: {competencia.genero}
      </p>

      <p>
        Cupo máximo:{" "}
        {competencia.cupoMaximoParejas} parejas
      </p>

      <hr />

      <h2>Operación</h2>

      <div>
        <h3>Parejas</h3>
        <ParejasAdmin competenciaId={competencia.id} />
      </div>

      <div>
        <h3>Partidos</h3>
        <p>
          Próximo paso: generar y administrar
          partidos.
        </p>
      </div>

      <div>
        <h3>Resultados</h3>
        <p>
          Próximo paso: cargar y validar resultados.
        </p>
      </div>
    </section>
  );
}