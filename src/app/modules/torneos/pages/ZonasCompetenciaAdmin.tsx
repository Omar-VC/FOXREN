import { useCallback, useEffect, useState } from "react";

import { generarZonasCompetencia } from "../../../../application/competencias/generarZonasCompetencia";
import { zonasRepository } from "../../../../infrastructure/repositories/zonasRepository";
import { parejasRepository } from "../../../../infrastructure/repositories/parejasRepository";
import { jugadoresRepository } from "../../../../infrastructure/repositories/jugadoresRepository";
import type { Zona } from "../../../../domain/competencia/competencia.zonas.types";
import type { Competencia } from "../../../../domain/competencia/competencia.types";

interface Props {
  competenciaId: string;
  formato: Competencia["formato"];
  inscripcionesCerradas: boolean;
  actualizacion: number;
}

export default function ZonasCompetenciaAdmin({
  competenciaId,
  formato,
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

  const cargarDatos = useCallback(async (estaActivo: () => boolean = () => true) => {
    if (estaActivo()) {
      setCargando(true);
      setError(null);
    }
    try {
      const [zonasGuardadas, parejas] = await Promise.all([
        zonasRepository.obtenerPorCompetenciaId(competenciaId),
        parejasRepository.obtenerPorCompetenciaId(competenciaId),
      ]);
      const parejasActivas = parejas.filter(
        (pareja) => pareja.estado === "activa",
      );

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

      const jugadores = await jugadoresRepository.obtenerPorIds(idsJugadores);
      if (!estaActivo()) return;

      const nombresJugadores = new Map<string, string>();

      jugadores.forEach((jugador) => {
        nombresJugadores.set(
          jugador.id,
          `${jugador.nombre} ${jugador.apellido}`,
        );
      });

      const nombres = Object.fromEntries(
        parejasParaMostrar.map((pareja) => [
          pareja.id,
          `${nombresJugadores.get(pareja.jugador1Id) ?? "Jugador no encontrado"} / ${
            nombresJugadores.get(pareja.jugador2Id) ?? "Jugador no encontrado"
          }`,
        ]),
      );

      const maximoZonas = Math.floor(parejasActivas.length / 2);

      setError(null);
      setZonas(zonasGuardadas);
      setCantidadParejasActivas(parejasActivas.length);
      setNombresParejas(nombres);
      setCantidadZonas((actual) =>
        maximoZonas > 0 ? Math.min(Math.max(actual, 1), maximoZonas) : 1,
      );
    } catch (error) {
      if (estaActivo()) {
        setError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las zonas.",
        );
      }
    } finally {
      if (estaActivo()) setCargando(false);
    }
  }, [competenciaId]);

  useEffect(() => {
    let montado = true;
    void Promise.resolve().then(() => cargarDatos(() => montado));
    return () => {
      montado = false;
    };
  }, [cargarDatos, actualizacion]);

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
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-white tracking-wide">Zonas</h3>
        <p className="text-xs text-slate-400 py-6 text-center">Cargando zonas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <h3 className="text-xl font-bold text-white tracking-wide">
          Gestión de Zonas
        </h3>
        {zonas.length > 0 && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-slate-300 font-medium">
            Generadas: {zonas.length}
          </span>
        )}
      </div>

      {formato === "eliminacion_directa" && (
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm">
          <p className="text-xs text-slate-400">
            Esta competencia usa eliminación directa. El cuadro de llaves se gestiona desde la sección de partidos.
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs rounded-xl" role="alert">
          {error}
        </div>
      )}

      {formato === "zonas_eliminacion_directa" && !inscripcionesCerradas && zonas.length === 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl font-medium">
          ⚠️ Para generar las zonas, primero debés cerrar las inscripciones.
        </div>
      )}

      {formato === "zonas_eliminacion_directa" && inscripcionesCerradas &&
        zonas.length === 0 &&
        cantidadParejasActivas >= 2 && (
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-4 shadow-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Configuración de Zonas
            </h4>
            
            <div className="space-y-2">
              <label htmlFor="cantidadZonas" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Cantidad de zonas
              </label>

              <select
                id="cantidadZonas"
                value={cantidadZonas}
                onChange={(event) => setCantidadZonas(Number(event.target.value))}
                disabled={generando}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors shadow-sm"
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
            </div>

            <button
              type="button"
              onClick={generarZonas}
              disabled={generando || cargando}
              className="w-full rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 px-4 py-2.5 text-xs font-bold text-white uppercase tracking-wider transition-colors disabled:opacity-50 shadow-md"
            >
              {generando
                ? "Generando zonas..."
                : "Generar zonas automáticamente"}
            </button>
          </div>
        )}

      {formato === "zonas_eliminacion_directa" && inscripcionesCerradas &&
        zonas.length === 0 &&
        cantidadParejasActivas < 2 && (
          <div className="p-4 bg-slate-900 border border-[var(--color-border)] text-slate-400 text-xs rounded-xl text-center italic">
            Se necesitan al menos dos parejas activas para generar zonas.
          </div>
        )}

      {zonas.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zonas
              .slice()
              .sort((a, b) => a.orden - b.orden)
              .map((zona) => (
                <div
                  key={zona.id}
                  className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]"></span>
                      {zona.nombre}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 uppercase tracking-wider">
                      {zona.parejaIds.length} parejas
                    </span>
                  </div>

                  <ol className="space-y-1.5 text-xs">
                    {zona.parejaIds.map((parejaId, idx) => (
                      <li
                        key={parejaId}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-[var(--color-bg-main)]/50 border border-[var(--color-border)] text-slate-200"
                      >
                        <span className="font-bold text-[var(--color-accent)]">
                          {idx + 1}.
                        </span>
                        <span className="truncate">
                          {nombresParejas[parejaId] ?? "Nombres no disponibles"}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}