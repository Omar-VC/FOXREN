import { useState } from "react";

import type { Competencia } from "../../../../domain/competencia/competencia.types";
import type { FormatoPartido } from "../../../../domain/partido/partido.types";
import { actualizarCompetencia } from "../../../../infrastructure/repositories/competenciasRepository";

interface Props {
  competencia: Competencia;
  onGuardado: () => void;
}

const CAJA =
  "bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--border-radius)] p-5 shadow-lg";
const SELECT =
  "w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white disabled:opacity-50";

export default function FormatoPartidosAdmin({ competencia, onGuardado }: Props) {
  const conZonas = competencia.formato !== "eliminacion_directa";
  const zonaBloqueada = !conZonas || competencia.zonasGeneradas === true;
  const playoffBloqueado = competencia.playoffGenerado === true;

  const [formatoZona, setFormatoZona] = useState<FormatoPartido>(
    competencia.formatoPartidoZona ?? "mejor_de_3",
  );
  const [formatoPlayoff, setFormatoPlayoff] = useState<FormatoPartido>(
    competencia.formatoPartidoPlayoff ?? "mejor_de_3",
  );
  const [clasifican, setClasifican] = useState(
    String(competencia.parejasClasificanPorZona ?? 2),
  );
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (zonaBloqueada && playoffBloqueado) return null;

  async function guardar() {
    setError(null);
    setMensaje(null);

    const cambios: Partial<Competencia> = {};
    if (!zonaBloqueada) cambios.formatoPartidoZona = formatoZona;
    if (!playoffBloqueado) cambios.formatoPartidoPlayoff = formatoPlayoff;
    if (conZonas && !playoffBloqueado) {
      const n = Number(clasifican);
      if (!Number.isInteger(n) || n < 1) {
        setError("La cantidad de parejas que clasifican debe ser un entero mayor o igual a 1.");
        return;
      }
      cambios.parejasClasificanPorZona = n;
    }

    try {
      setGuardando(true);
      await actualizarCompetencia(competencia.id, cambios);
      setMensaje("Guardado.");
      onGuardado();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className={CAJA}>
      <h3 className="text-lg font-semibold text-slate-100 mb-1">Formato de partidos</h3>
      <p className="text-sm text-slate-400 mb-4">
        Un set (a 6 games) o mejor de 3 sets. Se puede cambiar hasta generar cada fase.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {conZonas && (
          <label className="text-sm text-slate-300">
            Zonas
            <select
              className={SELECT}
              value={formatoZona}
              disabled={zonaBloqueada}
              onChange={(e) => setFormatoZona(e.target.value as FormatoPartido)}
            >
              <option value="un_set">Un set</option>
              <option value="mejor_de_3">Mejor de 3</option>
            </select>
          </label>
        )}

        <label className="text-sm text-slate-300">
          Playoff
          <select
            className={SELECT}
            value={formatoPlayoff}
            disabled={playoffBloqueado}
            onChange={(e) => setFormatoPlayoff(e.target.value as FormatoPartido)}
          >
            <option value="un_set">Un set</option>
            <option value="mejor_de_3">Mejor de 3</option>
          </select>
        </label>

        {conZonas && (
          <label className="text-sm text-slate-300">
            Parejas que clasifican por zona
            <input
              type="number"
              min="1"
              className={SELECT}
              value={clasifican}
              disabled={playoffBloqueado}
              onChange={(e) => setClasifican(e.target.value)}
            />
          </label>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      {mensaje && <p className="mt-3 text-sm text-emerald-300">{mensaje}</p>}

      <button
        type="button"
        onClick={() => void guardar()}
        disabled={guardando}
        className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {guardando ? "Guardando..." : "Guardar formato"}
      </button>
    </div>
  );
}
