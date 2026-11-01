import { useEffect, useState } from "react";

import type { Pareja } from "../../../../domain/pareja/pareja.types";
import type { Jugador } from "../../../../domain/jugador/jugador.types";

import { parejasRepository } from "../../../../infrastructure/repositories/parejasRepository";
import { jugadoresRepository } from "../../../../infrastructure/repositories/jugadoresRepository";
import { registrarPareja } from "../../../../application/parejas/registrarPareja";

interface Props {
  competenciaId: string;
  onParejaRegistrada: () => void;
}

export default function ParejasAdmin({
  competenciaId,
  onParejaRegistrada,
}: Props) {
  const [parejas, setParejas] = useState<Pareja[]>([]);
  const [jugadoresPorId, setJugadoresPorId] = useState<Record<string, Jugador>>(
    {},
  );

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dniJugador1, setDniJugador1] = useState("");
  const [dniJugador2, setDniJugador2] = useState("");

  const [jugador1, setJugador1] = useState<Jugador | null>(null);
  const [jugador2, setJugador2] = useState<Jugador | null>(null);

  const [buscandoJugador1, setBuscandoJugador1] = useState(false);
  const [buscandoJugador2, setBuscandoJugador2] = useState(false);

  const [errorJugador1, setErrorJugador1] = useState<string | null>(null);
  const [errorJugador2, setErrorJugador2] = useState<string | null>(null);

  const [registrando, setRegistrando] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState<string | null>(null);

  useEffect(() => {
    async function cargarParejas() {
      try {
        setError(null);

        const datos =
          await parejasRepository.obtenerPorCompetenciaId(competenciaId);

        setParejas(datos);

        const idsJugadores = Array.from(
          new Set(
            datos.flatMap((pareja) => [pareja.jugador1Id, pareja.jugador2Id]),
          ),
        );

        const jugadores = await jugadoresRepository.obtenerPorIds(idsJugadores);

        const jugadoresEncontrados: Record<string, Jugador> = {};

        jugadores.forEach((jugador) => {
          jugadoresEncontrados[jugador.id] = jugador;
        });

        setJugadoresPorId(jugadoresEncontrados);
      } catch {
        setError("No se pudieron cargar las parejas.");
      } finally {
        setCargando(false);
      }
    }

    cargarParejas();
  }, [competenciaId]);

  async function buscarJugador1() {
    if (!dniJugador1.trim()) {
      setErrorJugador1("Ingresá un DNI.");
      return;
    }

    try {
      setBuscandoJugador1(true);
      setErrorJugador1(null);
      setJugador1(null);

      const jugador = await jugadoresRepository.obtenerJugadorPorDni(
        dniJugador1.trim(),
      );

      if (!jugador) {
        setErrorJugador1("No se encontró un jugador con ese DNI.");
        return;
      }

      setJugador1(jugador);
    } catch {
      setErrorJugador1("No se pudo buscar el jugador.");
    } finally {
      setBuscandoJugador1(false);
    }
  }

  async function buscarJugador2() {
    if (!dniJugador2.trim()) {
      setErrorJugador2("Ingresá un DNI.");
      return;
    }

    try {
      setBuscandoJugador2(true);
      setErrorJugador2(null);
      setJugador2(null);

      const jugador = await jugadoresRepository.obtenerJugadorPorDni(
        dniJugador2.trim(),
      );

      if (!jugador) {
        setErrorJugador2("No se encontró un jugador con ese DNI.");
        return;
      }

      setJugador2(jugador);
    } catch {
      setErrorJugador2("No se pudo buscar el jugador.");
    } finally {
      setBuscandoJugador2(false);
    }
  }

  async function registrarNuevaPareja() {
    if (!jugador1 || !jugador2) {
      setErrorRegistro("Debes seleccionar ambos jugadores.");
      return;
    }

    const jugador1Seleccionado = jugador1;
    const jugador2Seleccionado = jugador2;

    try {
      setRegistrando(true);
      setErrorRegistro(null);

      await registrarPareja({
        competenciaId,
        jugador1Id: jugador1Seleccionado.id,
        jugador2Id: jugador2Seleccionado.id,
      });

      const datos =
        await parejasRepository.obtenerPorCompetenciaId(competenciaId);

      setParejas(datos);

      setJugadoresPorId((actuales) => ({
        ...actuales,
        [jugador1Seleccionado.id]: jugador1Seleccionado,
        [jugador2Seleccionado.id]: jugador2Seleccionado,
      }));

      onParejaRegistrada();

      setDniJugador1("");
      setDniJugador2("");
      setJugador1(null);
      setJugador2(null);
    } catch (error) {
      setErrorRegistro(
        error instanceof Error
          ? error.message
          : "No se pudo registrar la pareja.",
      );
    } finally {
      setRegistrando(false);
    }
  }

  if (cargando) {
    return (
      <div className="py-8 text-center text-slate-400 text-sm">
        Cargando parejas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-200 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <h3 className="text-xl font-bold text-white tracking-wide">
          Gestión de Parejas
        </h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-slate-300 font-medium">
          Total: {parejas.length}
        </span>
      </div>

      <div className="space-y-5 bg-[var(--color-bg-surface)]/50 border border-[var(--color-border)] rounded-xl p-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Registrar nueva pareja
        </h4>

        {/* Jugador 1 */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400">Jugador 1 (DNI)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={dniJugador1}
              onChange={(e) => setDniJugador1(e.target.value)}
              placeholder="Ej: 35123456"
              className="flex-1 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
            />
            <button
              type="button"
              onClick={buscarJugador1}
              disabled={buscandoJugador1}
              className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-[var(--color-border)] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {buscandoJugador1 ? "Buscando..." : "Buscar"}
            </button>
          </div>
          {errorJugador1 && <p className="text-xs text-red-400">{errorJugador1}</p>}
          {jugador1 && (
            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-xs">
              ✓ <strong className="text-white">{jugador1.nombre} {jugador1.apellido}</strong> — Categoría: {jugador1.categoriaDeclarada}
            </div>
          )}
        </div>

        {/* Jugador 2 */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400">Jugador 2 (DNI)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={dniJugador2}
              onChange={(e) => setDniJugador2(e.target.value)}
              placeholder="Ej: 36789123"
              className="flex-1 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)]"
            />
            <button
              type="button"
              onClick={buscarJugador2}
              disabled={buscandoJugador2}
              className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-[var(--color-border)] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {buscandoJugador2 ? "Buscando..." : "Buscar"}
            </button>
          </div>
          {errorJugador2 && <p className="text-xs text-red-400">{errorJugador2}</p>}
          {jugador2 && (
            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-xs">
              ✓ <strong className="text-white">{jugador2.nombre} {jugador2.apellido}</strong> — Categoría: {jugador2.categoriaDeclarada}
            </div>
          )}
        </div>

        {errorRegistro && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs rounded-lg">
            {errorRegistro}
          </div>
        )}

        <button
          type="button"
          onClick={registrarNuevaPareja}
          disabled={registrando || !jugador1 || !jugador2}
          className="w-full rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 px-4 py-2.5 text-xs font-bold text-white uppercase tracking-wider transition-colors disabled:opacity-50 shadow-md"
        >
          {registrando ? "Registrando pareja..." : "Confirmar y registrar pareja"}
        </button>
      </div>

      <div className="space-y-3 pt-2">
        <h4 className="text-sm font-bold text-slate-200">
          Parejas Inscriptas
        </h4>

        {parejas.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-3 text-center bg-white/[0.02] rounded-lg border border-[var(--color-border)]">
            Todavía no hay parejas registradas en esta competencia.
          </p>
        ) : (
          <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {parejas.map((pareja, idx) => (
              <li
                key={pareja.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-xs shadow-sm hover:border-slate-500 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/[0.05] border border-[var(--color-border)] flex items-center justify-center font-bold text-slate-300">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-white">
                      {jugadoresPorId[pareja.jugador1Id]
                        ? `${jugadoresPorId[pareja.jugador1Id].nombre} ${jugadoresPorId[pareja.jugador1Id].apellido}`
                        : pareja.jugador1Id}
                      {" & "}
                      {jugadoresPorId[pareja.jugador2Id]
                        ? `${jugadoresPorId[pareja.jugador2Id].nombre} ${jugadoresPorId[pareja.jugador2Id].apellido}`
                        : pareja.jugador2Id}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {pareja.estado}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}