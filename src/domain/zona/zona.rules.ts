import type {
  Zona,
  TablaPosicionPareja,
} from "./zona.types";

import type { Partido } from "../partido/partido.types";
import type { Pareja } from "../pareja/pareja.types";

// ---------------------------------------------
// Utilidad interna
// ---------------------------------------------

function mezclarParejas<T>(items: T[]): T[] {
  const resultado = [...items];

  for (let i = resultado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [resultado[i], resultado[j]] = [
      resultado[j],
      resultado[i],
    ];
  }

  return resultado;
}

// ---------------------------------------------
// Generación de zonas
// ---------------------------------------------

export function generarZonasParaCompetencia(
  competenciaId: string,
  parejasAprobadas: Pareja[]
): {
  zonas: Omit<Zona, "id">[];
  partidos: Omit<Partido, "id">[];
} {
  const totalParejas = parejasAprobadas.length;

  if (totalParejas < 3) {
    throw new Error(
      "Se requieren al menos 3 parejas aprobadas para armar zonas."
    );
  }

  /*
   * Priorizamos zonas de 3 o 4 parejas.
   *
   * Ejemplos:
   * 6  → 2 zonas de 3
   * 8  → 2 zonas de 4
   * 9  → 3 zonas de 3
   * 12 → 3 zonas de 4
   */

  let cantidadZonas: number;

  if (totalParejas % 4 === 0) {
    cantidadZonas = totalParejas / 4;
  } else {
    cantidadZonas = Math.ceil(totalParejas / 4);

    while (
      cantidadZonas > 1 &&
      Math.floor(totalParejas / cantidadZonas) < 3
    ) {
      cantidadZonas--;
    }
  }

  const parejasMezcladas = mezclarParejas(
    parejasAprobadas
  );

  const zonas: Omit<Zona, "id">[] = [];

  for (let i = 0; i < cantidadZonas; i++) {
    zonas.push({
      competenciaId,
      nombre: `Zona ${String.fromCharCode(65 + i)}`,
      parejasIds: [],
    });
  }

  // Distribución equilibrada
  parejasMezcladas.forEach((pareja, index) => {
    const zonaIndex = index % cantidadZonas;

    zonas[zonaIndex].parejasIds.push(
      pareja.id
    );
  });

  // Generación Round Robin
  const partidos: Omit<Partido, "id">[] = [];

  zonas.forEach((zona) => {
    let orden = 1;

    for (
      let i = 0;
      i < zona.parejasIds.length;
      i++
    ) {
      for (
        let j = i + 1;
        j < zona.parejasIds.length;
        j++
      ) {
        partidos.push({
          competenciaId,
          zonaId: undefined,
          pareja1Id: zona.parejasIds[i],
          pareja2Id: zona.parejasIds[j],
          estado: "pendiente",
          sets: [],
          orden,
        });

        orden++;
      }
    }
  });

  return {
    zonas,
    partidos,
  };
}

// ---------------------------------------------
// Tabla de posiciones
// ---------------------------------------------

export function calcularTablaPosicionesZona(
  zona: Zona,
  partidosZona: Partido[]
): TablaPosicionPareja[] {
  const posicionesMap: Record<
    string,
    TablaPosicionPareja
  > = {};

  zona.parejasIds.forEach((parejaId) => {
    posicionesMap[parejaId] = {
      parejaId,
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

  partidosZona.forEach((partido) => {
    const partidoValido =
      partido.estado === "finalizado" ||
      partido.estado === "walkover" ||
      partido.estado === "abandono";

    if (!partidoValido) {
      return;
    }

    const pareja1 =
      posicionesMap[partido.pareja1Id];

    const pareja2 =
      posicionesMap[partido.pareja2Id];

    if (!pareja1 || !pareja2) {
      return;
    }

    pareja1.partidosJugados++;
    pareja2.partidosJugados++;

    if (
      partido.ganadorParejaId ===
      partido.pareja1Id
    ) {
      pareja1.partidosGanados++;
      pareja2.partidosPerdidos++;

      pareja1.puntos += 2;
      pareja2.puntos += 1;
    }

    if (
      partido.ganadorParejaId ===
      partido.pareja2Id
    ) {
      pareja2.partidosGanados++;
      pareja1.partidosPerdidos++;

      pareja2.puntos += 2;
      pareja1.puntos += 1;
    }

    partido.sets.forEach((set) => {
      pareja1.juegosGanados +=
        set.juegosPareja1;

      pareja1.juegosPerdidos +=
        set.juegosPareja2;

      pareja2.juegosGanados +=
        set.juegosPareja2;

      pareja2.juegosPerdidos +=
        set.juegosPareja1;

      if (
        set.juegosPareja1 >
        set.juegosPareja2
      ) {
        pareja1.setsGanados++;
        pareja2.setsPerdidos++;
      }

      if (
        set.juegosPareja2 >
        set.juegosPareja1
      ) {
        pareja2.setsGanados++;
        pareja1.setsPerdidos++;
      }
    });
  });

  Object.values(posicionesMap).forEach(
    (posicion) => {
      posicion.diferenciaSets =
        posicion.setsGanados -
        posicion.setsPerdidos;

      posicion.diferenciaJuegos =
        posicion.juegosGanados -
        posicion.juegosPerdidos;
    }
  );

  return Object.values(posicionesMap).sort(
    (a, b) => {
      if (b.puntos !== a.puntos) {
        return b.puntos - a.puntos;
      }

      if (
        b.diferenciaSets !==
        a.diferenciaSets
      ) {
        return (
          b.diferenciaSets -
          a.diferenciaSets
        );
      }

      return (
        b.diferenciaJuegos -
        a.diferenciaJuegos
      );
    }
  );
}