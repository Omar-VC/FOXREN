// src/infrastructure/firebase/collections.ts

export const COLLECTIONS = {
  jugadores: "jugadores",
  organizadores: "organizadores",
  solicitudesRegistro: "solicitudes_registro",
  circuitos: "circuitos",
  complejos: "complejos",
  torneos: "torneos",
  competencias: "competencias",
  categorias: "categorias",
  inscripciones: "inscripciones",
  parejas: "parejas",
  reservasCompetencia: "reservas_competencia",
  zonas: "zonas",
  partidos: "partidos",
  resultados: "resultados",
  rankings: "rankings",
  historial: "historial",
  jugadoresPublicos: "jugadores_publicos",
  organizadoresPublicos: "organizadores_publicos",
  circuitosPublicos: "circuitos_publicos",
  complejosPublicos: "complejos_publicos",
  torneosPublicos: "torneos_publicos",
  competenciasPublicas: "competencias_publicas",
  categoriasPublicas: "categorias_publicas",
  inscripcionesPublicas: "inscripciones_publicas",
  parejasPublicas: "parejas_publicas",
  zonasPublicas: "zonas_publicas",
  partidosPublicos: "partidos_publicos",
  resultadosPublicos: "resultados_publicos",
  rankingsPublicos: "rankings_publicos",
  historialPublico: "historial_publico",
} as const;

export const ZONAS_COLLECTION = COLLECTIONS.zonas;
export const PARTIDOS_COLLECTION = COLLECTIONS.partidos;
