import type { Partido } from "./partido.types";

export function partidoEsValido(
  partido: Partido
): boolean {
  return (
    partido.pareja1Id !== partido.pareja2Id &&
    partido.pareja1Id.trim() !== "" &&
    partido.pareja2Id.trim() !== ""
  );
}



export function partidoEstaFinalizado(
  partido: Partido
): boolean {
  return partido.estado === "finalizado";
}

export function partidoPuedeComenzar(
  partido: Partido
): boolean {
  return partido.estado === "programado";
}