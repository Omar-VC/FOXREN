import type { Jugador } from "./jugador.types";

export function jugadorEstaActivo(jugador: Jugador): boolean {
  return jugador.estado === "activo";
}