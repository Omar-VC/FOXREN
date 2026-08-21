import type { SolicitudRegistro } from "./solicitud-registro.types";

export function solicitudEstaPendiente(
  solicitud: SolicitudRegistro
): boolean {
  return solicitud.estado === "pendiente";
}