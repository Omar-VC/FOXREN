import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { torneosRepository } from "../../../../infrastructure/repositories/torneosRepository";

import type { Torneo } from "../../../../domain/torneo/torneo.types";
import { useCompetenciasPorTorneo } from "../hooks/useCompetenciasPorTorneo";
import CompetenciasDelTorneo from "../components/CompetenciasDelTorneo";

export default function TorneoDetallePage() {
  const { torneoId } = useParams();

  const {
    competencias,
    cargando: cargandoCompetencias,
    error: errorCompetencias,
  } = useCompetenciasPorTorneo(torneoId ?? "");

  const [torneo, setTorneo] = useState<Torneo | null>(null);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarTorneo() {
      if (!torneoId) {
        setCargando(false);
        return;
      }

      try {
        setError(null);

        const datos = await torneosRepository.obtenerTorneoPorId(torneoId);

        setTorneo(datos);
      } catch {
        setError("No se pudo cargar el torneo.");
      } finally {
        setCargando(false);
      }
    }

    cargarTorneo();
  }, [torneoId]);

  if (cargando) {
    return <p>Cargando torneo...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!torneo) {
    return <p>Torneo no encontrado.</p>;
  }

  return (
    <section>
      <h1>{torneo.nombre}</h1>

      <p>Estado: {torneo.estado}</p>

      <p>Modalidad: {torneo.modalidad}</p>

      <p>Fecha de inicio: {torneo.fechaInicio.toLocaleDateString()}</p>

      {torneo.fechaFin && (
        <p>Fecha de fin: {torneo.fechaFin.toLocaleDateString()}</p>
      )}

      <p>Contacto: {torneo.contactoOrganizador}</p>

      <hr />

      <CompetenciasDelTorneo
        competencias={competencias}
        cargando={cargandoCompetencias}
        error={errorCompetencias}
      />
    </section>
  );
}
