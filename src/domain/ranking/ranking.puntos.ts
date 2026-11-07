import type { Partido } from "../partido/partido.types";
import type { TipoReglaCategoria } from "../competencia/competencia.types";
import { CONFIG_RANKING } from "./ranking.config.ts";
import type { ConfigRanking } from "./ranking.config.ts";

const ESTADOS_CERRADOS: Partido["estado"][] = ["finalizado", "walkover", "abandono"];

/* ------------------------------------------------------------------ */
/* Categorías                                                          */
/* ------------------------------------------------------------------ */

/**
 * Categoría "efectiva" de una competencia. En las de suma de categorías se usa el
 * promedio (suma ÷ 2): una "suma 8" cuenta como categoría 4.
 */
export function categoriaEfectivaCompetencia(
  tipo: TipoReglaCategoria,
  valor: number,
): number {
  return tipo === "suma" ? valor / 2 : valor;
}

/** Interpola entre categorías enteras y acota al rango definido en la configuración. */
function valorInterpolado(
  tabla: Record<number, number>,
  categoria: number,
): number {
  const claves = Object.keys(tabla).map(Number).sort((a, b) => a - b);
  const minimo = claves[0];
  const maximo = claves[claves.length - 1];
  const acotada = Math.min(Math.max(categoria, minimo), maximo);

  const inferior = Math.floor(acotada);
  const superior = Math.ceil(acotada);
  if (inferior === superior) return tabla[inferior];

  const fraccion = acotada - inferior;
  return tabla[inferior] + (tabla[superior] - tabla[inferior]) * fraccion;
}

export function multiplicadorDeCategoria(
  categoria: number,
  config: ConfigRanking = CONFIG_RANKING,
): number {
  return valorInterpolado(config.multiplicadorCategoria, categoria);
}

/** Puntos iniciales según la categoría confirmada. Sin categoría válida: 0. */
export function puntosInicialesDeCategoria(
  categoria: number | null | undefined,
  config: ConfigRanking = CONFIG_RANKING,
): number {
  if (categoria === null || categoria === undefined || !Number.isFinite(categoria)) {
    return 0;
  }
  return Math.round(valorInterpolado(config.puntosIniciales, categoria));
}

/* ------------------------------------------------------------------ */
/* Rendimiento de una pareja en una competencia                        */
/* ------------------------------------------------------------------ */

export type FaseAlcanzada =
  | "dieciseisavos"
  | "octavos"
  | "cuartos"
  | "semifinal"
  | "finalista"
  | "campeon";

export interface RendimientoPareja {
  parejaId: string;
  participo: boolean;
  victoriasZona: number;
  faseAlcanzada: FaseAlcanzada | null;
}

function faseDesdePartido(fase: string | undefined): FaseAlcanzada | null {
  switch (fase) {
    case "final":
      return "finalista";
    case "semifinal":
      return "semifinal";
    case "cuartos_final":
      return "cuartos";
    case "octavos_final":
      return "octavos";
    case "dieciseisavos_final":
      return "dieciseisavos";
    case "tercer_puesto":
      return null;
    default:
      // "ronda_de_32" y anteriores valen igual que dieciseisavos
      return typeof fase === "string" && fase.startsWith("ronda_de_")
        ? "dieciseisavos"
        : null;
  }
}

const ORDEN_FASES: FaseAlcanzada[] = [
  "dieciseisavos",
  "octavos",
  "cuartos",
  "semifinal",
  "finalista",
  "campeon",
];

/**
 * Qué logró cada pareja en una competencia, mirando solo sus partidos:
 * - participó: tiene algún partido cerrado o aparece en la llave;
 * - victorias de zona: partidos de zona ganados;
 * - fase alcanzada: la más alta de la llave en la que aparece (ganar la final = campeón).
 */
