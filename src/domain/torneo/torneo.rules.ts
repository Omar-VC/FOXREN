// src/domain/torneo/torneo.rules.ts
import type { Torneo } from './torneo.types';

export const puedeInscribirseATorneo = (torneo: Torneo): boolean => {
  if (!torneo) return false;
  // Se permite inscripción si el torneo está en estado PROXIMO o EN_JUEGO
  return torneo.estado === 'PROXIMO' || torneo.estado === 'EN_JUEGO';
};

export const esTorneoFinalizado = (torneo: Torneo): boolean => {
  return torneo?.estado === 'FINALIZADO';
};