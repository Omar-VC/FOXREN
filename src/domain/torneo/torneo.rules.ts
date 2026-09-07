// src/domain/torneo/torneo.rules.ts

import type { Torneo } from './torneo.types';

export const puedeInscribirseATorneo = (torneo: Torneo): boolean => {
  return (
    torneo.estado === "INSCRIPCION_ABIERTA" ||
    torneo.estado === "EN_CURSO"
  );
};

export const estaTorneoFinalizado = (torneo: Torneo): boolean => {
  return torneo.estado === "FINALIZADO";
};