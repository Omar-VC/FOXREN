import React from 'react';
import type { Torneo } from '../../../domain/torneo/torneo.types';

interface CompetenciaResumen {
  id: string;
  torneoId: string;
  genero?: string;
  categoria?: string;
  [key: string]: any;
}

interface TorneoCardProps {
  torneo: Torneo;
  competencias: CompetenciaResumen[];
  onVerDetalles: (torneo: Torneo) => void;
  onVerTorneo: (torneo: Torneo) => void;
  onGestionar: (torneo: Torneo) => void;
}

// Helper robusto para formatear fechas de Firestore, Date u Objetos planos
const formatearFecha = (fecha: any): string => {
  if (!fecha) return 'A confirmar';

  // Firestore Timestamp con método .toDate()
  if (typeof fecha === 'object' && typeof fecha.toDate === 'function') {
    return fecha.toDate().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // Firestore Timestamp deserializado ({ seconds, nanoseconds })
  if (typeof fecha === 'object' && 'seconds' in fecha) {
    return new Date(fecha.seconds * 1000).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // Objeto Date nativo
  if (fecha instanceof Date) {
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  return String(fecha);
};

// Helper visual para colores de estado del torneo
const getEstadoBadgeConfig = (estado?: string) => {
  switch (estado) {
    case 'INSCRIPCION_ABIERTA':
      return {
        label: '🟢 Inscripción Abierta',
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      };
    case 'PENDIENTE_APROBACION':
      return {
        label: '🟡 En Revisión',
        className: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      };
    case 'EN_CURSO':
      return {
        label: '🔵 En Curso',
        className: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      };
    case 'FINALIZADO':
      return {
        label: '⚪ Finalizado',
        className: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      };
    default:
      return {
        label: `🟢 ${estado?.replace('_', ' ') || 'Inscripción Abierta'}`,
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      };
  }
};

export const TorneoCard: React.FC<TorneoCardProps> = ({
  torneo,
  competencias,
  onVerDetalles,
  onVerTorneo,
  onGestionar,
}) => {
  const compsTorneo = competencias.filter((c) => c.torneoId === torneo.id);
  const generosDisponibles = Array.from(
    new Set(compsTorneo.map((c) => c.genero).filter(Boolean))
  );

  const estadoBadge = getEstadoBadgeConfig(torneo.estado);

  return (
    <div className="bg-fox-surface border border-fox-border hover:border-fox-subtle rounded-2xl p-5 transition flex flex-col justify-between space-y-4 shadow-xl">
      {/* Header de la tarjeta */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${estadoBadge.className}`}>
            {estadoBadge.label}
          </span>

          {torneo.validoParaRanking && (
            <span className="text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
              🏆 Suma Puntos
            </span>
          )}

          {generosDisponibles.map((gen, idx) => (
            <span
              key={idx}
              className="text-[10px] font-semibold bg-fox-bg/80 text-slate-300 border border-fox-border px-2 py-0.5 rounded-full capitalize"
            >
              {String(gen).toLowerCase()}
            </span>
          ))}
        </div>

        <h3 className="text-xl font-extrabold text-white tracking-tight leading-snug">
          {torneo.nombre}
        </h3>

        <p className="text-xs text-fox-muted flex items-center gap-1 font-medium">
          📍 Sede: <span className="text-slate-200">{torneo.sede || 'A confirmar'}</span>
        </p>
      </div>

      {/* Resumen de Fecha y Premiación */}
      <div className="bg-fox-bg/60 border border-fox-border/80 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[10px] text-fox-muted font-medium block">📅 Fecha</span>
          <span className="text-slate-200 font-semibold truncate block">
            {formatearFecha(torneo.fechaInicio)}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-fox-muted font-medium block">🎁 Premiación</span>
          <span className="text-amber-400 font-extrabold truncate block">
            {torneo.premios || 'A confirmar'}
          </span>
        </div>
      </div>

      {/* Acciones de la Tarjeta */}
      <div className="flex flex-col gap-2 pt-3 border-t border-fox-border/80">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onVerDetalles(torneo)}
            className="flex-1 bg-fox-neon hover:bg-emerald-400 text-fox-bg text-xs font-bold py-2 px-3 rounded-xl transition cursor-pointer text-center shadow-fox-glow"
          >
            🔍 Ver Detalles
          </button>

          <button
            type="button"
            onClick={() => onVerTorneo(torneo)}
            className="flex-1 bg-fox-surface hover:bg-fox-border text-slate-200 hover:text-white text-xs font-semibold py-2 px-3 rounded-xl transition cursor-pointer text-center border border-fox-border"
          >
            🏆 Ver Torneo
          </button>
        </div>

        <button
          type="button"
          onClick={() => onGestionar(torneo)}
          className="w-full text-center bg-fox-bg/50 hover:bg-fox-surface text-fox-muted hover:text-fox-neon font-medium py-1.5 rounded-lg text-[11px] transition cursor-pointer border border-fox-border/60"
        >
          ⚙️ Gestionar Torneo
        </button>
      </div>
    </div>
  );
};