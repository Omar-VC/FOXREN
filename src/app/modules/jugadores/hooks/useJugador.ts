import { useEffect, useState } from "react";

import { jugadoresRepository } from "../../../../infrastructure/repositories/jugadoresRepository";

import type { Jugador } from "../../../../domain/jugador/jugador.types";

export function useJugador(id: string | undefined) {
  const [jugador, setJugador] = useState<Jugador | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargarJugador() {
    if (!id) {
      setJugador(null);
      setCargando(false);
      setError("Jugador no encontrado.");
      return;
    }

    try {
      setCargando(true);
      setError(null);

      const datos =
        await jugadoresRepository.obtenerJugadorPorId(id);

      if (!datos) {
        setJugador(null);
        setError("Jugador no encontrado.");
        return;
      }

      setJugador(datos);
    } catch {
      setError("No se pudo cargar el jugador.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarJugador();
  }, [id]);

  return {
    jugador,
    cargando,
    error,
  };
}