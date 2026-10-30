import { collection, doc, runTransaction } from "firebase/firestore";

import { db } from "../../infrastructure/firebase/firebase";
import { COLLECTIONS } from "../../infrastructure/firebase/collections";
import { competenciasRepository } from "../../infrastructure/repositories/competenciasRepository";
import { partidosRepository } from "../../infrastructure/repositories/partidosRepository";
import { parejasRepository } from "../../infrastructure/repositories/parejasRepository";

import {
  generarCuadroEliminacion,
  calcularTotalRondas,
  esPotenciaDeDos,
} from "../../domain/competencia/competencia.playoff.rules";

export interface ResultadoGeneracionLlaves {
  cantidadPartidos: number;
  totalRondas: number;
  fases: string[];
}

export async function generarLlavesEliminacionDirecta(
  competenciaId: string,
): Promise<ResultadoGeneracionLlaves> {
  const competencia =
    await competenciasRepository.obtenerPorId(competenciaId);

  if (!competencia) {
    throw new Error("No se encontró la competencia.");
  }

  if (competencia.formato !== "eliminacion_directa") {
    throw new Error(
      "Esta competencia no está configurada con formato de eliminación directa.",
    );
  }

  if (competencia.estado !== "inscripciones_cerradas") {
    throw new Error(
      "Las inscripciones deben estar cerradas antes de generar las llaves.",
    );
  }

  // Verificar que no existan partidos previos generados
  const partidosExistentes =
    await partidosRepository.getByCompetencia(competenciaId);
  if (partidosExistentes.length > 0) {
    throw new Error(
      "Esta competencia ya tiene partidos generados.",
    );
  }

  const parejas =
    await parejasRepository.obtenerPorCompetenciaId(competenciaId);

  const parejasActivas = parejas.filter(
    (pareja) => pareja.estado === "activa",
  );

  if (parejasActivas.length < 2) {
    throw new Error(
      "Se necesitan al menos dos parejas activas para generar las llaves.",
    );
  }

  if (!esPotenciaDeDos(parejasActivas.length)) {
    throw new Error(
      `La cantidad de parejas activas (${parejasActivas.length}) debe ser una potencia de 2 (2, 4, 8, 16, ...) para generar un cuadro de eliminación directa sin byes.`,
    );
  }

  const totalRondas = calcularTotalRondas(parejasActivas.length);
  const parejaIds = parejasActivas.map((pareja) => pareja.id);

  const partidos = generarCuadroEliminacion(competenciaId, parejaIds);

  const competenciaRef = doc(db, COLLECTIONS.competencias, competenciaId);
  await runTransaction(db, async (transaction) => {
    const competenciaActual = await transaction.get(competenciaRef);
    if (!competenciaActual.exists()) {
      throw new Error("No se encontró la competencia.");
    }

    // Marcar que las llaves están generadas
    transaction.update(competenciaRef, {
      zonasGeneradas: true, // Reusamos este campo como indicador de estructura generada
    });

    for (const partido of partidos) {
      const partidoRef = doc(collection(db, COLLECTIONS.partidos));

      // Limpiar valores undefined para evitar errores de Firestore
      const datosPartido: Record<string, unknown> = {
        competenciaId: partido.competenciaId,
        fase: partido.fase,
        ronda: partido.ronda,
        partidoNumero: partido.partidoNumero,
        pareja1Id: partido.pareja1Id,
        pareja2Id: partido.pareja2Id,
        estado: partido.estado,
        sets: partido.sets,
        ganadorParejaId: partido.ganadorParejaId ?? null,
        orden: partido.orden,
        fechaHora: partido.fechaHora ?? null,
        cancha: partido.cancha ?? null,
        notas: partido.notas ?? null,
        tipoPartido: "eliminacion_directa",
      };

      // Omitir campos con valor undefined (Firestore no los acepta)
      const datosLimpios = Object.fromEntries(
        Object.entries(datosPartido).filter(([, value]) => value !== undefined),
      );

      transaction.set(partidoRef, datosLimpios);
    }
  });

  return {
    cantidadPartidos: partidos.length,
    totalRondas,
    fases: [...new Set(partidos.map((p) => p.fase))],
  };
}

export async function asignarGanadorARondaSiguiente(
  competenciaId: string,
  partidoOrigenId: string,
  parejaGanadoraId: string,
): Promise<void> {
  const partidos = await partidosRepository.getByCompetencia(competenciaId);

  const partidoOrigen = partidos.find((p) => p.id === partidoOrigenId);
  if (!partidoOrigen) {
    throw new Error("No se encontró el partido de origen.");
  }

  const rondaOrigen = Number(partidoOrigen.ronda) ?? 0;

  // Buscar el partido de la siguiente ronda que debe recibir al ganador
  // Los placeholders tienen pareja1Id o pareja2Id como null
  const partidoDestino = partidos.find((p) => {
    const rondaDestino = Number(p.ronda) ?? 0;
    return (
      rondaDestino === rondaOrigen + 1 &&
      (p.pareja1Id === null || p.pareja2Id === null)
    );
  });

  if (!partidoDestino) {
    // No hay ronda siguiente, es la final
    return;
  }

  // Determinar si se asigna a pareja1 o pareja2 (los placeholders usan null)
  const esPareja1Vacia = partidoDestino.pareja1Id === null;

  await partidosRepository.updateResultado(partidoDestino.id, {
    ...(esPareja1Vacia ? { pareja1Id: parejaGanadoraId } : { pareja2Id: parejaGanadoraId }),
  });
}
