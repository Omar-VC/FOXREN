import type { Partido } from "../partido/partido.types";
import { CONFIG_RANKING } from "../ranking/ranking.config.ts";
import type { ConfigRanking } from "../ranking/ranking.config.ts";
import {
  calcularRendimientoParejas,
  puntosDeCompetencia,
} from "../ranking/ranking.puntos.ts";
import type { FaseAlcanzada } from "../ranking/ranking.puntos.ts";
import { competenciaCuentaParaRanking } from "../ranking/ranking.circuito.ts";
import type { CompetenciaParaRanking } from "../ranking/ranking.circuito.ts";

export interface CompetenciaParaPerfil extends CompetenciaParaRanking {
  torneoNombre: string;
  competenciaNombre: string;
  circuitoNombre: string;
}

/** Una competencia en la que jugó el jugador, lista para publicarse. */
export interface ParticipacionPublica {
  competenciaId: string;
  torneoNombre: string;
  competenciaNombre: string;
  circuitoNombre: string;
  genero: string;
  /** "Campeón", "Finalista", "Semifinal"... o "Fase de zonas". */
  resultado: string;
  puntos: number;
  partidosJugados: number;
  partidosGanados: number;
}

export interface EstadisticasPublicas {
  partidosJugados: number;
  partidosGanados: number;
  partidosPerdidos: number;
  /** Porcentaje de partidos ganados, entero de 0 a 100. */
  efectividad: number;
  competenciasJugadas: number;
  titulos: number;
  finales: number;
}

const ESTADOS_CERRADOS: Partido["estado"][] = ["finalizado", "walkover", "abandono"];

const ETIQUETA_FASE: Record<FaseAlcanzada, string> = {
  dieciseisavos: "Dieciseisavos de final",
  octavos: "Octavos de final",
  cuartos: "Cuartos de final",
  semifinal: "Semifinal",
  finalista: "Finalista",
  campeon: "Campeón",
};

const RESULTADO_SOLO_ZONAS = "Fase de zonas";

/** Competencias en las que jugó el jugador (con alguna participación real). */
export function calcularParticipaciones(
  jugadorId: string,
  competencias: CompetenciaParaPerfil[],
  config: ConfigRanking = CONFIG_RANKING,
): ParticipacionPublica[] {
  const participaciones: ParticipacionPublica[] = [];

  for (const competencia of competencias) {
    if (!competenciaCuentaParaRanking(competencia.estado)) continue;

    const activas = competencia.parejas.filter((pareja) => pareja.estado === "activa");
    const pareja = activas.find(
      (item) => item.jugador1Id === jugadorId || item.jugador2Id === jugadorId,
    );
    if (!pareja) continue;

    const rendimiento = calcularRendimientoParejas(
      competencia.partidos,
      activas.map((item) => item.id),
    ).find((item) => item.parejaId === pareja.id);
    if (!rendimiento?.participo) continue;

    let partidosJugados = 0;
    let partidosGanados = 0;
    for (const partido of competencia.partidos) {
      if (partido.esBye || !ESTADOS_CERRADOS.includes(partido.estado)) continue;
      if (partido.pareja1Id !== pareja.id && partido.pareja2Id !== pareja.id) continue;
      if (!partido.ganadorParejaId) continue;
      partidosJugados += 1;
      if (partido.ganadorParejaId === pareja.id) partidosGanados += 1;
    }

    participaciones.push({
      competenciaId: competencia.competenciaId,
      torneoNombre: competencia.torneoNombre,
      competenciaNombre: competencia.competenciaNombre,
      circuitoNombre: competencia.circuitoNombre,
      genero: competencia.genero,
      resultado: rendimiento.faseAlcanzada
        ? ETIQUETA_FASE[rendimiento.faseAlcanzada]
        : RESULTADO_SOLO_ZONAS,
      puntos: puntosDeCompetencia(rendimiento, competencia.categoria, config),
      partidosJugados,
      partidosGanados,
    });
  }

  return participaciones;
}

export function resumirEstadisticas(
  participaciones: ParticipacionPublica[],
): EstadisticasPublicas {
  const partidosJugados = participaciones.reduce((total, p) => total + p.partidosJugados, 0);
  const partidosGanados = participaciones.reduce((total, p) => total + p.partidosGanados, 0);

  return {
    partidosJugados,
    partidosGanados,
    partidosPerdidos: partidosJugados - partidosGanados,
    efectividad: partidosJugados > 0 ? Math.round((partidosGanados / partidosJugados) * 100) : 0,
    competenciasJugadas: participaciones.length,
    titulos: participaciones.filter((p) => p.resultado === ETIQUETA_FASE.campeon).length,
    finales: participaciones.filter(
      (p) => p.resultado === ETIQUETA_FASE.campeon || p.resultado === ETIQUETA_FASE.finalista,
    ).length,
  };
}
