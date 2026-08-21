import type { Fase } from "./fase.types";

export function faseEstaEnCurso(
  fase: Fase
): boolean {
  return fase.estado === "en_curso";
}

export function faseEstaFinalizada(
  fase: Fase
): boolean {
  return fase.estado === "finalizada";
}