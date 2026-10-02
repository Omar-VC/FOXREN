import React, { useState, useEffect } from "react";
import { TorneoGestionHeader } from "./TorneoGestionHeader";
import { TorneoCompetenciasTab } from "./tabs/TorneoCompetenciasTab";
import { TorneoInscriptosTab } from "./tabs/TorneoInscriptosTab";
import { TorneoReglamentoTab } from "./tabs/TorneoReglamentoTab";
import { CuadrosYPartidosPanel } from "../competencias-engine/partidos/CuadrosYPartidosPanel";

import type { Torneo, EstadoTorneo } from "../../../domain/torneo/torneo.types";
import type { Competencia, EstadoCompetencia } from "../../../domain/competencia/competencia.types";
import type { Pareja } from "../../../domain/pareja/pareja.types";

interface TorneoGestionPanelProps {
  torneo: Torneo;
  competencias: Competencia[];
  parejas: Pareja[];
  onClose: () => void;
  onCambiarEstadoCompetencia?: (
    competenciaId: string,
    nuevoEstado: EstadoCompetencia,
  ) => Promise<void>;
  onCambiarEstadoPago?: (
    parejaId: string,
    nuevoEstado: "APROBADO" | "RECHAZADO" | "PENDIENTE",
  ) => Promise<void>;
  onEliminarPareja?: (parejaId: string) => Promise<void>;
  onToggleInscripciones?: (nuevoEstado: EstadoTorneo) => Promise<void>;
}

export const TorneoGestionPanel: React.FC<TorneoGestionPanelProps> = ({
  torneo,
  competencias,
  parejas,
  onClose,
  onCambiarEstadoCompetencia,
  onCambiarEstadoPago,
  onEliminarPareja,
  onToggleInscripciones,
}) => {
  const [tabActiva, setTabActiva] = useState<
    "categorias" | "inscriptos" | "partidos" | "config"
  >("categorias");

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 z-50 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full flex flex-col max-h-[94vh] text-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER / NAVBAR DE PESTAÑAS */}
        <TorneoGestionHeader
          torneo={torneo}
          competencias={competencias}
          parejas={parejas}
          tabActiva={tabActiva}
          setTabActiva={setTabActiva}
          onClose={onClose}
          onToggleInscripciones={onToggleInscripciones}
        />

        {/* CONTENIDO SEGÚN LA PESTAÑA ACTIVA */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
          {tabActiva === "categorias" && (
            <TorneoCompetenciasTab
              torneoId={torneo.id}
              competencias={competencias}
              parejas={parejas}
              onCambiarEstadoCompetencia={onCambiarEstadoCompetencia}
            />
          )}

          {tabActiva === "inscriptos" && (
            <TorneoInscriptosTab
              competencias={competencias}
              parejas={parejas}
              onCambiarEstadoPago={onCambiarEstadoPago}
              onEliminarPareja={onEliminarPareja}
            />
          )}

          {tabActiva === "partidos" && (
            <CuadrosYPartidosPanel
              competenciaId={competencias[0]?.id || ""}
              parejasAprobadas={parejas.filter(
                (p) =>
                  p.competenciaId === competencias[0]?.id &&
                  p.estadoPago === "APROBADO",
              )}
            />
          )}

          {tabActiva === "config" && <TorneoReglamentoTab torneo={torneo} />}
        </div>
      </div>
    </div>
  );
};