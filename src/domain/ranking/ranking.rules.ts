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