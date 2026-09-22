import type { Zona, TablaPosicionPareja } from "./zona.types";
import type { Partido } from "../partido/partido.types";
import type { Pareja } from "../pareja/pareja.types";

/**
 * Recibe las parejas APROBADAS y genera automáticamente las zonas y sus partidos Round Robin.
 */
export function generarZonasParaCompetencia(
  competenciaId: string,
  parejasAprobadas: Pareja[]
): { zonas: Omit<Zona, "id">[]; partidos: Omit<Partido, "id">[] } {
  const totalParejas = parejasAprobadas.length;
  if (totalParejas < 3) {
    throw new Error("Se requieren al menos 3 parejas aprobadas para armar zonas.");
  }

  // Determinar número de zonas (prioriza grupos de 3 o 4)
  let numZonas = Math.floor(totalParejas / 3);
  if (totalParejas % 4 === 0) {
    numZonas = totalParejas / 4;
  }

  // Mezclar parejas para sorteo aleatorio
  const parejasShuffled = [...parejasAprobadas].sort(() => Math.random() - 0.5);

  const zonasCreadas: Omit<Zona, "id">[] = [];
  const partidosCreados: Omit<Partido, "id">[] = [];

  // Crear estructuras de zonas
  for (let i = 0; i < numZonas; i++) {
    zonasCreadas.push({
      competenciaId,
      nombre: `Zona ${String.fromCharCode(65 + i)}`,
      parejasIds: [],
    });
  }

  // Distribuir parejas equitativamente
  parejasShuffled.forEach((p, idx) => {
    const zonaIdx = idx % numZonas;
    zonasCreadas[zonaIdx].parejasIds.push(p.id);
  });

  // Generar enfrentamientos de cada zona
  zonasCreadas.forEach((zona) => {
    const ids = zona.parejasIds;
    let orden = 1;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        partidosCreados.push({
          competenciaId,
          pareja1Id: ids[i],
          pareja2Id: ids[j],
          estado: "PENDIENTE",
          sets: [],
          orden: orden++,
        });
      }
    }
  });

  return { zonas: zonasCreadas, partidos: partidosCreados };
}

/**
 * Recalcula la tabla de posiciones oficial de una zona.
 */
export function calcularTablaPosicionesZona(
  zona: Zona,
  partidosZona: Partido[],
  parejasMap: Record<string, string>
): TablaPosicionPareja[] {
  const posicionesMap: Record<string, TablaPosicionPareja> = {};

  zona.parejasIds.forEach((id) => {
    posicionesMap[id] = {
      parejaId: id,
      nombrePareja: parejasMap[id] || "Pareja Desconocida",
      partidosJugados: 0,
      partidosGanados: 0,
      partidosPerdidos: 0,
      setsGanados: 0,
      setsPerdidos: 0,
      diferenciaSets: 0,
      juegosGanados: 0,
      juegosPerdidos: 0,
      diferenciaJuegos: 0,
      puntos: 0,
    };
  });

  partidosZona.forEach((p) => {
    if (p.estado !== "FINALIZADO" && p.estado !== "WALKOVER") return;

    const stats1 = posicionesMap[p.pareja1Id];
    const stats2 = posicionesMap[p.pareja2Id];
    if (!stats1 || !stats2) return;

    stats1.partidosJugados += 1;
    stats2.partidosJugados += 1;

    if (p.ganadorParejaId === p.pareja1Id) {
      stats1.partidosGanados += 1;
      stats1.puntos += 2;
      stats2.partidosPerdidos += 1;
      stats2.puntos += 1;
    } else if (p.ganadorParejaId === p.pareja2Id) {
      stats2.partidosGanados += 1;
      stats2.puntos += 2;
      stats1.partidosPerdidos += 1;
      stats1.puntos += 1;
    }

    p.sets.forEach((s) => {
      stats1.juegosGanados += s.juegosPareja1;
      stats1.juegosPerdidos += s.juegosPareja2;
      stats2.juegosGanados += s.juegosPareja2;
      stats2.juegosPerdidos += s.juegosPareja1;

      if (s.juegosPareja1 > s.juegosPareja2) {
        stats1.setsGanados += 1;
        stats2.setsPerdidos += 1;
      } else if (s.juegosPareja2 > s.juegosPareja1) {
        stats2.setsGanados += 1;
        stats1.setsPerdidos += 1;
      }
    });

    stats1.diferenciaSets = stats1.setsGanados - stats1.setsPerdidos;
    stats1.diferenciaJuegos = stats1.juegosGanados - stats1.juegosPerdidos;
    stats2.diferenciaSets = stats2.setsGanados - stats2.setsPerdidos;
    stats2.diferenciaJuegos = stats2.juegosGanados - stats2.juegosPerdidos;
  });

  return Object.values(posicionesMap).sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    if (b.diferenciaSets !== a.diferenciaSets) return b.diferenciaSets - a.diferenciaSets;
    return b.diferenciaJuegos - a.diferenciaJuegos;
  });
}