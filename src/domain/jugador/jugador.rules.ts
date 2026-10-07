import type { Jugador } from "./jugador.types";

export function jugadorEstaActivo(
  jugador: Jugador
): boolean {
  return jugador.estado === "activo";
}

export function jugadorEstaInactivo(
  jugador: Jugador
): boolean {
  return jugador.estado === "inactivo";
}

export function jugadorEstaPendiente(
  jugador: Jugador
): boolean {
  return jugador.estado === "pendiente";
}

export function jugadorEstaRechazado(
  jugador: Jugador
): boolean {
  return jugador.estado === "rechazado";
}