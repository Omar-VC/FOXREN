import { useState } from "react";
import type { Competencia } from "../../../../domain/competencia/competencia.types";
import type { FormatoPartido } from "../../../../domain/partido/partido.types";
import { actualizarCompetencia } from "../../../../infrastructure/repositories/competenciasRepository";

interface Props {
  competencia: Competencia;
  onGuardado: () => void;
}

const SELECT =
  "w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white focus:border-[var(--color-accent)] focus:outline-none transition-colors disabled:opacity-40";

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
      changesAddOrUpdate: cambios.parejasClasificanPorZona = n;
    }

    try {
      setGuardando(true);
      await actualizarCompetencia(competencia.id, cambios);
      setMensaje("Guardado correctamente.");
      onGuardado();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="bg-black/20 border border-white/5 rounded-2xl p-6 space-y-5">
      {/* Cabecera */}
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-white m-0">Formato de partidos</h3>
        <p className="text-xs text-[var(--color-text-muted)] m-0">
          Define si se juega a un set (a 6 games) o al mejor de 3. Modificable antes de generar cada fase.
        </p>
      </div>

      {/* Controles en grilla limpia */}
      <div className="grid gap-4 md:grid-cols-3">
        {conZonas && (
          <label className="space-y-1.5 block text-xs text-[var(--color-text-muted)] font-medium">
            <span>Zonas</span>
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

        <label className="space-y-1.5 block text-xs text-[var(--color-text-muted)] font-medium">
          <span>Playoff</span>
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
          <label className="space-y-1.5 block text-xs text-[var(--color-text-muted)] font-medium">
            <span>Parejas que clasifican por zona</span>
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

      {/* Alertas de error o éxito */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
          ⚠️ {error}
        </div>
      )}
      {mensaje && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          ✓ {mensaje}
        </div>
      )}

      {/* Botón de acción alineado */}
      <div className="flex justify-end pt-2 border-t border-white/5">
        <button
          type="button"
          onClick={() => void guardar()}
          disabled={guardando}
          className="fox-button-primary text-xs py-2 px-4 font-semibold transition-all"
        >
          {guardando ? "Guardando..." : "Guardar formato"}
        </button>
      </div>
    </div>
  );
}
