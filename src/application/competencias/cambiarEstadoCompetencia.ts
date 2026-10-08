import type { EstadoCompetencia } from "../../domain/competencia/competencia.types";
import { competenciaPuedePasarA } from "../../domain/competencia/competencia.rules";
import { competenciasRepository } from "../../infrastructure/repositories/competenciasRepository";

export async function cambiarEstadoCompetencia(
  competenciaId: string,
  nuevoEstado: EstadoCompetencia,
): Promise<void> {
  const competencia =
    await competenciasRepository.obtenerPorId(competenciaId);

  if (!competencia) {
    throw new Error("No se encontró la competencia.");
  }

  if (!competenciaPuedePasarA(competencia, nuevoEstado)) {
    throw new Error(
      `No se puede pasar la competencia de "${competencia.estado}" a "${nuevoEstado}".`,
    );
  }

  await competenciasRepository.cambiarEstado(
    competenciaId,
    nuevoEstado,
  );
}