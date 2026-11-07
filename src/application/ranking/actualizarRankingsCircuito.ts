import { doc, writeBatch } from "firebase/firestore";

import { db } from "../../infrastructure/firebase/firebase";
import { circuitosRepository } from "../../infrastructure/repositories/circuitosRepository";
import { torneosRepository } from "../../infrastructure/repositories/torneosRepository";
import { competenciasRepository } from "../../infrastructure/repositories/competenciasRepository";
import { partidosRepository } from "../../infrastructure/repositories/partidosRepository";
import { parejasRepository } from "../../infrastructure/repositories/parejasRepository";
import { jugadoresRepository } from "../../infrastructure/repositories/jugadoresRepository";

import type { GeneroCompetencia } from "../../domain/competencia/competencia.types";
import { categoriaEfectivaCompetencia } from "../../domain/ranking/ranking.puntos";
import {
  calcularRankingGenero,
  competenciaCuentaParaRanking,
  construirFilasPublicas,
  idRankingPublico,
  jugadorEsPublicable,
  jugadorParaRanking,
} from "../../domain/ranking/ranking.circuito";
import type {
  CompetenciaParaRanking,
  RankingPublico,
} from "../../domain/ranking/ranking.circuito";

/** Colección de solo lectura para la web pública: nunca guarda datos privados. */
export const COLECCION_RANKINGS_PUBLICOS = "rankingsPublicos";

const GENEROS: GeneroCompetencia[] = ["MASCULINO", "FEMENINO", "MIXTO"];

/**
 * Recalcula y guarda los rankings públicos de un circuito (uno por género).
 * Entran solo los jugadores con permiso de publicación vigente.
 */
export async function actualizarRankingsCircuito(circuitoId: string): Promise<void> {
  const circuito = await circuitosRepository.obtenerCircuitoPorId(circuitoId);
  if (!circuito) {
    throw new Error("No se encontró el circuito.");
  }

  const torneos = await torneosRepository.obtenerTorneosPorCircuito(circuitoId);
  const competenciasPorTorneo = await Promise.all(
    torneos.map((torneo) => competenciasRepository.obtenerPorTorneoId(torneo.id)),
  );
  const competencias = competenciasPorTorneo
    .flat()
    .filter((competencia) => competenciaCuentaParaRanking(competencia.estado));

  const datos = await Promise.all(
    competencias.map(async (competencia) => {
      const [partidos, parejas] = await Promise.all([
        partidosRepository.getByCompetencia(competencia.id),
        parejasRepository.obtenerPorCompetenciaId(competencia.id),
      ]);
      return { competencia, partidos, parejas };
    }),
  );

  const idsJugadores = [
    ...new Set(
      datos.flatMap(({ parejas }) =>
        parejas.flatMap((pareja) => [pareja.jugador1Id, pareja.jugador2Id]),
      ),
    ),
  ];
  const jugadores = await jugadoresRepository.obtenerPorIds(idsJugadores);
  const publicables = jugadores.filter(jugadorEsPublicable).map(jugadorParaRanking);

  const paraRanking: CompetenciaParaRanking[] = datos.map(
    ({ competencia, partidos, parejas }) => ({
      competenciaId: competencia.id,
      genero: competencia.genero,
      estado: competencia.estado,
      categoria: categoriaEfectivaCompetencia(
        competencia.tipoReglaCategoria,
        competencia.valorReglaCategoria,
      ),
      partidos,
      parejas: parejas.map((pareja) => ({
        id: pareja.id,
        jugador1Id: pareja.jugador1Id,
        jugador2Id: pareja.jugador2Id,
        estado: pareja.estado,
      })),
    }),
  );

  const batch = writeBatch(db);
  const actualizadoEn = new Date();

  for (const genero of GENEROS) {
    const filas = calcularRankingGenero(paraRanking, publicables, genero);
    const ranking: RankingPublico = {
      circuitoId,
      temporada: circuito.temporada,
      genero,
      actualizadoEn,
      filas: construirFilasPublicas(filas, jugadores),
    };

    batch.set(
      doc(db, COLECCION_RANKINGS_PUBLICOS, idRankingPublico(circuitoId, circuito.temporada, genero)),
      ranking,
    );
  }

  await batch.commit();
}

/** Recalcula los rankings del circuito al que pertenece una competencia. */
export async function actualizarRankingsDeCompetencia(
  competenciaId: string,
): Promise<void> {
  const competencia = await competenciasRepository.obtenerPorId(competenciaId);
  if (!competencia) return;

  const torneo = await torneosRepository.obtenerTorneoPorId(competencia.torneoId);
  if (!torneo?.circuitoId) return;

  await actualizarRankingsCircuito(torneo.circuitoId);
}
