import React, { useState } from "react";
import type { Torneo, EstadoTorneo } from "../../../domain/torneo/torneo.types";
import type { Competencia } from "../../../domain/competencia/competencia.types";
import type { Pareja } from "../../../domain/pareja/pareja.types";

interface TorneoGestionHeaderProps {
  torneo: Torneo;
  competencias: Competencia[];
  parejas: Pareja[];
  tabActiva: "categorias" | "inscriptos" | "partidos" | "config";
  setTabActiva: (tab: "categorias" | "inscriptos" | "partidos" | "config") => void;
  onClose: () => void;
  onToggleInscripciones?: (nuevoEstado: EstadoTorneo) => Promise<void>;
}

export const TorneoGestionHeader: React.FC<TorneoGestionHeaderProps> = ({
  torneo,
  competencias,
  parejas,
  tabActiva,
  setTabActiva,
  onClose,
  onToggleInscripciones,
}) => {
  const [guardandoEstadoTorneo, setGuardandoEstadoTorneo] = useState(false);

  const handleToggleInscripciones = async () => {
    if (!onToggleInscripciones) return;
    const nuevoEstado: EstadoTorneo = torneo.estado === "APROBADO" ? "ARCHIVADO" : "APROBADO";
    setGuardandoEstadoTorneo(true);
    try {
      await onToggleInscripciones(nuevoEstado);
    } catch (error) {
      console.error("Error al cambiar estado del torneo:", error);
    } finally {
      setGuardandoEstadoTorneo(false);
    }
  };

  const totalInscriptos = parejas.length;
  const pagosAprobados = parejas.filter((p) => p.estadoPago === "APROBADO").length;
  const pagosPendientes = parejas.filter((p) => !p.estadoPago || p.estadoPago === "PENDIENTE").length;
  const pagosRechazados = parejas.filter((p) => p.estadoPago === "RECHAZADO").length;

  // Renderizado dinámico según el EstadoTorneo del Dominio
  const renderBadgeEstado = () => {
    switch (torneo.estado) {
      case "APROBADO":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            🟢 APROBADO
          </span>
        );
      case "PENDIENTE_APROBACION":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-amber-500/10 text-amber-400 border-amber-500/20">
            ⏳ PENDIENTE
          </span>
        );
      case "RECHAZADO":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-rose-500/10 text-rose-400 border-rose-500/20">
            🔴 RECHAZADO
          </span>
        );
      case "ARCHIVADO":
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-slate-500/10 text-slate-400 border-slate-500/20">
            📦 ARCHIVADO
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* HEADER PRINCIPAL */}
      <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/95 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 text-blue-400 p-2.5 rounded-2xl border border-blue-500/20">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Panel Admin
              </span>
              
              {renderBadgeEstado()}

              {onToggleInscripciones && (
                <button
                  disabled={guardandoEstadoTorneo}
                  onClick={handleToggleInscripciones}
                  className="text-[11px] font-bold px-3 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
                >
                  {guardandoEstadoTorneo
                    ? "Cargando..."
                    : torneo.estado === "APROBADO"
                    ? "📦 Archivar Torneo"
                    : "🟢 Aprobar Torneo"}
                </button>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-0.5">
              {torneo.nombre}
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 w-9 h-9 rounded-full flex items-center justify-center text-sm transition border border-slate-700/50 shrink-0"
        >
          ✕
        </button>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-950/40 border-b border-slate-800/80 p-3 gap-2.5 text-xs">
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex flex-col justify-center">
          <span className="text-slate-400 text-[11px] font-medium">Total Parejas</span>
          <span className="text-xl font-black text-blue-400 mt-0.5">{totalInscriptos}</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex flex-col justify-center">
          <span className="text-slate-400 text-[11px] font-medium">Aprobados</span>
          <span className="text-xl font-black text-emerald-400 mt-0.5">{pagosAprobados}</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex flex-col justify-center">
          <span className="text-slate-400 text-[11px] font-medium">Pendientes</span>
          <span className="text-xl font-black text-amber-400 mt-0.5">{pagosPendientes}</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex flex-col justify-center">
          <span className="text-slate-400 text-[11px] font-medium">Rechazados</span>
          <span className="text-xl font-black text-rose-400 mt-0.5">{pagosRechazados}</span>
        </div>
      </div>

      {/* TABS NAVBAR */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-1.5 overflow-x-auto shrink-0 z-10">
        {[
          { id: "categorias", label: `🏆 Categorías (${competencias.length})` },
          { id: "inscriptos", label: `👥 Inscriptos (${totalInscriptos})` },
          { id: "partidos", label: "⚔️ Cuadros y Partidos" },
          { id: "config", label: "⚙️ Reglamento y Datos" },
        ].map((tab) => {
          const isSelected = tabActiva === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                isSelected
                  ? "border-blue-500 text-blue-400 bg-slate-800/80 shadow-sm"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </>
  );
};