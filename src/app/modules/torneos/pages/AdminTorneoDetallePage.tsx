import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { torneosRepository } from "../../../../infrastructure/repositories/torneosRepository";
import type { Torneo } from "../../../../domain/torneo/torneo.types";
import CompetenciasAdmin from "../components/CompetenciasAdmin";

export default function AdminTorneoDetallePage() {
  const { torneoId } = useParams();
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
        setError("No se pudo cargar la información del torneo.");
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

  if (error || !torneo) {
    return (
      <section className="p-8 text-center space-y-4">
        <p className="text-red-500 font-medium">{error || "Torneo no encontrado."}</p>
        <Link to="/admin/torneos" className="fox-button-primary inline-block">
          Volver a Torneos
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera y navegación superior */}
      <div>
        <Link
          to="/admin/torneos"
          className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors inline-block mb-3 no-underline"
        >
          ← Volver al listado de torneos
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="admin-page-title m-0">{torneo.nombre}</h1>
            <p className="admin-page-description mt-1">
              Panel de administración y gestión de competencias del torneo.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#32113d] text-[var(--color-accent)] border border-[var(--color-border)]">
            {torneo.estado ?? "Activo"}
          </span>
        </div>
      </div>

      {/* Gestión interna de competencias del torneo */}
      <div className="fox-card space-y-4">
        <CompetenciasAdmin torneoId={torneo.id} />
      </div>
    </div>
  );
}