import { useEffect, useState } from "react";

import { jugadoresRepository } from "../../../../infrastructure/repositories/jugadoresRepository";

import type { Jugador } from "../../../../domain/jugador/jugador.types";

export function useJugadores() {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cargarJugadores() {
    try {
      setCargando(true);
      setError(null);

      const datos =
        await jugadoresRepository.obtenerJugadores();

      setJugadores(datos);
    } catch {
      setError("No se pudieron cargar los jugadores.");
    } finally {
      setCargando(false);
    }
  }

  async function crearJugador(
    datos: Omit<Jugador, "id">
  ) {
    try {
      setCreando(true);
      setError(null);

      await jugadoresRepository.crearJugador(datos);

      await cargarJugadores();
    } catch {
      setError("No se pudo crear el jugador.");
      throw new Error("Error al crear jugador");
    } finally {
      setCreando(false);
    }
  }

  useEffect(() => {
    cargarJugadores();
  }, []);

  return {
    jugadores,
    cargando,
    creando,
    error,
    crearJugador,
  };
}