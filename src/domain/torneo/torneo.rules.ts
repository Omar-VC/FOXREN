import type { Torneo } from "./torneo.types";

// ---------------------------------------------
// Verificaciones de estado
// ---------------------------------------------

export function torneoEstaPublicado(torneo: Torneo): boolean {
  return torneo.estado === "publicado";
}

export function torneoEstaEnCurso(torneo: Torneo): boolean {
  return torneo.estado === "en_curso";
}

export function torneoEstaFinalizado(torneo: Torneo): boolean {
  return torneo.estado === "finalizado";
}

export function torneoEstaCancelado(torneo: Torneo): boolean {
  return torneo.estado === "cancelado";
}

export function torneoPuedePublicarse(torneo: Torneo): boolean {
  return torneo.estado === "pendiente";
}