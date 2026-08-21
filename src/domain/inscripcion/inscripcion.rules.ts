import type { Inscripcion } from "./inscripcion.types";

export function inscripcionEstaConfirmada(
  inscripcion: Inscripcion
): boolean {
  return inscripcion.estado === "confirmada";
}


export function inscripcionEstaActiva(
  inscripcion: Inscripcion
): boolean {
  return (
    inscripcion.estado === "pendiente" ||
    inscripcion.estado === "confirmada"
  );
}