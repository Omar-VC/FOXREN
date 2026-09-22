import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { Torneo } from "../../../domain/torneo/torneo.types";
import type { Competencia } from "../../../domain/competencia/competencia.types";
import type { Zona } from "../../../domain/zona/zona.types";
import type { Partido } from "../../../domain/partido/partido.types";
import type { LlavePartido } from "../../../domain/llave/llave.types";
import { calcularTablaPosicionesZona } from "../../../domain/zona/zona.rules";
import { generarCuadroEliminatorio } from "../../../domain/llave/llave.rules";
import { torneosRepository } from "../../../infrastructure/repositories/torneosRepository";
import { competenciasRepository } from "../../../infrastructure/repositories/competenciasRepository";
import { zonasRepository } from "../../../infrastructure/repositories/zonasRepository";
import { partidosRepository } from "../../../infrastructure/repositories/partidosRepository";

export const TorneoDetallePublico: React.FC = () => {
  const { torneoId } = useParams<{ torneoId: string }>();

  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [competenciaActivaId, setCompetenciaActivaId] = useState<string | null>(null);

  const [zonas, setZonas] = useState<Zona[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [partidosLlave, setPartidosLlave] = useState<LlavePartido[]>([]);

  const [subTab, setSubTab] = useState<"posiciones" | "fixture" | "cuadro">("posiciones");
  const [cargando, setCargando] = useState(true);

  // Helper para convertir cualquier Timestamp o fecha de Firestore a texto seguro
  const formatearFecha = (fecha: any) => {
    if (!fecha) return "Fecha a confirmar";
    if (typeof fecha === "string") return fecha;
    if (typeof fecha === "object" && "seconds" in fecha) {
      return new Date(fecha.seconds * 1000).toLocaleDateString("es-AR");
    }
    if (fecha instanceof Date) {
      return fecha.toLocaleDateString("es-AR");
    }
    return "Fecha a confirmar";
  };

  useEffect(() => {
    if (torneoId) {
      cargarTorneoYCompetencias(torneoId);
    }
  }, [torneoId]);

  useEffect(() => {
    if (competenciaActivaId) {
      cargarDatosCompetencia(competenciaActivaId);
    }
  }, [competenciaActivaId]);

  const cargarTorneoYCompetencias = async (id: string) => {
    setCargando(true);
    try {
      // 1. Obtenemos las competencias con el método correspondiente
      const compsData = await competenciasRepository.obtenerPorTorneoId(id);
      setCompetencias(compsData);

      // 2. Buscamos el torneo activo dentro de la lista de torneos
      const todosLosTorneos = await torneosRepository.obtenerTorneos();
      const torneoEncontrado = todosLosTorneos.find((t) => t.id === id) || null;
      setTorneo(torneoEncontrado);

      if (compsData.length > 0) {
        setCompetenciaActivaId(compsData[0].id);
      }
    } catch (error) {
      console.error("Error al cargar detalle del torneo:", error);
    } finally {
      setCargando(false);
    }
  };

  const cargarDatosCompetencia = async (compId: string) => {
    try {
      const [zonasData, partidosData] = await Promise.all([
        zonasRepository.getByCompetencia(compId),
        partidosRepository.getByCompetencia(compId),
      ]);

      setZonas(zonasData);
      setPartidos(partidosData);

      if (zonasData.length > 0) {
        const clasificados = zonasData.map((z) => {
          const pZona = partidosData.filter((p) => p.zonaId === z.id);
          const tabla = calcularTablaPosicionesZona(z, pZona, {});
          return { zonaNombre: z.nombre, clasificados: tabla };
        });

        const llave = generarCuadroEliminatorio(compId, clasificados);
        setPartidosLlave(llave);
      } else {
        setPartidosLlave([]);
      }
    } catch (error) {
      console.error("Error al cargar competencia activa:", error);
    }
  };

  if (cargando) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-slate-400">
        Cargando torneo...
      </div>
    );
  }

  if (!torneo) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-slate-400 space-y-4">
        <p>No se encontró el torneo solicitado.</p>
        <Link to="/torneos" className="text-blue-400 hover:underline text-sm">
          ← Volver a Torneos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Público del Torneo */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-3">
        <div className="flex justify-between items-start">
          <Link to="/torneos" className="text-xs text-slate-400 hover:text-white transition">
            ← Volver a la lista
          </Link>
          <span className="bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {torneo.estado}
          </span>
        </div>

        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">{torneo.nombre}</h2>
          <p className="text-xs text-slate-400 mt-1">
            📍 {torneo.sede || "Sede a confirmar"} • 🗓️ {formatearFecha(torneo.fechaInicio)}
          </p>
        </div>
      </div>

      {/* Selector de Categorías / Competencias */}
      {competencias.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-800">
          {competencias.map((comp) => (
            <button
              key={comp.id}
              onClick={() => setCompetenciaActivaId(comp.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                competenciaActivaId === comp.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {comp.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Sub-Tabs de Navegación Pública */}
      <div className="flex border-b border-slate-800 text-xs">
        <button
          onClick={() => setSubTab("posiciones")}
          className={`px-4 py-2.5 font-bold border-b-2 transition ${
            subTab === "posiciones"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          📊 Posiciones
        </button>
        <button
          onClick={() => setSubTab("fixture")}
          className={`px-4 py-2.5 font-bold border-b-2 transition ${
            subTab === "fixture"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          ⚔️ Fixture y Partidos
        </button>
        <button
          onClick={() => setSubTab("cuadro")}
          className={`px-4 py-2.5 font-bold border-b-2 transition ${
            subTab === "cuadro"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          🏆 Cuadro Principal
        </button>
      </div>

      {/* VISTA 1: TABLAS DE POSICIONES */}
      {subTab === "posiciones" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {zonas.length === 0 ? (
            <div className="col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">
              Aún no se han publicado las zonas para esta categoría.
            </div>
          ) : (
            zonas.map((zona) => {
              const partidosZona = partidos.filter((p) => p.zonaId === zona.id);
              const tabla = calcularTablaPosicionesZona(zona, partidosZona, {});

              return (
                <div key={zona.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
                  <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wide border-b border-slate-800 pb-2">
                    {zona.nombre}
                  </h4>
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[9px]">
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
                      {tabla.map((pos, idx) => (
                        <tr key={pos.parejaId} className={idx < 2 ? "bg-emerald-950/20" : ""}>
                          <td className="py-2 px-2 font-medium text-slate-200 truncate max-w-[120px]">
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
              );
            })
          )}
        </div>
      )}

      {/* VISTA 2: FIXTURE Y PARTIDOS */}
      {subTab === "fixture" && (
        <div className="space-y-3">
          {partidos.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-sm">
              No hay partidos programados por el momento.
            </div>
          ) : (
            partidos.map((p) => {
              const finalizado = p.estado === "FINALIZADO";

              return (
                <div
                  key={p.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between items-center text-xs shadow-md"
                >
                  <div className="space-y-1">
                    <div className={p.ganadorParejaId === p.pareja1Id ? "font-bold text-emerald-400" : "text-slate-300"}>
                      {p.nombrePareja1 || "Pareja 1"}
                    </div>
                    <div className={p.ganadorParejaId === p.pareja2Id ? "font-bold text-emerald-400" : "text-slate-300"}>
                      {p.nombrePareja2 || "Pareja 2"}
                    </div>
                  </div>

                  <div>
                    {finalizado && p.sets.length > 0 ? (
                      <div className="flex gap-1 font-mono text-xs font-bold text-amber-400">
                        {p.sets.map((s, i) => (
                          <span key={i} className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
                            {s.juegosPareja1}-{s.juegosPareja2}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded font-medium">
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VISTA 3: CUADRO PRINCIPAL */}
      {subTab === "cuadro" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
          {partidosLlave.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-6">
              El cuadro principal se habilitará al concluir la fase de grupos.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Semifinales */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Semifinales</h4>
                {partidosLlave
                  .filter((p) => p.ronda === "SEMIFINAL")
                  .map((p) => (
                    <div key={p.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className={p.ganadorParejaId === p.pareja1Id ? "font-bold text-emerald-400" : "text-slate-200"}>
                          {p.nombrePareja1}
                        </span>
                        {p.estado === "FINALIZADO" && (
                          <span className="font-mono text-amber-400 font-bold">
                            {p.sets.map((s) => s.juegosPareja1).join("-")}
                          </span>
                        )}
                      </div>
                      <div className="border-t border-slate-800/60 my-1" />
                      <div className="flex justify-between text-xs">
                        <span className={p.ganadorParejaId === p.pareja2Id ? "font-bold text-emerald-400" : "text-slate-200"}>
                          {p.nombrePareja2}
                        </span>
                        {p.estado === "FINALIZADO" && (
                          <span className="font-mono text-amber-400 font-bold">
                            {p.sets.map((s) => s.juegosPareja2).join("-")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Gran Final */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider text-center">Gran Final</h4>
                {partidosLlave
                  .filter((p) => p.ronda === "FINAL")
                  .map((p) => (
                    <div key={p.id} className="bg-slate-950 p-4 rounded-xl border-2 border-amber-500/30 space-y-2 shadow-xl">
                      <div className="flex justify-between text-sm">
                        <span className={p.ganadorParejaId === p.pareja1Id ? "font-bold text-amber-400" : "text-slate-200"}>
                          {p.nombrePareja1}
                        </span>
                        {p.estado === "FINALIZADO" && (
                          <span className="font-mono text-amber-400 font-bold">
                            {p.sets.map((s) => s.juegosPareja1).join("-")}
                          </span>
                        )}
                      </div>
                      <div className="border-t border-slate-800 my-1" />
                      <div className="flex justify-between text-sm">
                        <span className={p.ganadorParejaId === p.pareja2Id ? "font-bold text-amber-400" : "text-slate-200"}>
                          {p.nombrePareja2}
                        </span>
                        {p.estado === "FINALIZADO" && (
                          <span className="font-mono text-amber-400 font-bold">
                            {p.sets.map((s) => s.juegosPareja2).join("-")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};