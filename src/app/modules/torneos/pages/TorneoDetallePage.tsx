import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

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
    return (
      <section className="p-8 text-center">
        <p className="text-muted">Cargando detalles del torneo...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="p-8 text-center">
        <p className="text-red-500 font-medium">{error}</p>
      </section>
    );
  }

  if (!torneo) {
    return (
      <section className="p-8 text-center space-y-4">
        <p className="text-muted">Torneo no encontrado.</p>
        <Link to="/torneos" className="fox-button-primary inline-block">
          Volver a Torneos
        </Link>
      </section>
    );
  }

  const fechaInicioTexto = torneo.fechaInicio
    ? torneo.fechaInicio instanceof Date
      ? torneo.fechaInicio.toLocaleDateString( "es-AR", { timeZone: "UTC" })
      : String(torneo.fechaInicio)
    : "A confirmar";

  const fechaFinTexto = torneo.fechaFin
    ? torneo.fechaFin instanceof Date
      ? torneo.fechaFin.toLocaleDateString("es-AR", { timeZone: "UTC" })
      : String(torneo.fechaFin)
    : null;

  return (
    <div className="space-y-8">
      {/* Banner / Cabecera Institucional del Torneo */}
      <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-2xl bg-[#211b25] p-6 md:p-8 flex flex-col justify-between gap-6">
        <div className="absolute inset-0 bg-gradient-to-r from-[#660090]/20 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--color-primary)] text-white shadow">
              {torneo.estado ?? "Activo"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#32113d] text-[var(--color-accent)] border border-[var(--color-border)]">
              Modalidad: {torneo.modalidad || "General"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white m-0 tracking-tight">
            {torneo.nombre}
          </h1>
        </div>

        {/* Datos clave del torneo en grilla limpia */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border)] text-sm">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
            <span className="text-lg">📅</span>
            <div>
              <span className="block text-xs">Fecha de Inicio</span>
              <strong className="text-white">{fechaInicioTexto}</strong>
            </div>
          </div>
          {fechaFinTexto && (
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <span className="text-lg">🏁</span>
              <div>
                <span className="block text-xs">Fecha de Finalización</span>
                <strong className="text-white">{fechaFinTexto}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN DE COMPETENCIAS / CATEGORÍAS */}
      <section className="space-y-4">
        <CompetenciasDelTorneo
          competencias={competencias}
          cargando={cargandoCompetencias}
          error={errorCompetencias}
        />
      </section>
    </div>
  );
}