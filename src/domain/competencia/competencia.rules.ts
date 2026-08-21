import type { Competencia } from "./competencia.types";

export function competenciaAceptaInscripciones(
  competencia: Competencia
): boolean {
  return competencia.estado === "inscripciones_abiertas";
}

export function competenciaEstaEnCurso(
  competencia: Competencia
): boolean {
  return competencia.estado === "en_curso";
}

export function competenciaEstaFinalizada(
  competencia: Competencia
): boolean {
  return competencia.estado === "finalizada";
}