// src/infrastructure/firebase/collections.ts

export const COLLECTIONS = {
  jugadores: "jugadores",
  solicitudesRegistro: "solicitudes_registro",

  circuitos: "circuitos",
  complejos: "complejos",

  torneos: "torneos",
  competencias: "competencias",
  categorias: "categorias",
  inscripciones: "inscripciones",

  zonas: "zonas",
  partidos: "partidos",

  rankings: "rankings",
} as const;

export const ZONAS_COLLECTION = COLLECTIONS.zonas;
export const PARTIDOS_COLLECTION = COLLECTIONS.partidos;