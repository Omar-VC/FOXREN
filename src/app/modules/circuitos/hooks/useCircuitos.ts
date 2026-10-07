import { useEffect, useState } from "react";

import { circuitosRepository } from "../../../../infrastructure/repositories/circuitosRepository";

import type { Circuito } from "../../../../domain/circuito/circuito.types";

export function useCircuitos() {
  const [circuitos, setCircuitos] = useState<Circuito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cargarCircuitos() {
    try {
      setCargando(true);
      setError(null);

      const datos =
        await circuitosRepository.obtenerCircuitos();

      setCircuitos(datos);
    } catch {
      setError("No se pudieron cargar los circuitos.");
    } finally {
      setCargando(false);
    }
  }

  async function crearCircuito(
    datos: Omit<Circuito, "id" | "fechaCreacion">
  ) {
    try {
      setCreando(true);
      setError(null);

      await circuitosRepository.crearCircuito(datos);

      await cargarCircuitos();
    } catch {
      setError("No se pudo crear el circuito.");
      throw new Error("Error al crear circuito");
    } finally {
      setCreando(false);
    }
  }

  useEffect(() => {
    cargarCircuitos();
  }, []);

  return {
    circuitos,
    cargando,
    creando,
    error,
    crearCircuito,
  };
}