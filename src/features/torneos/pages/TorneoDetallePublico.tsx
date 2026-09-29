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
  const [parejasNombresMap, setParejasNombresMap] = useState<Record<string, string>>({});
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
      const compsData = await competenciasRepository.obtenerPorTorneoId(id);
      setCompetencias(compsData);

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

      // Construimos el mapa de nombres a partir de los partidos cargados
      const mapaNombres: Record<string, string> = {};
      partidosData.forEach((p: Partido) => {
        if (p.pareja1Id && p.nombrePareja1) mapaNombres[p.pareja1Id] = p.nombrePareja1;
        if (p.pareja2Id && p.nombrePareja2) mapaNombres[p.pareja2Id] = p.nombrePareja2;
      });

      setZonas(zonasData);
      setPartidos(partidosData);
      setParejasNombresMap(mapaNombres);

      if (zonasData.length > 0) {
        const clasificados = zonasData.map((z: Zona) => {
          const pZona = partidosData.filter((p: Partido) => p.zonaId === z.id);
          const tabla = calcularTablaPosicionesZona(z, pZona, mapaNombres);
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
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-fox-neon border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-fox-muted text-xs font-medium">Cargando datos del torneo...</p>
      </div>
    );
  }

  if (!torneo) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-fox-muted space-y-4">
        <p>No se encontró el torneo solicitado.</p>
        <Link to="/torneos" className="text-fox-neon hover:underline text-xs">
          ← Volver a Torneos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Público del Torneo */}
      <div className="bg-fox-surface border border-fox-border rounded-2xl p-5 md:p-6 shadow-xl space-y-3">
        <div className="flex justify-between items-start">
          <Link to="/torneos" className="text-xs text-fox-muted hover:text-white transition">
            ← Volver a la lista
          </Link>
          <span className="bg-fox-neon/10 text-fox-neon border border-fox-neon/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {torneo.estado}
          </span>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{torneo.nombre}</h2>
          <p className="text-xs text-fox-muted mt-1">
            📍 {torneo.sede || "Sede a confirmar"} • 🗓️ {formatearFecha(torneo.fechaInicio)}
          </p>
        </div>
      </div>

      {/* Selector de Categorías / Competencias */}
      {competencias.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 border-b border-fox-border/40">
          {competencias.map((comp) => (
            <button
              key={comp.id}
              onClick={() => setCompetenciaActivaId(comp.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                competenciaActivaId === comp.id
                  ? "bg-fox-neon text-fox-bg shadow-fox-glow"
                  : "bg-fox-surface/40 border border-fox-border/50 text-fox-muted hover:text-white"
              }`}
            >
              {comp.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Sub-Tabs de Navegación Pública */}
      <div className="flex border-b border-fox-border/40 text-xs">
        <button
          onClick={() => setSubTab("posiciones")}
          className={`px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
            subTab === "posiciones"
              ? "border-fox-neon text-fox-neon"
              : "border-transparent text-fox-muted hover:text-slate-200"
          }`}
        >
          📊 Posiciones
        </button>
        <button
          onClick={() => setSubTab("fixture")}
          className={`px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
            subTab === "fixture"
              ? "border-fox-neon text-fox-neon"
              : "border-transparent text-fox-muted hover:text-slate-200"
          }`}
        >
          ⚔️ Fixture y Partidos
        </button>
        <button
          onClick={() => setSubTab("cuadro")}
          className={`px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
            subTab === "cuadro"
              ? "border-fox-neon text-fox-neon"
              : "border-transparent text-fox-muted hover:text-slate-200"
          }`}
        >
          🏆 Cuadro Principal
        </button>
      </div>

      {/* VISTA 1: TABLAS DE POSICIONES */}
      {subTab === "posiciones" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {zonas.length === 0 ? (
            <div className="col-span-2 bg-fox-surface/40 border border-fox-border/50 rounded-xl p-8 text-center text-fox-muted text-xs">
              Aún no se han publicado las zonas para esta categoría.
            </div>
          ) : (
            zonas.map((zona) => {
              const partidosZona = partidos.filter((p) => p.zonaId === zona.id);
              const tabla = calcularTablaPosicionesZona(zona, partidosZona, parejasNombresMap);

              return (
                <div key={zona.id} className="bg-fox-surface border border-fox-border/70 rounded-xl p-4 space-y-3 shadow-lg">
                  <h4 className="font-bold text-fox-accent text-xs uppercase tracking-wide border-b border-fox-border/40 pb-2">
                    {zona.nombre}
                  </h4>
                  <table className="w-full text-xs text-left">
                    <thead className="bg-fox-card text-fox-muted uppercase text-[9px]">
                      <tr>
                        <th className="py-2 px-2">Pareja</th>
                        <th className="py-2 px-1 text-center">PJ</th>
                        <th className="py-2 px-1 text-center">PG</th>
                        <th className="py-2 px-1 text-center">PP</th>
                        <th className="py-2 px-1 text-center">DS</th>
                        <th className="py-2 px-1 text-center font-bold text-fox-neon">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-fox-border/30">
                      {tabla.map((pos, idx) => (
                        <tr key={pos.parejaId} className={idx < 2 ? "bg-fox-neon/5" : ""}>
                          <td className="py-2 px-2 font-medium text-slate-200 truncate max-w-[140px]">
                            {idx + 1}. {pos.nombrePareja}
                          </td>
                          <td className="py-2 px-1 text-center text-fox-muted">{pos.partidosJugados}</td>
                          <td className="py-2 px-1 text-center text-fox-neon">{pos.partidosGanados}</td>
                          <td className="py-2 px-1 text-center text-rose-400">{pos.partidosPerdidos}</td>
                          <td className="py-2 px-1 text-center text-slate-300">
                            {pos.diferenciaSets > 0 ? `+${pos.diferenciaSets}` : pos.diferenciaSets}
                          </td>
                          <td className="py-2 px-1 text-center font-bold text-fox-neon">{pos.puntos}</td>
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
            <div className="bg-fox-surface/40 border border-fox-border/50 rounded-xl p-8 text-center text-fox-muted text-xs">
              No hay partidos programados por el momento.
            </div>
          ) : (
            partidos.map((p) => {
              const finalizado = p.estado === "FINALIZADO";
              const nombre1 = p.nombrePareja1 || parejasNombresMap[p.pareja1Id] || "Pareja 1";
              const nombre2 = p.nombrePareja2 || parejasNombresMap[p.pareja2Id] || "Pareja 2";

              return (
                <div
                  key={p.id}
                  className="bg-fox-surface border border-fox-border/70 rounded-xl p-3 flex justify-between items-center text-xs shadow-md"
                >
                  <div className="space-y-1">
                    <div className={p.ganadorParejaId === p.pareja1Id ? "font-bold text-fox-neon" : "text-slate-300"}>
                      {nombre1}
                    </div>
                    <div className={p.ganadorParejaId === p.pareja2Id ? "font-bold text-fox-neon" : "text-slate-300"}>
                      {nombre2}
                    </div>
                  </div>

                  <div>
                    {finalizado && p.sets && p.sets.length > 0 ? (
                      <div className="flex gap-1 font-mono text-xs font-bold text-fox-accent">
                        {p.sets.map((s, i) => (
                          <span key={i} className="bg-fox-card px-2 py-1 rounded border border-fox-border/50">
                            {s.juegosPareja1}-{s.juegosPareja2}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] bg-fox-card text-fox-muted px-2 py-1 rounded font-medium border border-fox-border/40">
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
        <div className="bg-fox-surface border border-fox-border/70 rounded-xl p-5 space-y-6">
          {partidosLlave.length === 0 ? (
            <div className="text-center text-fox-muted text-xs py-6">
              El cuadro principal se habilitará al concluir la fase de grupos.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Semifinales */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-fox-muted uppercase tracking-wider text-center">Semifinales</h4>
                {partidosLlave
                  .filter((p) => p.ronda === "SEMIFINAL")
                  .map((p) => {
                    const nombre1 = p.nombrePareja1 || parejasNombresMap[p.pareja1Id] || "Por definir";
                    const nombre2 = p.nombrePareja2 || parejasNombresMap[p.pareja2Id] || "Por definir";

                    return (
                      <div key={p.id} className="bg-fox-card p-3 rounded-xl border border-fox-border/60 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className={p.ganadorParejaId === p.pareja1Id ? "font-bold text-fox-neon" : "text-slate-200"}>
                            {nombre1}
                          </span>
                          {p.estado === "FINALIZADO" && p.sets && (
                            <span className="font-mono text-fox-accent font-bold">
                              {p.sets.map((s) => s.juegosPareja1).join("-")}
                            </span>
                          )}
                        </div>
                        <div className="border-t border-fox-border/40 my-1" />
                        <div className="flex justify-between text-xs">
                          <span className={p.ganadorParejaId === p.pareja2Id ? "font-bold text-fox-neon" : "text-slate-200"}>
                            {nombre2}
                          </span>
                          {p.estado === "FINALIZADO" && p.sets && (
                            <span className="font-mono text-fox-accent font-bold">
                              {p.sets.map((s) => s.juegosPareja2).join("-")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Gran Final */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-fox-accent uppercase tracking-wider text-center">Gran Final</h4>
                {partidosLlave
                  .filter((p) => p.ronda === "FINAL")
                  .map((p) => {
                    const nombre1 = p.nombrePareja1 || parejasNombresMap[p.pareja1Id] || "Por definir";
                    const nombre2 = p.nombrePareja2 || parejasNombresMap[p.pareja2Id] || "Por definir";

                    return (
                      <div key={p.id} className="bg-fox-card p-4 rounded-xl border-2 border-fox-accent/40 space-y-2 shadow-xl">
                        <div className="flex justify-between text-sm">
                          <span className={p.ganadorParejaId === p.pareja1Id ? "font-bold text-fox-accent" : "text-slate-200"}>
                            {nombre1}
                          </span>
                          {p.estado === "FINALIZADO" && p.sets && (
                            <span className="font-mono text-fox-accent font-bold">
                              {p.sets.map((s) => s.juegosPareja1).join("-")}
                            </span>
                          )}
                        </div>
                        <div className="border-t border-fox-border/40 my-1" />
                        <div className="flex justify-between text-sm">
                          <span className={p.ganadorParejaId === p.pareja2Id ? "font-bold text-fox-accent" : "text-slate-200"}>
                            {nombre2}
                          </span>
                          {p.estado === "FINALIZADO" && p.sets && (
                            <span className="font-mono text-fox-accent font-bold">
                              {p.sets.map((s) => s.juegosPareja2).join("-")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};