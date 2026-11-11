import { useCallback, useEffect, useState } from "react";

import { torneosRepository } from "../../../../infrastructure/repositories/torneosRepository";

import type { Torneo } from "../../../../domain/torneo/torneo.types";

/** Con `complejoId` carga solo los torneos de ese complejo; sin él, todos. */
export function useTorneos(complejoId?: string) {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarTorneos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const datos =
        await torneosRepository.obtenerTorneos(complejoId);

      setTorneos(datos);
    } catch {
      setError("No se pudieron cargar los torneos.");
    } finally {
      setCargando(false);
    }
  }, [complejoId]);

  async function crearTorneo(
    datos: Omit<Torneo, "id" | "fechaCreacion">
  ) {
    try {
      setCreando(true);
      setError(null);

      await torneosRepository.crearTorneo(datos);

      await cargarTorneos();
    } catch {
      setError("No se pudo crear el torneo.");
      throw new Error("Error al crear torneo");
    } finally {
      setCreando(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(cargarTorneos);
  }, [cargarTorneos]);

  return {
    torneos,
    cargando,
    creando,
    error,
    crearTorneo,
  };
}
