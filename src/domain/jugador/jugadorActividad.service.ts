import type { RegistroHistorial } from "../historial/historial.types";
import { jugadorEstaInactivo } from "../historial/historial.rules";

export type EstadoActividadJugador = "activo" | "inactivo";

export function obtenerEstadoActividadJugador(
  historial: RegistroHistorial[]
): EstadoActividadJugador {
  return jugadorEstaInactivo(historial)
    ? "inactivo"
    : "activo";
}