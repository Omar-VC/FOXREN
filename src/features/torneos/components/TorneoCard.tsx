import React from 'react';
import type { Torneo } from '../../../domain/torneo/torneo.types';

interface TorneoCardProps {
  torneo: Torneo;
  competencias: any[];
  onVerDetalles: (torneo: Torneo) => void;
  onVerTorneo: (torneo: Torneo) => void;
  onGestionar: (torneo: Torneo) => void;
}

// Helper robusto para formatear cualquier tipo de fecha
const formatearFecha = (fecha: any): string => {
  if (!fecha) return 'A confirmar';

  // Si es Timestamp de Firestore (tiene método .toDate())
  if (typeof fecha === 'object' && typeof fecha.toDate === 'function') {
    return fecha.toDate().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // Si tiene propiedades seconds (Timestamp en estado plano)
  if (typeof fecha === 'object' && 'seconds' in fecha) {
    return new Date(fecha.seconds * 1000).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // Si es un objeto Date
  if (fecha instanceof Date) {
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // Si ya es un string legible
  return String(fecha);
};

export const TorneoCard: React.FC<TorneoCardProps> = ({
  torneo,
  competencias,
  onVerDetalles,
  onVerTorneo,
  onGestionar,
}) => {
  const compsTorneo = competencias.filter((c: any) => c.torneoId === torneo.id);
  const generosDisponibles = Array.from(
    new Set(compsTorneo.map((c: any) => c.genero).filter(Boolean))
  );

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition flex flex-col justify-between space-y-4 shadow-xl">
      {/* Header de la tarjeta */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            🟢 {torneo.estado?.replace('_', ' ') || 'INSCRIPCION ABIERTA'}
          </span>

          {torneo.validoParaRanking && (
            <span className="text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
              🏆 Suma Puntos
            </span>
          )}

          {generosDisponibles.map((gen: any, idx) => (
            <span
              key={idx}
              className="text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full capitalize"
            >
              {String(gen).toLowerCase()}
            </span>
          ))}
        </div>

        <h3 className="text-xl font-extrabold text-white tracking-tight">
          {torneo.nombre}
        </h3>

        <p className="text-xs text-slate-400 flex items-center gap-1 font-medium">
          📍 Sede: <span className="text-slate-200">{torneo.sede || 'A confirmar'}</span>
        </p>
      </div>

      {/* Resumen de Dimensión y Fecha limpia */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-medium block">📅 Fecha</span>
          <span className="text-slate-200 font-semibold truncate block">
            {formatearFecha(torneo.fechaInicio)}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-medium block">🎁 Premiación</span>
          <span className="text-amber-400 font-extrabold truncate block">
            {torneo.premios || 'A confirmar'}
          </span>
        </div>
      </div>

      {/* Acciones de la Tarjeta */}
      <div className="flex flex-col gap-2 pt-3 border-t border-slate-800/80">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onVerDetalles(torneo)}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-3 rounded-xl transition cursor-pointer text-center shadow-md shadow-blue-600/20"
          >
            🔍 Ver Detalles
          </button>

          <button
            type="button"
            onClick={() => onVerTorneo(torneo)}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold py-2 px-3 rounded-xl transition cursor-pointer text-center border border-slate-700"
          >
            🏆 Ver Torneo
          </button>
        </div>

        <button
          type="button"
          onClick={() => onGestionar(torneo)}
          className="w-full text-center bg-slate-950/50 hover:bg-slate-800 text-slate-400 hover:text-blue-400 font-medium py-1.5 rounded-lg text-[11px] transition cursor-pointer border border-slate-800/60"
        >
          ⚙️ Gestionar Torneo
        </button>
      </div>
    </div>
  );
};