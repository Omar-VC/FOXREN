// src/infrastructure/firebase/collections.ts

export const COLLECTIONS = {
  jugadores: "jugadores",
  solicitudesRegistro: "solicitudes_registro", // 👈 agregamos esta colección
  torneos: "torneos",
  competencias: "competencias",
  inscripciones: "inscripciones",
  rankings: "rankings",
} as const;
