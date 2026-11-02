import { doc, runTransaction } from "firebase/firestore";

import { db } from "../../infrastructure/firebase/firebase";
import { COLLECTIONS } from "../../infrastructure/firebase/collections";
import { competenciasRepository } from "../../infrastructure/repositories/competenciasRepository";
import { parejasRepository } from "../../infrastructure/repositories/parejasRepository";
import { partidosRepository } from "../../infrastructure/repositories/partidosRepository";
import { resultadoRepository } from "../../infrastructure/repositories/resultadoRepository";
import { zonasRepository } from "../../infrastructure/repositories/zonasRepository";
import { partidoMapper } from "../../infrastructure/mappers/partido.mapper";

import { planificarPlayoff } from "../../domain/competencia/competencia.playoff.preparacion";
import { semillaDesdeTexto } from "../../domain/competencia/competencia.playoff.rules";

export interface ResultadoGeneracionPlayoff {
  cantidadPartidos: number;
  totalRondas: number;
  byes: number;
  fases: string[];
}

/** Límite de escrituras de una transacción de Firestore (partidos + competencia). */
const MAX_ESCRITURAS = 499;

/**
 * Genera la llave de la competencia, sea eliminación directa pura o el playoff
 * posterior a las zonas. Todos los partidos se escriben enlazados entre sí en una
 * sola transacción y la competencia pasa a "en_curso".
 */
export async function generarPlayoffCompetencia(
  competenciaId: string,
): Promise<ResultadoGeneracionPlayoff> {
  const competencia = await competenciasRepository.obtenerPorId(competenciaId);
  if (!competencia) {
    throw new Error("No se encontró la competencia.");
  }
  if (competencia.playoffGenerado) {
    throw new Error("Esta competencia ya tiene la llave generada.");
  }

  const esDirecta = competencia.formato === "eliminacion_directa";

  if (esDirecta && competencia.estado !== "inscripciones_cerradas") {
    throw new Error("Las inscripciones deben estar cerradas antes de generar la llave.");
  }
  if (!esDirecta) {
    if (!competencia.zonasGeneradas) {
      throw new Error("Primero hay que generar las zonas.");
    }
    if (competencia.estado !== "inscripciones_cerradas" && competencia.estado !== "en_curso") {
      throw new Error("La competencia no está en un estado que permita generar el playoff.");
    }
  }

  const [parejas, zonas, partidos] = await Promise.all([
    parejasRepository.obtenerPorCompetenciaId(competenciaId),
    esDirecta ? Promise.resolve([]) : zonasRepository.obtenerPorCompetenciaId(competenciaId),
    partidosRepository.getByCompetencia(competenciaId),
  ]);

  if (esDirecta && partidos.length > 0) {
    throw new Error(
      "La competencia tiene partidos de una llave anterior. Eliminalos antes de generarla de nuevo.",
    );
  }

  const resultados = esDirecta
    ? []
    : await resultadoRepository.obtenerPorPartidoIds(
        partidos.filter((partido) => partido.zonaId).map((partido) => partido.id),
      );

  // Eliminación directa pura: sorteo (semilla al azar, queda guardada para reproducirlo).
  // Zonas + playoff: la semilla solo desempata parejas con igual rendimiento y se
  // deriva de la competencia, así la vista previa de la pantalla coincide con lo generado.
  const semilla = esDirecta
    ? Math.floor(Math.random() * 2_147_483_647)
    : semillaDesdeTexto(competenciaId);

  const plan = planificarPlayoff({
    competenciaId,
    formato: competencia.formato,
    parejaIdsActivas: parejas
      .filter((pareja) => pareja.estado === "activa")
      .map((pareja) => pareja.id),
    zonas,
    partidos,
    resultados,
    parejasClasificanPorZona: competencia.parejasClasificanPorZona ?? 2,
    formatoPartidoZona: competencia.formatoPartidoZona ?? "mejor_de_3",
    criteriosDesempate: competencia.reglamento?.criteriosDesempate,
    semilla,
  });

  if (!plan.ok) {
    throw new Error(plan.bloqueos.join("\n"));
  }

  const { cuadro } = plan;
  if (cuadro.partidos.length + 1 > MAX_ESCRITURAS) {
    throw new Error("La llave tiene demasiados partidos para una transacción de Firestore.");
  }

  const competenciaRef = doc(db, COLLECTIONS.competencias, competenciaId);
  const primerPartidoRef = doc(db, COLLECTIONS.partidos, cuadro.partidos[0].id);

  await runTransaction(db, async (transaction) => {
    const competenciaActual = await transaction.get(competenciaRef);
    if (!competenciaActual.exists()) {
      throw new Error("No se encontró la competencia.");
    }
    const datos = competenciaActual.data();
    if (datos.playoffGenerado === true) {
      throw new Error("Esta competencia ya tiene la llave generada.");
    }
    if (datos.estado !== competencia.estado) {
      throw new Error("El estado de la competencia cambió mientras se generaba la llave. Reintentá.");
    }

    // IDs deterministas: si el primer partido ya existe, la llave ya fue escrita.
    const primerPartido = await transaction.get(primerPartidoRef);
    if (primerPartido.exists()) {
      throw new Error("Los partidos de la llave ya existen.");
    }

    for (const partido of cuadro.partidos) {
      transaction.set(
        doc(db, COLLECTIONS.partidos, partido.id),
        partidoMapper.toFirestore(partido),
      );
    }

    transaction.update(competenciaRef, {
      playoffGenerado: true,
      estado: "en_curso",
      semillaSorteo: semilla,
    });
  });

  return {
    cantidadPartidos: cuadro.partidos.length,
    totalRondas: cuadro.totalRondas,
    byes: cuadro.byes,
    fases: [...new Set(cuadro.partidos.map((partido) => partido.fase))],
  };
}
