import { useEffect, useState } from "react";

import { complejosRepository } from "../../../../infrastructure/repositories/complejosRepository";

import type { Complejo } from "../../../../domain/complejo/complejo.types";

export function useComplejosPorCircuito(circuitoId: string) {
  const [complejos, setComplejos] = useState<Complejo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarComplejos() {
      try {
        setCargando(true);
        setError(null);

        const datos =
          await complejosRepository.obtenerComplejosPorCircuito(
            circuitoId
          );

        setComplejos(
          datos.filter(
            (complejo) => complejo.estado === "activo"
          )
        );
      } catch {
        setError(
          "No se pudieron cargar los complejos."
        );
      } finally {
        setCargando(false);
      }
    }

    if (circuitoId) {
      cargarComplejos();
    }
  }, [circuitoId]);

  return {
    complejos,
    cargando,
    error,
  };
}