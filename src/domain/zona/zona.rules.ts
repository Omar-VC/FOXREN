import type { Zona } from "./zona.types";

export function zonaEstaEnCurso(
  zona: Zona
): boolean {
  return zona.estado === "en_curso";
}

export function zonaEstaFinalizada(
  zona: Zona
): boolean {
  return zona.estado === "finalizada";
}