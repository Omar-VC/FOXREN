import type { RankingJugador } from "./ranking.types";

export function puntosValidos(
  ranking: RankingJugador
): boolean {
  return ranking.puntos >= 0;
}

export function rankingTienePuntos(
  ranking: RankingJugador
): boolean {
  return ranking.puntos > 0;
}

export function rankingEsValido(
  ranking: RankingJugador
): boolean {
  return (
    ranking.jugadorId.trim() !== "" &&
    ranking.temporada.trim() !== "" &&
    ranking.puntos >= 0 &&
    ranking.posicion > 0
  );
}