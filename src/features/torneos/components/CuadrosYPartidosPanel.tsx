import React, { useState, useEffect } from "react";
import type { Zona } from "../../../domain/zona/zona.types";
import type { Partido, SetResultado, EstadoPartido } from "../../../domain/partido/partido.types";
import type { Pareja } from "../../../domain/pareja/pareja.types";
import type { LlavePartido } from "../../../domain/llave/llave.types";
import { generarZonasParaCompetencia, calcularTablaPosicionesZona } from "../../../domain/zona/zona.rules";
import { generarCuadroEliminatorio } from "../../../domain/llave/llave.rules";
import { zonasRepository } from "../../../infrastructure/repositories/zonasRepository";
import { partidosRepository } from "../../../infrastructure/repositories/partidosRepository";
import { ResultadoPartidoModal } from "./ResultadoPartidoModal";
import { CuadroEliminatorioPanel } from "./CuadroEliminatorioPanel";

interface CuadrosYPartidosPanelProps {
  competenciaId: string;
  parejasAprobadas: Pareja[];
}

export const CuadrosYPartidosPanel: React.FC<CuadrosYPartidosPanelProps> = ({
  competenciaId,
  parejasAprobadas,
}) => {
  const [vista, setVista] = useState<"zonas" | "playoffs">("zonas");
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [partidosLlave, setPartidosLlave] = useState<LlavePartido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [partidoSeleccionado, setPartidoSeleccionado] = useState<Partido | null>(null);

  const parejasMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    parejasAprobadas.forEach((p) => {
      map[p.id] = (p as any).nombre || (p as any).nombrePareja || `Pareja ${p.id.slice(0, 4)}`;
    });
    return map;
  }, [parejasAprobadas]);

  useEffect(() => {
    cargarDatos();
  }, [competenciaId]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [zonasData, partidosData] = await Promise.all([
        zonasRepository.getByCompetencia(competenciaId),
        partidosRepository.getByCompetencia(competenciaId),
      ]);
      setZonas(zonasData);
      setPartidos(partidosData);
    } catch (error) {
      console.error("Error al cargar zonas y partidos:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleGenerarZonas = async () => {
    if (parejasAprobadas.length < 3) {
      alert("Se necesitan al menos 3 parejas con pago aprobado para armar las zonas.");
      return;
    }

    if (zonas.length > 0 && !confirm("Ya existen zonas generadas. ¿Deseas regenerarlas? Esto reiniciará los partidos.")) {
      return;
    }

    setGenerando(true);
    try {
      const { zonas: nuevasZonas, partidos: nuevosPartidos } = generarZonasParaCompetencia(
        competenciaId,
        parejasAprobadas
      );

      const zonasCreadas: Zona[] = [];
      for (const z of nuevasZonas) {
        const id = await zonasRepository.create(z);
        zonasCreadas.push({ ...z, id });
      }

      const partidosCreados: Partido[] = [];
      for (let i = 0; i < nuevasZonas.length; i++) {
        const zonaObj = zonasCreadas[i];
        const partidosDeEstaZona = nuevosPartidos.filter((p) =>
          zonaObj.parejasIds.includes(p.pareja1Id) && zonaObj.parejasIds.includes(p.pareja2Id)
        );

        for (const p of partidosDeEstaZona) {
          const pConNombres = {
            ...p,
            zonaId: zonaObj.id,
            nombrePareja1: parejasMap[p.pareja1Id],
            nombrePareja2: parejasMap[p.pareja2Id],
          };
          const id = await partidosRepository.create(pConNombres);
          partidosCreados.push({ ...pConNombres, id });
        }
      }

      setZonas(zonasCreadas);
      setPartidos(partidosCreados);

      // Calcular clasificados y generar borrador del cuadro eliminatorio
      const clasificados = zonasCreadas.map((z) => {
        const pZona = partidosCreados.filter((p) => p.zonaId === z.id);
        const tabla = calcularTablaPosicionesZona(z, pZona, parejasMap);
        return { zonaNombre: z.nombre, clasificados: tabla };
      });

      const llave = generarCuadroEliminatorio(competenciaId, clasificados);
      setPartidosLlave(llave);
    } catch (error) {
      console.error("Error generando zonas:", error);
      alert("Ocurrió un error al generar las zonas.");
    } finally {
      setGenerando(false);
    }
  };

  const handleGuardarResultado = async (
    partidoId: string,
    sets: SetResultado[],
    ganadorId: string,
    estado: EstadoPartido
  ) => {
    await partidosRepository.updateResultado(partidoId, {
      sets,
      ganadorParejaId: ganadorId,
      estado,
    });

    setPartidos((prev) =>
      prev.map((p) =>
        p.id === partidoId
          ? { ...p, sets, ganadorParejaId: ganadorId, estado }
          : p
      )
    );
  };

  if (cargando) {
    return <div className="p-6 text-center text-slate-400">Cargando fase de grupos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Selector de Vista: Zonas / Playoffs */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="flex gap-2">
          <button
            onClick={() => setVista("zonas")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              vista === "zonas"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            📊 Fase de Grupos
          </button>
          <button
            onClick={() => setVista("playoffs")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              vista === "playoffs"
                ? "bg-amber-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            🏆 Cuadro Principal
          </button>
        </div>

        {vista === "zonas" && (
          <button
            disabled={generando}
            onClick={handleGenerarZonas}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition disabled:opacity-50"
          >
            {generando ? "Sorteando..." : zonas.length === 0 ? "⚡ Generar Zonas Automaticamente" : "🔄 Volver a Sortear"}
          </button>
        )}
      </div>

      {/* Renderizado Condicional de Vistas */}
      {vista === "zonas" ? (
        zonas.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">
            No hay zonas ni fixture armados. Haz clic en "Generar Zonas Automaticamente" para iniciar.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {zonas.map((zona) => {
              const partidosZona = partidos.filter((p) => p.zonaId === zona.id);
              const tablaPosiciones = calcularTablaPosicionesZona(zona, partidosZona, parejasMap);

              return (
                <div key={zona.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                  <h4 className="font-bold text-amber-400 text-sm uppercase tracking-wide border-b border-slate-800 pb-2">
                    {zona.nombre}
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="py-2 px-2">Pareja</th>
                          <th className="py-2 px-1 text-center">PJ</th>
                          <th className="py-2 px-1 text-center">PG</th>
                          <th className="py-2 px-1 text-center">PP</th>
                          <th className="py-2 px-1 text-center">DS</th>
                          <th className="py-2 px-1 text-center font-bold text-emerald-400">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {tablaPosiciones.map((pos, idx) => (
                          <tr key={pos.parejaId} className={idx < 2 ? "bg-emerald-950/20" : ""}>
                            <td className="py-2 px-2 font-medium text-slate-200">
                              {idx + 1}. {pos.nombrePareja}
                            </td>
                            <td className="py-2 px-1 text-center text-slate-400">{pos.partidosJugados}</td>
                            <td className="py-2 px-1 text-center text-emerald-400">{pos.partidosGanados}</td>
                            <td className="py-2 px-1 text-center text-rose-400">{pos.partidosPerdidos}</td>
                            <td className="py-2 px-1 text-center text-slate-300">
                              {pos.diferenciaSets > 0 ? `+${pos.diferenciaSets}` : pos.diferenciaSets}
                            </td>
                            <td className="py-2 px-1 text-center font-bold text-emerald-400">{pos.puntos}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Partidos:</span>
                    {partidosZona.map((partido) => {
                      const finalizado = partido.estado === "FINALIZADO";

                      return (
                        <div
                          key={partido.id}
                          className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex justify-between items-center text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className={`font-semibold ${partido.ganadorParejaId === partido.pareja1Id ? "text-emerald-400" : "text-slate-300"}`}>
                              {partido.nombrePareja1 || parejasMap[partido.pareja1Id]}
                            </div>
                            <div className={`font-semibold ${partido.ganadorParejaId === partido.pareja2Id ? "text-emerald-400" : "text-slate-300"}`}>
                              {partido.nombrePareja2 || parejasMap[partido.pareja2Id]}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {finalizado && partido.sets.length > 0 ? (
                              <div className="text-right font-mono text-xs text-amber-400 font-bold space-x-1">
                                {partido.sets.map((s, i) => (
                                  <span key={i} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                    {s.juegosPareja1}-{s.juegosPareja2}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                                Pendiente
                              </span>
                            )}

                            <button
                              onClick={() => setPartidoSeleccionado(partido)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[11px] transition"
                            >
                              {finalizado ? "Editar" : "Cargar"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <CuadroEliminatorioPanel
          partidosLlave={partidosLlave}
          onCargarResultado={(p) => setPartidoSeleccionado(p)}
        />
      )}

      {/* Modal de Carga de Resultado */}
      {partidoSeleccionado && (
        <ResultadoPartidoModal
          partido={partidoSeleccionado}
          onGuardar={handleGuardarResultado}
          onClose={() => setPartidoSeleccionado(null)}
        />
      )}
    </div>
  );
};