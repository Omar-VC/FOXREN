import {
  validarPreparacionCompetencia,
  validarParejasDeCompetencia,
} from "../../domain/competencia/competencia.rules";

import { competenciasRepository } from "../../infrastructure/repositories/competenciasRepository";
import { parejasRepository } from "../../infrastructure/repositories/parejasRepository";
import { jugadoresRepository } from "../../infrastructure/repositories/jugadoresRepository";

export interface ResultadoPreparacionCompetencia {
  esValida: boolean;
  errores: string[];
  resumen: {
    cantidadParejas: number;
    cupoMaximo: number;
    jugadores: number;
  };
  parejas: {
  jugador1: string;
  jugador2: string;
}[];
}

export async function prepararCompetencia(
  competenciaId: string,
): Promise<ResultadoPreparacionCompetencia> {
  const competencia = await competenciasRepository.obtenerPorId(competenciaId);

  if (!competencia) {
    throw new Error("No se encontró la competencia.");
  }

  const parejas =
    await parejasRepository.obtenerPorCompetenciaId(competenciaId);

  const validacion = validarPreparacionCompetencia(competencia, parejas);

  if (!validacion.esValido) {
    return {
      esValida: false,
      errores: validacion.errores,
      resumen: {
        cantidadParejas: parejas.filter((pareja) => pareja.estado === "activa")
          .length,
        cupoMaximo: competencia.cupoMaximoParejas,
        jugadores: 0,
      },
      parejas: [],
    };
  }

  const jugadores = await jugadoresRepository.obtenerJugadores();

  const jugadoresPorId = new Map(
  jugadores.map((jugador) => [jugador.id, jugador]),
);

const parejasActivas = parejas.filter(
  (pareja) => pareja.estado === "activa",
);

const parejasInforme = parejasActivas.map((pareja) => {
  const jugador1 = jugadoresPorId.get(pareja.jugador1Id);
  const jugador2 = jugadoresPorId.get(pareja.jugador2Id);

  return {
    jugador1: jugador1
      ? `${jugador1.nombre} ${jugador1.apellido}`
      : pareja.jugador1Id,
    jugador2: jugador2
      ? `${jugador2.nombre} ${jugador2.apellido}`
      : pareja.jugador2Id,
  };
});

  

  const idsJugadores = new Set<string>();

  for (const pareja of parejasActivas) {
    idsJugadores.add(pareja.jugador1Id);
    idsJugadores.add(pareja.jugador2Id);
  }

  const erroresParejas = validarParejasDeCompetencia(
    competencia,
    parejas,
    jugadores,
  );

  if (erroresParejas.length > 0) {
    return {
  esValida: false,
  errores: erroresParejas,
  resumen: {
    cantidadParejas: parejasActivas.length,
    cupoMaximo: competencia.cupoMaximoParejas,
    jugadores: idsJugadores.size,
  },
  parejas: parejasInforme,
};
  }

  return {
  esValida: true,
  errores: [],
  resumen: {
    cantidadParejas: parejasActivas.length,
    cupoMaximo: competencia.cupoMaximoParejas,
    jugadores: idsJugadores.size,
  },
  parejas: parejasInforme,
};
}