export function calcularRendimientoParejas(
  partidos: Partido[],
  parejaIds: string[],
): RendimientoPareja[] {
  return parejaIds.map((parejaId) => {
    let participo = false;
    let victoriasZona = 0;
    let fase: FaseAlcanzada | null = null;

    for (const partido of partidos) {
      const juega = partido.pareja1Id === parejaId || partido.pareja2Id === parejaId;
      if (!juega) continue;

      const cerrado = ESTADOS_CERRADOS.includes(partido.estado);
      const esLlave = partido.tipoPartido === "eliminacion_directa";

      if (esLlave) {
        participo = true;
        let alcanzada = faseDesdePartido(partido.fase);
        if (partido.fase === "final" && cerrado && partido.ganadorParejaId === parejaId) {
          alcanzada = "campeon";
        }
        if (alcanzada && (!fase || ORDEN_FASES.indexOf(alcanzada) > ORDEN_FASES.indexOf(fase))) {
          fase = alcanzada;
        }
      } else if (cerrado) {
        participo = true;
        if (partido.ganadorParejaId === parejaId) victoriasZona += 1;
      }
    }

    return { parejaId, participo, victoriasZona, faseAlcanzada: fase };
  });
}

/** Puntos de una pareja en una competencia, ya multiplicados por la categoría. */
export function puntosDeCompetencia(
  rendimiento: RendimientoPareja,
  categoriaCompetencia: number,
  config: ConfigRanking = CONFIG_RANKING,
): number {
  if (!rendimiento.participo) return 0;

  const base =
    config.puntosBase.participacion +
    config.puntosBase.victoriaZona * rendimiento.victoriasZona +
    (rendimiento.faseAlcanzada ? config.puntosBase[rendimiento.faseAlcanzada] : 0);

  return Math.round(base * multiplicadorDeCategoria(categoriaCompetencia, config));
}

/* ------------------------------------------------------------------ */
/* Ranking                                                             */
/* ------------------------------------------------------------------ */

export interface ResultadoJugadorEnCompetencia {
  competenciaId: string;
  puntos: number;
}

export interface EntradaRankingJugador {
  jugadorId: string;
  /** Categoría confirmada del jugador (1 a 8). Null si todavía no está confirmada. */
  categoria: number | null;
  resultados: ResultadoJugadorEnCompetencia[];
}

export interface FilaRanking {
  jugadorId: string;
  posicion: number;
  puntos: number;
  puntosIniciales: number;
  puntosCompetencias: number;
  competenciasJugadas: number;
  /** Cuántos resultados entraron en el cálculo (los mejores). */
  resultadosContados: number;
}

/**
 * Arma el ranking: puntos iniciales + suma de los mejores N resultados.
 * Los empates comparten posición (1, 2, 2, 4...). El orden de los empatados es
 * estable: por puntos de competencias y, si siguen iguales, por identificador.
 */
export function construirRanking(
  entradas: EntradaRankingJugador[],
  config: ConfigRanking = CONFIG_RANKING,
): FilaRanking[] {
  const filas = entradas.map((entrada) => {
    const mejores = [...entrada.resultados]
      .map((r) => r.puntos)
      .sort((a, b) => b - a)
      .slice(0, config.mejoresResultados);

    const puntosCompetencias = mejores.reduce((total, p) => total + p, 0);
    const puntosIniciales = puntosInicialesDeCategoria(entrada.categoria, config);

    return {
      jugadorId: entrada.jugadorId,
      puntos: puntosIniciales + puntosCompetencias,
      puntosIniciales,
      puntosCompetencias,
      competenciasJugadas: entrada.resultados.length,
      resultadosContados: mejores.length,
    };
  });

  filas.sort(
    (a, b) =>
      b.puntos - a.puntos ||
      b.puntosCompetencias - a.puntosCompetencias ||
      a.jugadorId.localeCompare(b.jugadorId),
  );

  let posicionAnterior = 0;
  return filas.map((fila, indice) => {
    const anterior = filas[indice - 1];
    const posicion =
      anterior && anterior.puntos === fila.puntos ? posicionAnterior : indice + 1;
    posicionAnterior = posicion;
    return { ...fila, posicion };
  });
}
