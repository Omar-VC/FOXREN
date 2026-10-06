import type { TablaPosicionPareja } from "../zona/zona.types";
import type {
  CuadroPartido,
  RondaCuadro,
} from "./cuadro.types";

function obtenerRondaInicial(
  cantidadClasificados: number
): RondaCuadro {
  if (cantidadClasificados <= 2) {
    return "FINAL";
  }

  if (cantidadClasificados <= 4) {
    return "SEMIFINAL";
  }

  return "CUARTOS";
}

function crearPartidoCuadro(
  competenciaId: string,
  pareja1Id: string,
  pareja2Id: string,
  ronda: RondaCuadro,
  posicionEnCuadro: number
): CuadroPartido {
  return {
    id: "",
    competenciaId,
    pareja1Id,
    pareja2Id,
    estado: "pendiente",
    sets: [],
    orden: posicionEnCuadro,
    ronda,
    posicionEnCuadro,
  };
}

export function generarCuadroEliminatorio(
  competenciaId: string,
  clasificadosPorZona: {
    zonaNombre: string;
    clasificados: TablaPosicionPareja[];
  }[]
): CuadroPartido[] {
  const clasificados: TablaPosicionPareja[] =
    clasificadosPorZona.flatMap(
      (zona) => zona.clasificados
    );

  if (clasificados.length < 2) {
    throw new Error(
      "Se necesitan al menos 2 parejas clasificadas para generar el cuadro."
    );
  }

  const rondaInicial = obtenerRondaInicial(
    clasificados.length
  );

  const partidos: CuadroPartido[] = [];

  /*
   * Por ahora generamos los cruces iniciales
   * tomando las parejas clasificadas en orden.
   *
   * La distribución definitiva de cruces
   * entre zonas se definirá en el motor
   * de competencia.
   */

  for (
    let i = 0;
    i < clasificados.length - 1;
    i += 2
  ) {
    const pareja1 = clasificados[i];
    const pareja2 = clasificados[i + 1];

    if (!pareja1 || !pareja2) {
      continue;
    }

    partidos.push(
      crearPartidoCuadro(
        competenciaId,
        pareja1.parejaId,
        pareja2.parejaId,
        rondaInicial,
        partidos.length + 1
      )
    );
  }

  return partidos;
}