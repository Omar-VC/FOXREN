import { useEffect, useState } from "react";

import { competenciasRepository } from "../../../../infrastructure/repositories/competenciasRepository";

import type { Competencia } from "../../../../domain/competencia/competencia.types";

export function useCompetenciasPorTorneo(torneoId: string) {
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cargarCompetencias() {
    try {
      setCargando(true);
      setError(null);

      const datos =
        await competenciasRepository.obtenerPorTorneoId(
          torneoId
        );

      setCompetencias(datos);
    } catch {
      setError("No se pudieron cargar las competencias.");
    } finally {
      setCargando(false);
    }
  }

  async function crearCompetencia(
    datos: Omit<Competencia, "id">
  ) {
    try {
      setCreando(true);
      setError(null);

      await competenciasRepository.crearCompetencia(datos);

      await cargarCompetencias();
    } catch {
      setError("No se pudo crear la competencia.");
      throw new Error("Error al crear competencia");
    } finally {
      setCreando(false);
    }
  }

  useEffect(() => {
    if (torneoId) {
      cargarCompetencias();
    }
  }, [torneoId]);

  return {
    competencias,
    cargando,
    creando,
    error,
    crearCompetencia,
  };
}