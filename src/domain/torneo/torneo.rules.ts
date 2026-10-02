// src/domain/torneo/torneo.rules.ts
import type { Torneo } from './torneo.types';

export const esTorneoAprobado = (torneo: Torneo): boolean => {
  if (!torneo) return false;
  return torneo.estado === 'APROBADO';
};

export const torneoPendienteAprobacion = (torneo: Torneo): boolean => {
  return torneo?.estado === 'PENDIENTE_APROBACION';
};