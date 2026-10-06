import type { Partido } from "./partido.types";

// ---------------------------------------------
// Validaciones
// ---------------------------------------------

export function partidoEsValido(partido: Partido): boolean {
  return (
    partido.pareja1Id.trim() !== "" &&
    partido.pareja2Id.trim() !== "" &&
    partido.pareja1Id !== partido.pareja2Id
  );
}

// ---------------------------------------------
// Estado
// ---------------------------------------------

export function partidoEstaFinalizado(partido: Partido): boolean {
  return (
    partido.estado === "finalizado" ||
    partido.estado === "walkover" ||
    partido.estado === "abandono"
  );
}

export function partidoPuedeComenzar(partido: Partido): boolean {
  return partido.estado === "pendiente";
}

export function partidoEstaEnJuego(partido: Partido): boolean {
  return partido.estado === "en_juego";
}