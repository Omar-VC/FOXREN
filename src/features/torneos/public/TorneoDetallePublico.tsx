import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { Torneo } from "../../../domain/torneo/torneo.types";
import type { Competencia } from "../../../domain/competencia/competencia.types";
import type { Zona } from "../../../domain/zona/zona.types";
import type { Partido } from "../../../domain/partido/partido.types";
import { calcularTablaPosicionesZona } from "../../../domain/zona/zona.rules";
import { torneosRepository } from "../../../infrastructure/repositories/torneosRepository";
import { competenciasRepository } from "../../../infrastructure/repositories/competenciasRepository";
import { zonasRepository } from "../../../infrastructure/repositories/zonasRepository";
import { partidosRepository } from "../../../infrastructure/repositories/partidosRepository";

interface LlavePartido {
  id: string;
  ronda: "SEMIFINAL" | "FINAL" | string;
  pareja1Id?: string;
  pareja2Id?: string;
  nombrePareja1?: string;
  nombrePareja2?: string;
  ganadorParejaId?: string;
  estado?: string;
  sets?: Array<{ juegosPareja1: number; juegosPareja2: number }>;
}

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

  const formatearFecha = (fecha: any) => {
    if (!fecha) return "Fecha a confirmar";
    if (typeof fecha === "string") return fecha;
    if (typeof fecha === "object" && "seconds" in fecha) {
      return new Date(fecha.seconds * 1000).toLocaleDateString("es-AR");
    }
    if (fecha instanceof Date) return fecha.toLocaleDateString("es-AR");
    return "Fecha a confirmar";
  };

  useEffect(() => {
    if (torneoId) cargarTorneoYCompetencias(torneoId);
  }, [torneoId]);

  useEffect(() => {
    if (competenciaActivaId) cargarDatosCompetencia(competenciaActivaId);
  }, [competenciaActivaId]);

  const cargarTorneoYCompetencias = async (id: string) => {
    setCargando(true);
    try {
      const compsData = await competenciasRepository.obtenerPorTorneoId(id);
      setCompetencias(compsData);

      const todosLosTorneos = await torneosRepository.obtenerTorneos();
      const torneoEncontrado = todosLosTorneos.find((t) => t.id === id) || null;
      setTorneo(torneoEncontrado);

      if (compsData.length > 0) setCompetenciaActivaId(compsData[0].id);
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

      const mapaNombres: Record<string, string> = {};
      partidosData.forEach((p: Partido) => {
        if (p.pareja1Id && p.nombrePareja1) mapaNombres[p.pareja1Id] = p.nombrePareja1;
        if (p.pareja2Id && p.nombrePareja2) mapaNombres[p.pareja2Id] = p.nombrePareja2;
      });

      setZonas(zonasData);
      setPartidos(partidosData);
      setParejasNombresMap(mapaNombres);
      setPartidosLlave([]); // Se alimentará al conectar con el motor de llaves
    } catch (error) {
      console.error("Error al cargar competencia activa:", error);
    }
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-fox-neon border-t-transparent rounded-full animate-spin mb-3" />
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
      {/* HEADER DEL TORNEO */}
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
            📍 {torneo.sede || "Sede a confirmar"} | 🗓️ {formatearFecha(torneo.fechaInicio)}
          </p>
        </div>
      </div>

      {/* SELECTOR DE CATEGORÍAS */}
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

      {/* SUB-TABS */}
      <div className="flex border-b border-fox-border/40 text-xs">
        {[
          { id: "posiciones", label: "📊 Posiciones" },
          { id: "fixture", label: "⚔️ Fixture y Partidos" },
          { id: "cuadro", label: "🏆 Cuadro Principal" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as any)}
            className={`px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
              subTab === tab.id
                ? "border-fox-neon text-fox-neon"
                : "border-transparent text-fox-muted hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO DE PESTAÑAS */}
      {subTab === "posiciones" && (
        <TablaPosicionesView zonas={zonas} partidos={partidos} parejasNombresMap={parejasNombresMap} />
      )}
      {subTab === "fixture" && <FixtureView partidos={partidos} parejasNombresMap={parejasNombresMap} />}
      {subTab === "cuadro" && <CuadroPrincipalView partidosLlave={partidosLlave} parejasNombresMap={parejasNombresMap} />}
    </div>
  );
};

// --- SUBCOMPONENTES AUXILIARES ---

const TablaPosicionesView: React.FC<{ zonas: Zona[]; partidos: Partido[]; parejasNombresMap: Record<string, string> }> = ({
  zonas,
  partidos,
  parejasNombresMap,
}) => {
  if (zonas.length === 0) {
    return (
      <div className="bg-fox-surface/40 border border-fox-border/50 rounded-xl p-8 text-center text-fox-muted text-xs">
        Aún no se han publicado las zonas para esta categoría.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {zonas.map((zona) => {
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
      })}
    </div>
  );
};

const FixtureView: React.FC<{ partidos: Partido[]; parejasNombresMap: Record<string, string> }> = ({
  partidos,
  parejasNombresMap,
}) => {
  if (partidos.length === 0) {
    return (
      <div className="bg-fox-surface/40 border border-fox-border/50 rounded-xl p-8 text-center text-fox-muted text-xs">
        No hay partidos programados por el momento.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {partidos.map((p) => {
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
      })}
    </div>
  );
};

const CuadroPrincipalView: React.FC<{ partidosLlave: LlavePartido[]; parejasNombresMap: Record<string, string> }> = ({
  partidosLlave,
}) => {
  if (partidosLlave.length === 0) {
    return (
      <div className="bg-fox-surface border border-fox-border/70 rounded-xl p-8 text-center text-fox-muted text-xs">
        El cuadro principal se habilitará al concluir la fase de grupos.
      </div>
    );
  }

  return (
    <div className="bg-fox-surface border border-fox-border/70 rounded-xl p-5 space-y-6">
      <p className="text-center text-xs text-fox-muted">Cuadro en desarrollo.</p>
    </div>
  );
};