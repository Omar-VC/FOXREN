import { doc, runTransaction } from "firebase/firestore";

import { db } from "../../infrastructure/firebase/firebase";
import { COLLECTIONS } from "../../infrastructure/firebase/collections";
import { competenciasRepository } from "../../infrastructure/repositories/competenciasRepository";
import { parejasRepository } from "../../infrastructure/repositories/parejasRepository";
import { zonasRepository } from "../../infrastructure/repositories/zonasRepository";

import { generarZonasAutomaticamente } from "../../domain/competencia/competencia.zonas.distribucion";

export async function generarZonasCompetencia(
  competenciaId: string,
  cantidadZonas: number,
): Promise<void> {
  const competencia =
    await competenciasRepository.obtenerPorId(competenciaId);

  if (!competencia) {
    throw new Error("No se encontró la competencia.");
  }

  if (competencia.estado !== "inscripciones_cerradas") {
    throw new Error(
      "Las inscripciones deben estar cerradas antes de generar las zonas.",
    );
  }

  if (await zonasRepository.existenPorCompetenciaId(competenciaId)) {
    throw new Error(
      "Esta competencia ya tiene zonas generadas.",
    );
  }

  const parejas =
    await parejasRepository.obtenerPorCompetenciaId(competenciaId);

  const parejasActivas = parejas.filter(
    (pareja) => pareja.estado === "activa",
  );

  if (parejasActivas.length < 2) {
    throw new Error(
      "Se necesitan al menos dos parejas activas para generar zonas.",
    );
  }

  const zonas = generarZonasAutomaticamente(
    competenciaId,
    parejasActivas.map((pareja) => pareja.id),
    cantidadZonas,
  );

  const competenciaRef = doc(db, COLLECTIONS.competencias, competenciaId);
  await runTransaction(db, async (transaction) => {
    const competenciaActual = await transaction.get(competenciaRef);
    if (!competenciaActual.exists()) {
      throw new Error("No se encontró la competencia.");
    }
    if (competenciaActual.data().estado !== "inscripciones_cerradas") {
      throw new Error(
        "La competencia debe tener las inscripciones cerradas antes de generar zonas.",
      );
    }
    if (competenciaActual.data().zonasGeneradas === true) {
      throw new Error("Esta competencia ya tiene zonas generadas.");
    }

    await zonasRepository.crearZonasYPartidos(zonas, transaction);
    transaction.update(competenciaRef, { zonasGeneradas: true });
  });
}
