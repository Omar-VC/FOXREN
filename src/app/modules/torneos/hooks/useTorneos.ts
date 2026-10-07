import { useEffect, useState } from "react";

import { torneosRepository } from "../../../../infrastructure/repositories/torneosRepository";

import type { Torneo } from "../../../../domain/torneo/torneo.types";

export function useTorneos() {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cargarTorneos() {
    try {
      setCargando(true);
      setError(null);

      const datos =
        await torneosRepository.obtenerTorneos();

      setTorneos(datos);
    } catch {
      setError("No se pudieron cargar los torneos.");
    } finally {
      setCargando(false);
    }
  }

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
    cargarTorneos();
  }, []);

  return {
    torneos,
    cargando,
    creando,
    error,
    crearTorneo,
  };
}