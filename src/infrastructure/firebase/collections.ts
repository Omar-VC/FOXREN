// src/infrastructure/firebase/collections.ts

export const COLLECTIONS = {
  jugadores: "jugadores",
  solicitudesRegistro: "solicitudes_registro",
  torneos: "torneos",
  competencias: "competencias",
  inscripciones: "inscripciones",
  rankings: "rankings",
  circuitos: "circuitos",
  llavesOrganizadores: "llaves_organizadores",
  zonas: "zonas",
  partidos: "partidos",
} as const;

// Exportaciones individuales para mantener compatibilidad si algún archivo antiguo las usa directa
export const ZONAS_COLLECTION = COLLECTIONS.zonas;
export const PARTIDOS_COLLECTION = COLLECTIONS.partidos;