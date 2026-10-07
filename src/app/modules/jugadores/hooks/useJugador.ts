import { useEffect, useState } from "react";

import { jugadoresRepository } from "../../../../infrastructure/repositories/jugadoresRepository";

import type { Jugador } from "../../../../domain/jugador/jugador.types";

export function useJugador(id: string | undefined) {
  const [jugador, setJugador] = useState<Jugador | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

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

      const datos = await jugadoresRepository.obtenerJugadorPorId(id);

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

  async function actualizarJugador(datos: Partial<Jugador>) {
    if (!id) {
      throw new Error("Jugador no encontrado.");
    }

    try {
      setGuardando(true);
      setError(null);

      await jugadoresRepository.actualizarJugador(id, datos);

      const jugadorActualizado =
        await jugadoresRepository.obtenerJugadorPorId(id);

      setJugador(jugadorActualizado);
    } catch (error) {
      console.error("ERROR REAL AL ACTUALIZAR JUGADOR:", error);

      setError("No se pudo actualizar el jugador.");

      throw error;
    } finally {
      setGuardando(false);
    }
  }

  useEffect(() => {
    cargarJugador();
  }, [id]);

  return {
    jugador,
    cargando,
    error,
    guardando,
    actualizarJugador,
  };
}
