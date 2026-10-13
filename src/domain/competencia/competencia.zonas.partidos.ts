import type { Zona } from "./competencia.zonas.types";
import type { Partido } from "../partido/partido.types";

export function generarPartidosDeZonas(
  zonas: Zona[],
): Omit<Partido, "id">[] {
  const partidos: Omit<Partido, "id">[] = [];

  for (const zona of zonas) {
    let orden = 1;

    for (let i = 0; i < zona.parejaIds.length; i++) {
      for (let j = i + 1; j < zona.parejaIds.length; j++) {
        partidos.push({
          competenciaId: zona.competenciaId,
          zonaId: zona.id,
          pareja1Id: zona.parejaIds[i],
          pareja2Id: zona.parejaIds[j],
          estado: "pendiente",
          sets: [],
          orden,
        });

        orden++;
      }
    }
  }

  return partidos;
}