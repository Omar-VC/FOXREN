import { useEffect, useState } from "react";

import { generarZonasCompetencia } from "../../../../application/competencias/generarZonasCompetencia";
import { zonasRepository } from "../../../../infrastructure/repositories/zonasRepository";
import { parejasRepository } from "../../../../infrastructure/repositories/parejasRepository";
import { jugadoresRepository } from "../../../../infrastructure/repositories/jugadoresRepository";
import type { Zona } from "../../../../domain/competencia/competencia.zonas.types";

interface Props {
  competenciaId: string;
  inscripcionesCerradas: boolean;
  actualizacion: number;
}

export default function ZonasCompetenciaAdmin({
  competenciaId,
  inscripcionesCerradas,
  actualizacion,
}: Props) {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [cantidadZonas, setCantidadZonas] = useState(2);
  const [cantidadParejasActivas, setCantidadParejasActivas] = useState(0);
  const [nombresParejas, setNombresParejas] = useState<Record<string, string>>(
    {},
  );
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cargarDatos() {
    setCargando(true);
    setError(null);

    try {
      const [zonasGuardadas, parejas] = await Promise.all([
        zonasRepository.obtenerPorCompetenciaId(competenciaId),
        parejasRepository.obtenerPorCompetenciaId(competenciaId),
      ]);

      const parejasActivas = parejas.filter(
        (pareja) => pareja.estado === "activa",
      );

      setZonas(zonasGuardadas);
      setCantidadParejasActivas(parejasActivas.length);

      const parejasEnZonas = new Set(
        zonasGuardadas.flatMap((zona) => zona.parejaIds),
      );

      const parejasParaMostrar = parejas.filter((pareja) =>
        parejasEnZonas.has(pareja.id),
      );

      const idsJugadores = [
        ...new Set(
          parejasParaMostrar.flatMap((pareja) => [
            pareja.jugador1Id,
            pareja.jugador2Id,
          ]),
        ),
      ];

      const jugadores = await Promise.all(
        idsJugadores.map((id) => jugadoresRepository.obtenerJugadorPorId(id)),
      );

      const nombresJugadores = new Map<string, string>();

      jugadores.forEach((jugador) => {
        if (jugador) {
          nombresJugadores.set(
            jugador.id,
            `${jugador.nombre} ${jugador.apellido}`,
          );
        }
      });

      const nombres = Object.fromEntries(
        parejasParaMostrar.map((pareja) => [
          pareja.id,
          `${nombresJugadores.get(pareja.jugador1Id) ?? "Jugador no encontrado"} / ${
            nombresJugadores.get(pareja.jugador2Id) ?? "Jugador no encontrado"
          }`,
        ]),
      );

      setNombresParejas(nombres);

      const maximoZonas = Math.floor(parejasActivas.length / 2);

      setCantidadZonas((actual) =>
        maximoZonas > 0 ? Math.min(Math.max(actual, 1), maximoZonas) : 1,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las zonas.",
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargarDatos();
  }, [competenciaId, actualizacion]);

  async function generarZonas() {
    setGenerando(true);
    setError(null);

    try {
      await generarZonasCompetencia(competenciaId, cantidadZonas);
      await cargarDatos();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron generar las zonas.",
      );
    } finally {
      setGenerando(false);
    }
  }

  if (cargando) {
    return (
      <div>
        <h3>Zonas</h3>
        <p>Cargando zonas...</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Zonas</h3>

      {error && <p role="alert">{error}</p>}

      {!inscripcionesCerradas && zonas.length === 0 && (
        <p>Para generar las zonas, primero debés cerrar las inscripciones.</p>
      )}

      {inscripcionesCerradas &&
        zonas.length === 0 &&
        cantidadParejasActivas >= 2 && (
          <>
            <label htmlFor="cantidadZonas">Cantidad de zonas</label>

            <select
              id="cantidadZonas"
              value={cantidadZonas}
              onChange={(event) => setCantidadZonas(Number(event.target.value))}
              disabled={generando}
            >
              {Array.from(
                { length: Math.floor(cantidadParejasActivas / 2) },
                (_, index) => index + 1,
              ).map((cantidad) => (
                <option key={cantidad} value={cantidad}>
                  {cantidad} {cantidad === 1 ? "zona" : "zonas"}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={generarZonas}
              disabled={generando || cargando}
            >
              {generando
                ? "Generando zonas..."
                : "Generar zonas automáticamente"}
            </button>
          </>
        )}

      {inscripcionesCerradas &&
        zonas.length === 0 &&
        cantidadParejasActivas < 2 && (
          <p>Se necesitan al menos dos parejas activas para generar zonas.</p>
        )}

      {zonas.length > 0 && (
        <>
          <p>Zonas generadas: {zonas.length}</p>

          {zonas
            .slice()
            .sort((a, b) => a.orden - b.orden)
            .map((zona) => (
              <div key={zona.id}>
                <h4>{zona.nombre}</h4>
                <p>Parejas: {zona.parejaIds.length}</p>

                <ol>
                  {zona.parejaIds.map((parejaId) => (
                    <li key={parejaId}>
                      {nombresParejas[parejaId] ?? "Nombres no disponibles"}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
        </>
      )}
    </div>
  );
}
