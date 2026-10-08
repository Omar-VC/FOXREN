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

  await zonasRepository.crearMuchas(zonas);
}