import {
  doc,
  runTransaction,
} from "firebase/firestore";

import { db } from "../../infrastructure/firebase/firebase";
import { COLLECTIONS } from "../../infrastructure/firebase/collections";

import { resultadoRepository } from "../../infrastructure/repositories/resultadoRepository";
import { historialRepository } from "../../infrastructure/repositories/historialRepository";
import { parejasRepository } from "../../infrastructure/repositories/parejasRepository";
import { partidosRepository } from "../../infrastructure/repositories/partidosRepository";

import { crearHistorialDesdeResultado } from "../../domain/historial/historial.service";
import type { Resultado } from "../../domain/resultado/resultado.types";
import { validarTipoResultado } from "../../domain/resultado/resultado.rules";

interface DatosResultado {
  partidoId: string;
  torneoId: string;
  competenciaId: string;
  categoriaId: string;
}

export async function registrarResultado(
  resultado: Omit<Resultado, "id">,
  datos: DatosResultado,
): Promise<string> {
  const partido = await partidosRepository.obtenerPorId(
    datos.partidoId
  );

  if (!partido) {
    throw new Error("No se encontró el partido.");
  }

  if (
    partido.estado === "finalizado" ||
    partido.estado === "walkover" ||
    partido.estado === "abandono" ||
    partido.estado === "suspendido"
  ) {
    throw new Error(
      "El partido ya se encuentra cerrado."
    );
  }

  const resultadosExistentes =
    await resultadoRepository.obtenerPorPartido(
      datos.partidoId
    );

  if (resultadosExistentes.length > 0) {
    throw new Error(
      "El partido ya tiene un resultado registrado."
    );
  }

  if (partido.pareja1Id === partido.pareja2Id) {
    throw new Error(
      "Las parejas del partido no pueden ser iguales."
    );
  }

  const pareja1 =
    await parejasRepository.obtenerPorId(
      partido.pareja1Id
    );

  const pareja2 =
    await parejasRepository.obtenerPorId(
      partido.pareja2Id
    );

  if (!pareja1 || !pareja2) {
    throw new Error(
      "No se encontraron las parejas del partido."
    );
  }

  if (!validarTipoResultado(resultado)) {
    throw new Error(
      "El tipo de resultado no es válido."
    );
  }

  if (
    resultado.ganadorParejaId &&
    resultado.ganadorParejaId !== partido.pareja1Id &&
    resultado.ganadorParejaId !== partido.pareja2Id
  ) {
    throw new Error(
      "La pareja ganadora no pertenece al partido."
    );
  }

  const registrosHistorial =
    resultado.oficial
      ? crearHistorialDesdeResultado(
          {
            ...resultado,
            id: "",
            partidoId: datos.partidoId,
          },
          {
            torneoId: datos.torneoId,
            competenciaId: datos.competenciaId,
            categoriaId: datos.categoriaId,
            pareja1: {
              parejaId: pareja1.id,
              jugador1Id: pareja1.jugador1Id,
              jugador2Id: pareja1.jugador2Id,
            },
            pareja2: {
              parejaId: pareja2.id,
              jugador1Id: pareja2.jugador1Id,
              jugador2Id: pareja2.jugador2Id,
            },
          }
        )
      : [];

  return await runTransaction(
    db,
    async (transaction) => {
      const partidoRef = doc(
        db,
        COLLECTIONS.partidos,
        datos.partidoId
      );

      const partidoActual =
        await transaction.get(partidoRef);

      if (!partidoActual.exists()) {
        throw new Error(
          "No se encontró el partido."
        );
      }

      const datosPartidoActual =
        partidoActual.data();

      if (
        datosPartidoActual.estado === "finalizado" ||
        datosPartidoActual.estado === "walkover" ||
        datosPartidoActual.estado === "abandono" ||
        datosPartidoActual.estado === "suspendido"
      ) {
        throw new Error(
          "El partido ya se encuentra cerrado."
        );
      }

      const resultadoId =
        await resultadoRepository.crearResultado(
          {
            ...resultado,
            partidoId: datos.partidoId,
          },
          transaction
        );

      await partidosRepository.updateResultado(
        datos.partidoId,
        {
          estado:
            resultado.tipo === "normal"
              ? "finalizado"
              : resultado.tipo === "walkover"
                ? "walkover"
                : resultado.tipo === "abandono"
                  ? "abandono"
                  : "suspendido",
          sets: resultado.sets,
          ganadorParejaId:
            resultado.ganadorParejaId,
        },
        transaction
      );

      for (const registro of registrosHistorial) {
        await historialRepository.crearRegistro(
          registro,
          transaction
        );
      }

      return resultadoId;
    }
  );
}
