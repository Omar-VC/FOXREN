import { useState } from "react";
import type { Partido } from "../../../../domain/partido/partido.types";

interface Props {
  partidos: Partido[];
  nombrePareja: (parejaId: string) => string;
  actualizarPartidos: () => void;
}

export default function CuadroEliminacionDirecta({
  partidos,
  nombrePareja,
  actualizarPartidos,
}: Props) {
  const [partidoSeleccionadoId, setPartidoSeleccionadoId] = useState("");
  const [resultadoModalAbierto, setResultadoModalAbierto] = useState(false);

  if (partidos.length === 0) {
    return (
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--border-radius)] p-5 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Cuadro de Eliminación Directa
        </h3>
        <p className="text-sm text-slate-400">
          No hay partidos generados aún para este formato.
        </p>
      </div>
    );
  }

  const partidosPorRonda = new Map<number, Partido[]>();
  for (const partido of partidos) {
    const ronda = Number(partido.ronda) ?? 0;
    const existente = partidosPorRonda.get(ronda) ?? [];
    existente.push(partido);
    existente.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    partidosPorRonda.set(ronda, existente);
  }

  const rondasOrdenadas = Array.from(partidosPorRonda.keys()).sort(
    (a, b) => a - b,
  );

  const obtenerPartidoConNombres = (partido: Partido) => {
    const rondaActual = Number(partido.ronda ?? 0);
    const partidosRondaAnterior = partidosPorRonda.get(rondaActual - 1) ?? [];

    const obtenerPlaceholder = (esPareja1: boolean): string => {
      const rondaAnterior = rondaActual - 1;
      if (rondaAnterior < 1) {
        return "Esperando ganador...";
      }
      const indicePartido = partido.partidoNumero ?? 1;
      // Para pareja1 usamos el mismo número de partido de la ronda anterior;
      // para pareja2 usamos el siguiente disponible.
      const numeroReferencia = esPareja1
        ? indicePartido
        : Math.min(indicePartido + 1, partidosRondaAnterior.length);
      const nombreFase =
        rondaAnterior === 1
          ? "Semifinal"
          : rondaAnterior === 2
            ? "Cuartos"
            : `Ronda ${rondaAnterior}`;
      return `Ganador ${nombreFase} ${numeroReferencia}`;
    };

    const pareja1Nombre =
      partido.pareja1Id === null
        ? obtenerPlaceholder(true)
        : nombrePareja(partido.pareja1Id);
    const pareja2Nombre =
      partido.pareja2Id === null
        ? obtenerPlaceholder(false)
        : nombrePareja(partido.pareja2Id);
    let ganadorNombre: string | null = null;
    if (partido.ganadorParejaId) {
      ganadorNombre = nombrePareja(partido.ganadorParejaId);
    }
    return { ...partido, pareja1Nombre, pareja2Nombre, ganadorNombre };
  };

  const abrirModalResultado = (id: string) => {
    setPartidoSeleccionadoId(id);
    setResultadoModalAbierto(true);
  };

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--border-radius)] p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-slate-100">
          Cuadro de Eliminación Directa
        </h3>
        <button
          type="button"
          onClick={() => actualizarPartidos()}
          className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-800 disabled:opacity-50"
        >
          Actualizar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {rondasOrdenadas.map((ronda) => (
                <th
                  key={ronda}
                  className="pb-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Ronda {ronda}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="text-center">
              {rondasOrdenadas.map((ronda) => {
                const partidosRonda = partidosPorRonda.get(ronda) ?? [];
                return (
                  <td key={ronda} className="p-2">
                    <div className="flex flex-col gap-2">
                      {partidosRonda.map((partido) => {
                        const p = obtenerPartidoConNombres(partido);
                        const esFinalizado =
                          p.estado === "finalizado" ||
                          p.estado === "walkover" ||
                          p.estado === "abandono";

                        return (
                          <div
                            key={p.id}
                            className={`rounded-lg border p-3 ${
                              esFinalizado
                                ? "bg-emerald-950/30 border-emerald-500/40"
                                : p.estado === "en_juego"
                                  ? "bg-sky-950/30 border-sky-500/40"
                                  : "bg-slate-950/40 border-slate-700"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span
                                className={`text-xs font-medium ${
                                  esFinalizado
                                    ? "text-emerald-300"
                                    : p.estado === "en_juego"
                                      ? "text-sky-300"
                                      : "text-slate-300"
                                }`}
                              >
                                {p.fase?.replaceAll("_", " ") ?? "Fase"}
                              </span>
                              <button
                                type="button"
                                onClick={() => abrirModalResultado(p.id)}
                                disabled={esFinalizado}
                                className="text-xs px-2 py-1 rounded border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 disabled:opacity-50"
                              >
                                {esFinalizado ? "Finalizado" : "Resultado"}
                              </button>
                            </div>

                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between items-center">
                                <span
                                  className="text-slate-200 font-medium truncate max-w-[120px]"
                                  title={p.pareja1Nombre}
                                >
                                  {p.pareja1Nombre}
                                </span>
                                {p.ganadorParejaId === p.pareja1Id && (
                                  <span className="text-xs text-emerald-400">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <div className="flex justify-between items-center text-xs text-slate-400">
                                <span>
                                  {p.sets.length > 0
                                    ? p.sets
                                        .map((s) => s.juegosPareja1)
                                        .join("-")
                                    : "-"}
                                </span>
                                <span>
                                  {p.sets.length > 0
                                    ? p.sets
                                        .map((s) => s.juegosPareja2)
                                        .join("-")
                                    : "-"}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span
                                  className="text-slate-200 font-medium truncate max-w-[120px]"
                                  title={p.pareja2Nombre}
                                >
                                  {p.pareja2Nombre}
                                </span>
                                {p.ganadorParejaId === p.pareja2Id && (
                                  <span className="text-xs text-emerald-400">
                                    ✓
                                  </span>
                                )}
                              </div>
                            </div>

                            {!esFinalizado && (
                              <p className="text-[10px] text-slate-500 mt-1">
                                Sin resultado
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {resultadoModalAbierto && partidoSeleccionadoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setResultadoModalAbierto(false)}
          />
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[var(--border-radius)] p-6 shadow-2xl max-w-md w-full mx-4">
            <h4 className="text-lg font-semibold mb-4 text-slate-100">
              Registrar Resultado
            </h4>
            <p className="text-sm text-slate-400 mb-4">
              Usá la sección de "Registrar resultado" para cargar el resultado
              de este partido.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setResultadoModalAbierto(false)}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-white"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
