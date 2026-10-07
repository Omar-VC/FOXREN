import { useEffect, useState } from "react";

import { torneosRepository } from "../../../../infrastructure/repositories/torneosRepository";

import type { Torneo } from "../../../../domain/torneo/torneo.types";

export function useTorneosPorCircuito(circuitoId: string) {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarTorneos() {
      try {
        setCargando(true);
        setError(null);

        const datos =
          await torneosRepository.obtenerTorneosPorCircuito(
            circuitoId
          );

        setTorneos(datos);
      } catch {
        setError(
          "No se pudieron cargar los torneos."
        );
      } finally {
        setCargando(false);
      }
    }

    if (circuitoId) {
      cargarTorneos();
    }
  }, [circuitoId]);

  return {
    torneos,
    cargando,
    error,
  };
}