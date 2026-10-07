import { useEffect, useState } from "react";

import { complejosRepository } from "../../../../infrastructure/repositories/complejosRepository";

import type { Complejo } from "../../../../domain/complejo/complejo.types";

export function useComplejos() {
  const [complejos, setComplejos] = useState<Complejo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cargarComplejos() {
    try {
      setCargando(true);
      setError(null);

      const datos =
        await complejosRepository.obtenerComplejos();

      setComplejos(datos);
    } catch {
      setError("No se pudieron cargar los complejos.");
    } finally {
      setCargando(false);
    }
  }

  async function crearComplejo(
    datos: Omit<Complejo, "id" | "fechaCreacion">
  ) {
    try {
      setCreando(true);
      setError(null);

      await complejosRepository.crearComplejo(datos);

      await cargarComplejos();
    } catch {
      setError("No se pudo crear el complejo.");
      throw new Error("Error al crear complejo");
    } finally {
      setCreando(false);
    }
  }

  useEffect(() => {
    cargarComplejos();
  }, []);

  return {
    complejos,
    cargando,
    creando,
    error,
    crearComplejo,
  };
}