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

/** Qué se publicó, para poder explicarlo en pantalla cuando el ranking sale vacío. */
export interface ResumenRanking {
  circuitoNombre: string;
  jugadoresTotales: number;
  jugadoresConPermiso: number;
  filasPorGenero: Record<GeneroCompetencia, number>;
}

/**
 * Recalcula y guarda los rankings públicos de un circuito (uno por género).
 * Entran solo los jugadores con permiso de publicación vigente; los activos
 * aparecen aunque no hayan jugado, con sus puntos iniciales.
 */
export async function actualizarRankingsCircuito(circuitoId: string): Promise<ResumenRanking> {
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

  // Todos los jugadores: los que todavía no jugaron también figuran con sus puntos iniciales.
  const jugadores = await jugadoresRepository.obtenerJugadores();
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
  const filasPorGenero = { MASCULINO: 0, FEMENINO: 0, MIXTO: 0 };

  for (const genero of GENEROS) {
    const filas = calcularRankingGenero(paraRanking, publicables, genero);
    const filasPublicas = construirFilasPublicas(filas, jugadores);
    filasPorGenero[genero] = filasPublicas.length;
    const ranking: RankingPublico = {
      circuitoId,
      circuitoNombre: circuito.nombre,
      temporada: circuito.temporada,
      genero,
      actualizadoEn,
      filas: filasPublicas,
    };

    batch.set(
      doc(db, COLECCION_RANKINGS_PUBLICOS, idRankingPublico(circuitoId, circuito.temporada, genero)),
      ranking,
    );
  }

  await batch.commit();

  return {
    circuitoNombre: circuito.nombre,
    jugadoresTotales: jugadores.length,
    jugadoresConPermiso: publicables.length,
    filasPorGenero,
  };
}

export interface ResultadoRankingCircuito {
  circuitoId: string;
  circuitoNombre: string;
  resumen?: ResumenRanking;
  error?: string;
}

/**
 * Recalcula los rankings de todos los circuitos. Un circuito que falle no impide
 * recalcular los demás: el error queda en su resultado.
 */
export async function actualizarTodosLosRankings(): Promise<ResultadoRankingCircuito[]> {
  const circuitos = await circuitosRepository.obtenerCircuitos();
  const resultados: ResultadoRankingCircuito[] = [];

  for (const circuito of circuitos) {
    try {
      const resumen = await actualizarRankingsCircuito(circuito.id);
      resultados.push({ circuitoId: circuito.id, circuitoNombre: circuito.nombre, resumen });
    } catch (error) {
      resultados.push({
        circuitoId: circuito.id,
        circuitoNombre: circuito.nombre,
        error: error instanceof Error ? error.message : "Error desconocido.",
      });
    }
  }

  return resultados;
}

/** Recalcula los rankings del circuito al que pertenece una competencia. */
export async function actualizarRankingsDeCompetencia(
  competenciaId: string,
): Promise<ResumenRanking | null> {
  const competencia = await competenciasRepository.obtenerPorId(competenciaId);
  if (!competencia) return null;

  const torneo = await torneosRepository.obtenerTorneoPorId(competencia.torneoId);
  // Sin circuito no hay ranking que publicar.
  if (!torneo?.circuitoId) return null;

  return actualizarRankingsCircuito(torneo.circuitoId);
}
