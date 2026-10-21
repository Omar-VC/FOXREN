import { doc, runTransaction } from "firebase/firestore";

import { db } from "../../infrastructure/firebase/firebase";
import { COLLECTIONS } from "../../infrastructure/firebase/collections";
import { resultadoRepository } from "../../infrastructure/repositories/resultadoRepository";
import { historialRepository } from "../../infrastructure/repositories/historialRepository";
import { competenciaMapper } from "../../infrastructure/mappers/competencia.mapper";

import { crearHistorialDesdeResultado } from "../../domain/historial/historial.service";
import type { Resultado } from "../../domain/resultado/resultado.types";
import { validarTipoResultado } from "../../domain/resultado/resultado.rules";

interface DatosResultado {
  partidoId: string;
  torneoId: string;
  competenciaId: string;
  categoriaId: string;
}

function partidoEstaCerrado(estado: unknown): boolean {
  return estado === "finalizado" || estado === "walkover" ||
    estado === "abandono" || estado === "suspendido";
}

export async function registrarResultado(
  resultado: Omit<Resultado, "id">,
  datos: DatosResultado,
): Promise<string> {
  if (!validarTipoResultado(resultado)) {
    throw new Error("El tipo de resultado o el marcador no es válido.");
  }
  if (resultado.partidoId !== datos.partidoId) {
    throw new Error("El resultado no coincide con el partido seleccionado.");
  }
  // Compatibilidad con resultados antiguos cuyo ID no era el ID del partido.
  if ((await resultadoRepository.obtenerPorPartido(datos.partidoId)).length > 0) {
    throw new Error("El partido ya tiene un resultado registrado.");
  }

  const partidoRef = doc(db, COLLECTIONS.partidos, datos.partidoId);
  const resultadoRef = doc(db, COLLECTIONS.resultados, datos.partidoId);

  return runTransaction(db, async (transaction) => {
    const partidoSnapshot = await transaction.get(partidoRef);
    if (!partidoSnapshot.exists()) {
      throw new Error("No se encontró el partido.");
    }

    const partido = partidoSnapshot.data();
    if (partidoEstaCerrado(partido.estado)) {
      throw new Error("El partido ya se encuentra cerrado.");
    }
    if (partido.competenciaId !== datos.competenciaId) {
      throw new Error("El partido no pertenece a la competencia indicada.");
    }
    if (partido.pareja1Id === partido.pareja2Id) {
      throw new Error("Las parejas del partido no pueden ser iguales.");
    }

    const pareja1Ref = doc(db, COLLECTIONS.parejas, partido.pareja1Id);
    const pareja2Ref = doc(db, COLLECTIONS.parejas, partido.pareja2Id);
    const competenciaRef = doc(db, COLLECTIONS.competencias, partido.competenciaId);
    const [pareja1Snapshot, pareja2Snapshot, competenciaSnapshot, resultadoSnapshot] =
      await Promise.all([
        transaction.get(pareja1Ref),
        transaction.get(pareja2Ref),
        transaction.get(competenciaRef),
        transaction.get(resultadoRef),
      ]);

    if (!pareja1Snapshot.exists() || !pareja2Snapshot.exists()) {
      throw new Error("No se encontraron las parejas del partido.");
    }
    if (!competenciaSnapshot.exists()) {
      throw new Error("No se encontró la competencia del partido.");
    }
    if (resultadoSnapshot.exists()) {
      throw new Error("El partido ya tiene un resultado registrado.");
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
    if (competencia.torneoId !== datos.torneoId ||
        competencia.categoriaId !== datos.categoriaId) {
      throw new Error("Los datos del torneo o categoría no coinciden con la competencia.");
    }

    const idsParejas = [partido.pareja1Id, partido.pareja2Id];
    if (resultado.ganadorParejaId && !idsParejas.includes(resultado.ganadorParejaId)) {
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

    const resultadoPersistido: Omit<Resultado, "id"> = {
      ...resultado,
      partidoId: datos.partidoId,
    };
    const resultadoId = await resultadoRepository.crearResultado(
      resultadoPersistido,
      transaction,
      datos.partidoId,
    );

    const estado = resultado.tipo === "normal"
      ? "finalizado"
      : resultado.tipo === "walkover"
        ? "walkover"
        : resultado.tipo === "abandono"
          ? "abandono"
          : "suspendido";

    transaction.update(partidoRef, {
      estado,
      sets: resultado.sets,
      ganadorParejaId: resultado.ganadorParejaId ?? null,
    });

    if (resultado.oficial && resultado.tipo !== "suspension") {
      const registrosHistorial = crearHistorialDesdeResultado(
        {
          ...resultadoPersistido,
          id: resultadoId,
        },
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
      for (const registro of registrosHistorial) {
        await historialRepository.crearRegistro(registro, transaction);
      }
    }

    return resultadoId;
  });
}
