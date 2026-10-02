import React from "react";
import type { EstadoCompetencia } from "../../../../domain/competencia/competencia.types";

interface Props {
  estadoActual: EstadoCompetencia;
  onChangeEstado: (nuevoEstado: EstadoCompetencia) => Promise<void> | void;
  disabled?: boolean;
}

const ESTADOS_CONFIG: Record<
  EstadoCompetencia,
  { label: string; color: string }
> = {
  borrador: {
    label: "Borrador",
    color: "bg-slate-100 text-slate-700 border-slate-300",
  },
  inscripciones_abiertas: {
    label: "Inscripciones Abiertas",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  inscripciones_cerradas: {
    label: "Inscripciones Cerradas",
    color: "bg-amber-100 text-amber-800 border-amber-300",
  },
  en_curso: {
    label: "En Curso",
    color: "bg-blue-100 text-blue-800 border-blue-300",
  },
  finalizada: {
    label: "Finalizada",
    color: "bg-purple-100 text-purple-800 border-purple-300",
  },
  cancelada: {
    label: "Cancelada",
    color: "bg-rose-100 text-rose-800 border-rose-300",
  },
};

export const CompetenciaEstadoSelector: React.FC<Props> = ({
  estadoActual,
  onChangeEstado,
  disabled = false,
}) => {
  return (
    <select
      value={estadoActual}
      disabled={disabled}
      onChange={(e) => onChangeEstado(e.target.value as EstadoCompetencia)}
      className={`px-3 py-1 text-xs font-semibold rounded-lg border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 ${
        ESTADOS_CONFIG[estadoActual]?.color || "bg-slate-100 text-slate-800 border-slate-300"
      }`}
    >
      {(Object.keys(ESTADOS_CONFIG) as EstadoCompetencia[]).map((key) => (
        <option key={key} value={key} className="bg-white text-slate-900 font-medium">
          {ESTADOS_CONFIG[key].label}
        </option>
      ))}
    </select>
  );
};