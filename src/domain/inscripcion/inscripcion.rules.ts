import type { Inscripcion } from "./inscripcion.types";

export function esInscripcionConfirmada(
  inscripcion: Inscripcion
): boolean {
  return inscripcion.estado === "confirmada";
}

export function esInscripcionPendiente(
  inscripcion: Inscripcion
): boolean {
  return inscripcion.estado === "pendiente";
}

export function esInscripcionValida(
  inscripcion: Inscripcion
): boolean {
  return (
    inscripcion.estado === "pendiente" ||
    inscripcion.estado === "confirmada"
  );
}

export function esInscripcionCancelada(
  inscripcion: Inscripcion
): boolean {
  return inscripcion.estado === "cancelada";
}