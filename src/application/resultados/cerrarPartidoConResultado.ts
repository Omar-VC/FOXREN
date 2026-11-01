import { doc, runTransaction } from "firebase/firestore";

import { db } from "../../infrastructure/firebase/firebase";
import { COLLECTIONS } from "../../infrastructure/firebase/collections";
import { resultadoRepository } from "../../infrastructure/repositories/resultadoRepository";
import { historialRepository } from "../../infrastructure/repositories/historialRepository";
import { competenciaMapper } from "../../infrastructure/mappers/competencia.mapper";
import { partidoMapper } from "../../infrastructure/mappers/partido.mapper";

import { crearHistorialDesdeResultado } from "../../domain/historial/historial.service";
import type { Resultado, VersionResultado } from "../../domain/resultado/resultado.types";
import {
  exigirParejasDefinidas,
  planificarCierreResultado,
} from "../../domain/resultado/resultado.cierre";

export interface DatosVerificacionResultado {
  partidoId: string;
  torneoId: string;
  competenciaId: string;
  categoriaId: string;
}

export type ModoCierreResultado = "registrar" | "resolver_suspension";

function partidoEstaCerrado(estado: unknown): boolean {
  return estado === "finalizado" || estado === "walkover" ||
    estado === "abandono" || estado === "suspendido";
}

/**
 * Núcleo común de registrarResultado y resolverSuspension. En UNA transacción:
 * valida, guarda el resultado, cierra el partido, genera el historial y, si es de
 * una llave, ubica al ganador en el partido siguiente o, en la final, guarda el
 * campeón y pasa la competencia a "finalizada".
 *
 * Firestore exige todas las lecturas antes de la primera escritura: por eso el
 * partido siguiente se lee junto con las demás lecturas.
 */
export async function cerrarPartidoConResultado(
  resultado: Omit<Resultado, "id">,
  modo: ModoCierreResultado,
  verificacion?: DatosVerificacionResultado,
): Promise<string> {
  const partidoRef = doc(db, COLLECTIONS.partidos, resultado.partidoId);
  const resultadoRef = doc(db, COLLECTIONS.resultados, resultado.partidoId);

  return runTransaction(db, async (transaction) => {
    /* ---------------------------- Lecturas ---------------------------- */
    const partidoSnapshot = await transaction.get(partidoRef);
    if (!partidoSnapshot.exists()) {
      throw new Error(
        modo === "registrar"
          ? "No se encontró el partido."
          : "No se encontró la suspensión que se quiere resolver.",
      );
    }
    const partido = partidoMapper.fromFirestore(partidoSnapshot.id, partidoSnapshot.data());

    // Antes de armar referencias: un partido de ronda futura tiene parejas en null.
    const [pareja1Id, pareja2Id] = exigirParejasDefinidas(partido);

    const pareja1Ref = doc(db, COLLECTIONS.parejas, pareja1Id);
    const pareja2Ref = doc(db, COLLECTIONS.parejas, pareja2Id);
    const competenciaRef = doc(db, COLLECTIONS.competencias, partido.competenciaId);
    const destinoRef = partido.partidoSiguienteId
      ? doc(db, COLLECTIONS.partidos, partido.partidoSiguienteId)
      : null;

    const [pareja1Snapshot, pareja2Snapshot, competenciaSnapshot, resultadoSnapshot, destinoSnapshot] =
      await Promise.all([
        transaction.get(pareja1Ref),
        transaction.get(pareja2Ref),
        transaction.get(competenciaRef),
        transaction.get(resultadoRef),
        destinoRef ? transaction.get(destinoRef) : Promise.resolve(null),
      ]);

    /* ------------------------- Validaciones ------------------------- */
    if (verificacion && partido.competenciaId !== verificacion.competenciaId) {
      throw new Error("El partido no pertenece a la competencia indicada.");
    }

    if (modo === "registrar") {
      if (partidoEstaCerrado(partido.estado)) {
        throw new Error("El partido ya se encuentra cerrado.");
      }
      if (resultadoSnapshot.exists()) {
        throw new Error("El partido ya tiene un resultado registrado.");
      }
    } else {
      if (resultado.tipo === "suspension") {
        throw new Error("La resolución debe ser un resultado válido distinto de una suspensión.");
      }
      if (partido.estado !== "suspendido" || !resultadoSnapshot.exists() ||
          resultadoSnapshot.data().tipo !== "suspension") {
        throw new Error("El partido ya no tiene una suspensión pendiente de resolución.");
      }
    }

    if (!pareja1Snapshot.exists() || !pareja2Snapshot.exists()) {
      throw new Error("No se encontraron las parejas del partido.");
    }
    if (!competenciaSnapshot.exists()) {
      throw new Error("No se encontró la competencia del partido.");
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
    if (verificacion &&
        (competencia.torneoId !== verificacion.torneoId ||
          competencia.categoriaId !== verificacion.categoriaId)) {
      throw new Error("Los datos del torneo o categoría no coinciden con la competencia.");
    }

    // Todas las reglas deportivas y de la llave viven en el dominio.
    const plan = planificarCierreResultado({
      partido,
      competencia,
      resultado,
      destino: destinoSnapshot && destinoSnapshot.exists()
        ? {
            pareja1Id: typeof destinoSnapshot.data().pareja1Id === "string"
              ? destinoSnapshot.data().pareja1Id
              : null,
            pareja2Id: typeof destinoSnapshot.data().pareja2Id === "string"
              ? destinoSnapshot.data().pareja2Id
              : null,
          }
        : null,
    });

    /* ------------------------ Resultado a guardar ------------------------ */
    let resultadoPersistido: Omit<Resultado, "id"> = {
      ...resultado,
      partidoId: partidoSnapshot.id,
    };

    if (modo === "resolver_suspension") {
      const suspensionAnterior = resultadoSnapshot.data()!;
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
      resultadoPersistido = {
        ...resultadoPersistido,
        versiones: [...versionesAnteriores, versionSuspension],
      };
    }

    /* ---------------------------- Escrituras ---------------------------- */
    const resultadoId = modo === "registrar"
      ? resultadoRepository.crearResultado(resultadoPersistido, transaction, partidoSnapshot.id)
      : resultadoRepository.actualizarResultado(resultadoPersistido, transaction, partidoSnapshot.id);

    transaction.update(partidoRef, {
      estado: plan.estadoPartido,
      sets: resultado.sets,
      ganadorParejaId: plan.ganadorParejaId,
    });

    if (plan.avance) {
      transaction.update(
        doc(db, COLLECTIONS.partidos, plan.avance.partidoId),
        plan.avance.datos,
      );
    }

    if (plan.campeonParejaId) {
      transaction.update(competenciaRef, {
        estado: "finalizada",
        campeonParejaId: plan.campeonParejaId,
      });
    }

    if (resultado.oficial && resultado.tipo !== "suspension") {
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
        historialRepository.crearRegistro(registro, transaction);
      }
    }

    return resultadoId;
  });
}
