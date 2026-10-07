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
  parejas: "parejas",

  zonas: "zonas",
  partidos: "partidos",
  resultados: "resultados",
  parejas: "parejas",

  rankings: "rankings",
  historial: "historial",
} as const;

export const ZONAS_COLLECTION = COLLECTIONS.zonas;
export const PARTIDOS_COLLECTION = COLLECTIONS.partidos;