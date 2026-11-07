import type { Partido } from "../partido/partido.types";
import type { Jugador } from "../jugador/jugador.types";
import type {
  EstadoCompetencia,
  GeneroCompetencia,
} from "../competencia/competencia.types";
import { CONFIG_RANKING } from "./ranking.config.ts";
import type { ConfigRanking } from "./ranking.config.ts";
import {
  calcularRendimientoParejas,
  construirRanking,
  puntosDeCompetencia,
} from "./ranking.puntos.ts";
import type { FilaRanking, ResultadoJugadorEnCompetencia } from "./ranking.puntos.ts";
import {
  consentimientoPermitePublicar,
  consentimientoPermitePublicarApodo,
} from "../jugador/jugador.publicacion.rules.ts";
import { obtenerValorCategoriaJugador } from "../jugador/categoriaJugador.ts";

/**
 * Cuentan todas las competencias menos borradores y canceladas. Con zonas, la
 * competencia sigue "inscripciones cerradas" mientras se juegan las zonas, y una
 * competencia sin partidos jugados no suma puntos a nadie de todas formas.
 */
const ESTADOS_QUE_NO_CUENTAN: EstadoCompetencia[] = ["borrador", "cancelada"];

export function competenciaCuentaParaRanking(estado: EstadoCompetencia): boolean {
  return !ESTADOS_QUE_NO_CUENTAN.includes(estado);
}

export interface ParejaParaRanking {
  id: string;
  jugador1Id: string;
  jugador2Id: string;
  estado: string;
}

export interface CompetenciaParaRanking {
  competenciaId: string;
  genero: GeneroCompetencia;
  estado: EstadoCompetencia;
  /** Categoría efectiva de la competencia (en las de suma, el promedio). */
  categoria: number;
  partidos: Partido[];
  parejas: ParejaParaRanking[];
}

export interface JugadorParaRanking {
  id: string;
  /** Categoría del jugador (1 a 8); null si no es válida. */
  categoria: number | null;
}

export interface FilaRankingConJugador extends FilaRanking {
  jugadorId: string;
}

/**
 * Ranking de un género dentro de un conjunto de competencias (las de un circuito).
 * Solo entran los jugadores recibidos en `jugadoresPublicables` (con permiso de
 * publicación) que jugaron al menos una competencia de ese género.
 */
export function calcularRankingGenero(
  competencias: CompetenciaParaRanking[],
  jugadoresPublicables: JugadorParaRanking[],
  genero: GeneroCompetencia,
  config: ConfigRanking = CONFIG_RANKING,
): FilaRankingConJugador[] {
  const resultadosPorJugador = new Map<string, ResultadoJugadorEnCompetencia[]>();

  for (const competencia of competencias) {
    if (competencia.genero !== genero) continue;
    if (!competenciaCuentaParaRanking(competencia.estado)) continue;

    const activas = competencia.parejas.filter((pareja) => pareja.estado === "activa");
    const rendimientos = calcularRendimientoParejas(
      competencia.partidos,
      activas.map((pareja) => pareja.id),
    );

    for (const rendimiento of rendimientos) {
      if (!rendimiento.participo) continue;
      const pareja = activas.find((p) => p.id === rendimiento.parejaId);
      if (!pareja) continue;

      const puntos = puntosDeCompetencia(rendimiento, competencia.categoria, config);
      for (const jugadorId of new Set([pareja.jugador1Id, pareja.jugador2Id])) {
        const lista = resultadosPorJugador.get(jugadorId) ?? [];
        lista.push({ competenciaId: competencia.competenciaId, puntos });
        resultadosPorJugador.set(jugadorId, lista);
      }
    }
  }

  const entradas = jugadoresPublicables
    .filter((jugador) => resultadosPorJugador.has(jugador.id))
    .map((jugador) => ({
      jugadorId: jugador.id,
      categoria: jugador.categoria,
      resultados: resultadosPorJugador.get(jugador.id) ?? [],
    }));

  return construirRanking(entradas, config) as FilaRankingConJugador[];
}

/* ------------------------------------------------------------------ */
/* Proyección pública                                                  */
/* ------------------------------------------------------------------ */

/** Lo único que se publica de cada jugador en un ranking: nunca IDs internos ni datos privados. */
export interface FilaRankingPublico {
  posicion: number;
  nombre: string;
  apellido: string;
  apodo?: string;
  categoria?: string;
  puntos: number;
  competenciasJugadas: number;
}

export interface RankingPublico {
  circuitoId: string;
  temporada: string;
  genero: GeneroCompetencia;
  actualizadoEn: Date;
  filas: FilaRankingPublico[];
}

export function jugadorEsPublicable(jugador: Jugador): boolean {
  return consentimientoPermitePublicar(jugador.consentimientoPublicacion);
}

export function jugadorParaRanking(jugador: Jugador): JugadorParaRanking {
  return {
    id: jugador.id,
    categoria: obtenerValorCategoriaJugador(jugador.categoriaDeclarada ?? ""),
  };
}

/** Convierte las filas del ranking en filas públicas. Omite a quien no tenga permiso vigente. */
export function construirFilasPublicas(
  filas: FilaRankingConJugador[],
  jugadores: Jugador[],
): FilaRankingPublico[] {
  const porId = new Map(jugadores.map((jugador) => [jugador.id, jugador]));
  const publicas: FilaRankingPublico[] = [];

  for (const fila of filas) {
    const jugador = porId.get(fila.jugadorId);
    if (!jugador || !jugadorEsPublicable(jugador)) continue;

    const publica: FilaRankingPublico = {
      posicion: fila.posicion,
      nombre: jugador.nombre.trim(),
      apellido: jugador.apellido.trim(),
      puntos: fila.puntos,
      competenciasJugadas: fila.competenciasJugadas,
    };

    const apodo = jugador.apodo?.trim();
    if (apodo && consentimientoPermitePublicarApodo(jugador.consentimientoPublicacion)) {
      publica.apodo = apodo;
    }
    const categoria = jugador.categoriaDeclarada?.trim();
    if (categoria) publica.categoria = categoria;

    publicas.push(publica);
  }

  return publicas;
}

/** ID del documento público de un ranking. La temporada puede traer "/" u otros símbolos. */
export function idRankingPublico(
  circuitoId: string,
  temporada: string,
  genero: GeneroCompetencia,
): string {
  const limpio = (texto: string) => texto.trim().replace(/[^A-Za-z0-9_-]+/g, "-");
  return `${limpio(circuitoId)}_${limpio(temporada)}_${genero}`;
}
