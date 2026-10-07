import type { SolicitudRegistro } from "./solicitudRegistro.types";

export function solicitudEstaPendiente(
  solicitud: SolicitudRegistro
): boolean {
  return solicitud.estado === "pendiente";
}

export function solicitudEstaAprobada(
  solicitud: SolicitudRegistro
): boolean {
  return solicitud.estado === "aprobada";
}

export function solicitudEstaRechazada(
  solicitud: SolicitudRegistro
): boolean {
  return solicitud.estado === "rechazada";
}