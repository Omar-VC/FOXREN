import { competenciasRepository } from "../../infrastructure/repositories/competenciasRepository";
import { jugadoresRepository } from "../../infrastructure/repositories/jugadoresRepository";
import { parejasRepository } from "../../infrastructure/repositories/parejasRepository";

import {
  competenciaAceptaInscripciones,
  parejaPuedeParticiparEnCompetencia,
  jugadorPuedeParticiparEnCompetencia,
} from "../../domain/competencia/competencia.rules";

interface DatosRegistrarPareja {
  competenciaId: string;
  jugador1Id: string;
  jugador2Id: string;
}

export async function registrarPareja(
  datos: DatosRegistrarPareja
): Promise<string> {
  if (datos.jugador1Id === datos.jugador2Id) {
    throw new Error(
      "Los jugadores de una pareja no pueden ser iguales."
    );
  }

  const competencia =
    await competenciasRepository.obtenerPorId(
      datos.competenciaId
    );

  if (!competencia) {
    throw new Error("No se encontró la competencia.");
  }

  if (!competenciaAceptaInscripciones(competencia)) {
    throw new Error(
      "La competencia no acepta nuevas inscripciones."
    );
  }

  const jugador1 =
    await jugadoresRepository.obtenerJugadorPorId(
      datos.jugador1Id
    );

  const jugador2 =
    await jugadoresRepository.obtenerJugadorPorId(
      datos.jugador2Id
    );

  if (!jugador1 || !jugador2) {
    throw new Error(
      "No se encontraron los jugadores de la pareja."
    );
  }

  if (
    !jugadorPuedeParticiparEnCompetencia(
      jugador1,
      competencia
    )
  ) {
    throw new Error(
      `El jugador ${jugador1.nombre} ${jugador1.apellido} no cumple la regla de categoría.`
    );
  }

  if (
    !jugadorPuedeParticiparEnCompetencia(
      jugador2,
      competencia
    )
  ) {
    throw new Error(
      `El jugador ${jugador2.nombre} ${jugador2.apellido} no cumple la regla de categoría.`
    );
  }

  if (
    !parejaPuedeParticiparEnCompetencia(
      jugador1,
      jugador2,
      competencia
    )
  ) {
    throw new Error(
      "La pareja no cumple la regla de categoría de la competencia."
    );
  }

    const parejasExistentes =
    await parejasRepository.obtenerPorCompetenciaId(
      competencia.id
    );

  const jugadorYaInscripto = parejasExistentes.some(
    (pareja) =>
      pareja.estado === "activa" &&
      (
        pareja.jugador1Id === jugador1.id ||
        pareja.jugador2Id === jugador1.id ||
        pareja.jugador1Id === jugador2.id ||
        pareja.jugador2Id === jugador2.id
      )
  );

    const parejasActivas = parejasExistentes.filter(
    (pareja) => pareja.estado === "activa"
  );

  if (
    parejasActivas.length >= competencia.cupoMaximoParejas
  ) {
    throw new Error(
      "La competencia alcanzó el cupo máximo de parejas."
    );
  }

  if (jugadorYaInscripto) {
    throw new Error(
      "Uno de los jugadores ya está inscripto en esta competencia."
    );
  }

  return parejasRepository.crear({
    competenciaId: competencia.id,
    jugador1Id: jugador1.id,
    jugador2Id: jugador2.id,
    estado: "activa",
  });
}