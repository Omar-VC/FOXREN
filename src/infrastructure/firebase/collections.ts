

// src/infrastructure/firebase/collections.ts

export const COLLECTIONS = {
  jugadores: "jugadores",
  solicitudesRegistro: "solicitudes_registro",
  torneos: "torneos",
  competencias: "competencias",
  inscripciones: "inscripciones",
  rankings: "rankings",
  circuitos: "circuitos", // 👈 agregamos esta colección
  llavesOrganizadores: "llaves_organizadores", // 👈 agregamos esta colección
} as const;
