import type { EstadisticasJugador } from "./estadisticas.types";

export function estadisticasSonValidas(
  estadisticas: EstadisticasJugador
): boolean {
  return (
    estadisticas.jugadorId.trim() !== "" &&
    estadisticas.temporada.trim() !== "" &&
    estadisticas.partidosJugados >= 0 &&
    estadisticas.victorias >= 0 &&
    estadisticas.derrotas >= 0 &&
    estadisticas.setsGanados >= 0 &&
    estadisticas.setsPerdidos >= 0 &&
    estadisticas.juegosGanados >= 0 &&
    estadisticas.juegosPerdidos >= 0 &&
    estadisticas.titulos >= 0
  );
}