import { doc, runTransaction } from "firebase/firestore";

import { db } from "../../infrastructure/firebase/firebase";
import { COLLECTIONS } from "../../infrastructure/firebase/collections";
import { competenciaMapper } from "../../infrastructure/mappers/competencia.mapper";
import { historialRepository } from "../../infrastructure/repositories/historialRepository";
import { resultadoRepository } from "../../infrastructure/repositories/resultadoRepository";
import { crearHistorialDesdeResultado } from "../../domain/historial/historial.service";
import type { Resultado, VersionResultado } from "../../domain/resultado/resultado.types";
import { validarTipoResultado } from "../../domain/resultado/resultado.rules";

/** Reemplaza la suspensión pendiente con una resolución deportiva del administrador. */
export async function resolverSuspension(
  resultado: Omit<Resultado, "id">,
): Promise<string> {
  if (resultado.tipo === "suspension" || !validarTipoResultado(resultado)) {
    throw new Error("La resolución debe ser un resultado válido distinto de una suspensión.");
  }

  const partidoRef = doc(db, COLLECTIONS.partidos, resultado.partidoId);
  const resultadoRef = doc(db, COLLECTIONS.resultados, resultado.partidoId);

  return runTransaction(db, async (transaction) => {
    const partidoSnapshot = await transaction.get(partidoRef);
    const resultadoSnapshot = await transaction.get(resultadoRef);
    if (!partidoSnapshot.exists() || !resultadoSnapshot.exists()) {
      throw new Error("No se encontró la suspensión que se quiere resolver.");
    }

    const partido = partidoSnapshot.data();
    if (partido.estado !== "suspendido" || resultadoSnapshot.data().tipo !== "suspension") {
      throw new Error("El partido ya no tiene una suspensión pendiente de resolución.");
    }
    if (partido.pareja1Id === partido.pareja2Id) {
      throw new Error("Las parejas del partido no pueden ser iguales.");
    }

    const pareja1Ref = doc(db, COLLECTIONS.parejas, partido.pareja1Id);
    const pareja2Ref = doc(db, COLLECTIONS.parejas, partido.pareja2Id);
    const competenciaRef = doc(db, COLLECTIONS.competencias, partido.competenciaId);
    const [pareja1Snapshot, pareja2Snapshot, competenciaSnapshot] = await Promise.all([
      transaction.get(pareja1Ref),
      transaction.get(pareja2Ref),
      transaction.get(competenciaRef),
    ]);

    if (!pareja1Snapshot.exists() || !pareja2Snapshot.exists() || !competenciaSnapshot.exists()) {
      throw new Error("Faltan datos de las parejas o de la competencia.");
    }

    const pareja1 = pareja1Snapshot.data();
    const pareja2 = pareja2Snapshot.data();
    if (pareja1.competenciaId !== partido.competenciaId ||
        pareja2.competenciaId !== partido.competenciaId ||
        typeof pareja1.jugador1Id !== "string" ||
        typeof pareja1.jugador2Id !== "string" ||
        typeof pareja2.jugador1Id !== "string" ||
        typeof pareja2.jugador2Id !== "string") {
      throw new Error("Una pareja no pertenece a la competencia del partido.");
    }

    const competencia = competenciaMapper.fromFirestore(
      competenciaSnapshot.id,
      competenciaSnapshot.data(),
    );
    if (resultado.ganadorParejaId &&
        resultado.ganadorParejaId !== partido.pareja1Id &&
        resultado.ganadorParejaId !== partido.pareja2Id) {
      throw new Error("La pareja ganadora no pertenece al partido.");
    }
    if (resultado.tipo === "normal") {
      const setsGanadosPareja1 = resultado.sets.filter(
        (set) => set.juegosPareja1 > set.juegosPareja2,
      ).length;
      const ganadorEsperado = setsGanadosPareja1 === 2
        ? partido.pareja1Id
        : partido.pareja2Id;
      if (resultado.ganadorParejaId !== ganadorEsperado) {
        throw new Error("La pareja ganadora no coincide con el marcador.");
      }
    }

    const suspensionAnterior = resultadoSnapshot.data();
    const fechaSuspension = suspensionAnterior.fechaRegistro;
    const fechaSuspensionDate = fechaSuspension instanceof Date
      ? fechaSuspension
      : typeof fechaSuspension?.toDate === "function"
        ? fechaSuspension.toDate()
        : null;
    if (!fechaSuspensionDate) {
      throw new Error("La suspensión no tiene una fecha válida para conservar su historial.");
    }
    const versionesAnteriores = Array.isArray(suspensionAnterior.versiones)
      ? suspensionAnterior.versiones as VersionResultado[]
      : [];
    const versionSuspension: VersionResultado = {
      tipo: "suspension",
      sets: Array.isArray(suspensionAnterior.sets) ? suspensionAnterior.sets : [],
      oficial: suspensionAnterior.oficial === true,
      fechaRegistro: fechaSuspensionDate,
    };
    const resultadoPersistido = {
      ...resultado,
      partidoId: partidoSnapshot.id,
      versiones: [...versionesAnteriores, versionSuspension],
    };
    const resultadoId = resultadoRepository.actualizarResultado(
      resultadoPersistido,
      transaction,
      partidoSnapshot.id,
    );
    const estado = resultado.tipo === "normal"
      ? "finalizado"
      : resultado.tipo === "walkover"
        ? "walkover"
        : "abandono";
    transaction.update(partidoRef, {
      estado,
      sets: resultado.sets,
      ganadorParejaId: resultado.ganadorParejaId ?? null,
    });

    if (resultado.oficial) {
      const registros = crearHistorialDesdeResultado(
        { ...resultadoPersistido, id: resultadoId },
        {
          torneoId: competencia.torneoId,
          competenciaId: competencia.id,
          categoriaId: competencia.categoriaId,
          pareja1: {
            parejaId: pareja1Snapshot.id,
            jugador1Id: String(pareja1.jugador1Id),
            jugador2Id: String(pareja1.jugador2Id),
          },
          pareja2: {
            parejaId: pareja2Snapshot.id,
            jugador1Id: String(pareja2.jugador1Id),
            jugador2Id: String(pareja2.jugador2Id),
          },
        },
      );
      for (const registro of registros) {
        await historialRepository.crearRegistro(registro, transaction);
      }
    }

    return resultadoId;
  });
}
