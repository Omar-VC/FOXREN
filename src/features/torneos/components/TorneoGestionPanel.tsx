import React, { useState } from "react";
import { CompetenciaForm } from "../../competencias/components/CompetenciaForm";
import type { Torneo } from "../../../domain/torneo/torneo.types";
import type { Competencia } from "../../../domain/competencia/competencia.types";
import type { Pareja } from "../../../domain/pareja/pareja.types";
import { CuadrosYPartidosPanel } from "./CuadrosYPartidosPanel";

interface TorneoGestionPanelProps {
  torneo: Torneo;
  competencias: Competencia[];
  parejas: Pareja[];
  onClose: () => void;
  onCambiarEstadoPago?: (
    parejaId: string,
    nuevoEstado: "APROBADO" | "RECHAZADO" | "PENDIENTE",
  ) => Promise<void>;
  onEliminarPareja?: (parejaId: string) => Promise<void>;
}

export const TorneoGestionPanel: React.FC<TorneoGestionPanelProps> = ({
  torneo,
  competencias,
  parejas,
  onClose,
  onCambiarEstadoPago,
  onEliminarPareja,
}) => {
  const [parejasLocales, setParejasLocales] = useState<Pareja[]>(parejas);
  const [tabActiva, setTabActiva] = useState<
    "categorias" | "inscriptos" | "partidos" | "config"
  >("categorias");

  const [modoCrearCompetencia, setModoCrearCompetencia] = useState(false);
  const [categoriaExpandidaId, setCategoriaExpandidaId] = useState<
    string | null
  >(null);

  // Filtros
  const [busquedaInscripto, setBusquedaInscripto] = useState("");
  const [filtroEstadoPago, setFiltroEstadoPago] = useState<
    "TODOS" | "APROBADO" | "PENDIENTE" | "RECHAZADO"
  >("TODOS");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("TODAS");
  const [competenciaPartidosId, setCompetenciaPartidosId] =
    useState<string>("");
  const [procesandoAccion, setProcesandoAccion] = useState<string | null>(null);

  // Computed data
  const competenciasDelTorneo = competencias.filter(
    (c) => c.torneoId === torneo.id,
  );
  const idsCompetencias = competenciasDelTorneo.map((c) => c.id);
  const parejasDelTorneo = parejasLocales.filter((p) =>
    idsCompetencias.includes(p.competenciaId),
  );

  const totalInscriptos = parejasDelTorneo.length;
  const pagosAprobados = parejasDelTorneo.filter(
    (p) => p.estadoPago === "APROBADO",
  ).length;
  const pagosPendientes = parejasDelTorneo.filter(
    (p) => !p.estadoPago || p.estadoPago === "PENDIENTE",
  ).length;
  const pagosRechazados = parejasDelTorneo.filter(
    (p) => p.estadoPago === "RECHAZADO",
  ).length;

  const parejasFiltradas = parejasDelTorneo.filter((p) => {
    const j1 =
      `${p.jugador1?.nombre || ""} ${p.jugador1?.apellido || ""}`.toLowerCase();
    const j2 =
      `${p.jugador2?.nombre || ""} ${p.jugador2?.apellido || ""}`.toLowerCase();
    const dni1 = (p.jugador1?.dni || "").toString();
    const dni2 = (p.jugador2?.dni || "").toString();
    const termino = busquedaInscripto.toLowerCase();

    const coincideTexto =
      j1.includes(termino) ||
      j2.includes(termino) ||
      dni1.includes(termino) ||
      dni2.includes(termino);
    const estadoP = p.estadoPago || "PENDIENTE";
    const coincideEstado =
      filtroEstadoPago === "TODOS" || estadoP === filtroEstadoPago;
    const coincideCategoria =
      filtroCategoria === "TODAS" || p.competenciaId === filtroCategoria;

    return coincideTexto && coincideEstado && coincideCategoria;
  });

  const handleCambiarEstado = async (
    parejaId: string,
    nuevoEstado: "APROBADO" | "RECHAZADO" | "PENDIENTE",
  ) => {
    setProcesandoAccion(parejaId);
    setParejasLocales((prev) =>
      prev.map((p) =>
        p.id === parejaId ? { ...p, estadoPago: nuevoEstado } : p,
      ),
    );

    try {
      if (onCambiarEstadoPago) {
        await onCambiarEstadoPago(parejaId, nuevoEstado);
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      setParejasLocales(parejas);
    } finally {
      setProcesandoAccion(null);
    }
  };

  const handleEliminar = async (parejaId: string) => {
    if (
      !window.confirm(
        "¿Estás seguro de eliminar esta pareja? Se liberará el cupo en la competencia.",
      )
    )
      return;

    setProcesandoAccion(parejaId);
    setParejasLocales((prev) => prev.filter((p) => p.id !== parejaId));

    try {
      if (onEliminarPareja) {
        await onEliminarPareja(parejaId);
      }
    } catch (error) {
      console.error("Error al eliminar la pareja:", error);
      setParejasLocales(parejas);
    } finally {
      setProcesandoAccion(null);
    }
  };

  const competenciaSeleccionadaParaPartidos =
    competenciasDelTorneo.find((c) => c.id === competenciaPartidosId) ||
    competenciasDelTorneo[0];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full flex flex-col max-h-[94vh] text-white shadow-2xl overflow-hidden">
        {/* 1. HEADER IMPROVED */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/95 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 text-blue-400 p-2.5 rounded-2xl border border-blue-500/20">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Panel Admin
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
                  {torneo.estado || "Activo"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-0.5">
                {torneo.nombre}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 w-9 h-9 rounded-full flex items-center justify-center text-sm transition border border-slate-700/50"
          >
            ✕
          </button>
        </div>

        {/* 2. METRICS CARDS IMPROVED */}
        <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-950/40 border-b border-slate-800/80 p-3 gap-2.5 text-xs">
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex flex-col justify-center">
            <span className="text-slate-400 text-[11px] font-medium">
              Total Parejas
            </span>
            <span className="text-xl font-black text-blue-400 mt-0.5">
              {totalInscriptos}
            </span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex flex-col justify-center">
            <span className="text-slate-400 text-[11px] font-medium">
              Aprobados
            </span>
            <span className="text-xl font-black text-emerald-400 mt-0.5">
              {pagosAprobados}
            </span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex flex-col justify-center">
            <span className="text-slate-400 text-[11px] font-medium">
              Pendientes
            </span>
            <span className="text-xl font-black text-amber-400 mt-0.5">
              {pagosPendientes}
            </span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex flex-col justify-center">
            <span className="text-slate-400 text-[11px] font-medium">
              Rechazados
            </span>
            <span className="text-xl font-black text-rose-400 mt-0.5">
              {pagosRechazados}
            </span>
          </div>
        </div>

        {/* 3. MODERNIZED TABS NAVBAR */}
        {/* AGREGAMOS: shrink-0 z-10 */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-1.5 overflow-x-auto shrink-0 z-10">
          {[
            {
              id: "categorias",
              label: `🏆 Categorías (${competenciasDelTorneo.length})`,
            },
            { id: "inscriptos", label: `👥 Inscriptos (${totalInscriptos})` },
            { id: "partidos", label: "⚔️ Cuadros y Partidos" },
            { id: "config", label: "⚙️ Reglamento y Datos" },
          ].map((tab) => {
            const isSelected = tabActiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id as any)}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                  isSelected
                    ? "border-blue-500 text-blue-400 bg-slate-800/80 shadow-sm"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 4. TABS CONTENT AREA */}
        {/* AGREGAMOS: min-h-0 */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4">

          
          {/* TAB 1: CATEGORÍAS */}
          {tabActiva === "categorias" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Categorías Habilitadas
                </h3>
                <button
                  onClick={() => setModoCrearCompetencia(!modoCrearCompetencia)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition shadow-md"
                >
                  {modoCrearCompetencia ? "✕ Cancelar" : "➕ Nueva Categoría"}
                </button>
              </div>

              {modoCrearCompetencia && (
                <div className="bg-slate-800/90 p-4 rounded-2xl border border-blue-500/30 shadow-lg">
                  <CompetenciaForm
                    torneoId={torneo.id}
                    onSuccess={() => setModoCrearCompetencia(false)}
                  />
                </div>
              )}

              <div className="space-y-3">
                {competenciasDelTorneo.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-10 border border-dashed border-slate-800 rounded-2xl">
                    No hay categorías creadas para este torneo aún.
                  </p>
                ) : (
                  competenciasDelTorneo.map((comp) => {
                    const parejasCat = parejasDelTorneo.filter(
                      (p) => p.competenciaId === comp.id,
                    );
                    const estaExpandida = categoriaExpandidaId === comp.id;

                    // Dinamicamente kalkularen ti formato/reglamento basaran iti pareha
                    const countParejas = parejasCat.length;
                    let formatInfo = "Sin parejas suficientes aún";
                    if (countParejas === 4) {
                      formatInfo =
                        "4 parejas: Todos contra todos en tabla general. Clasifican los 2 primeros a Final Directa.";
                    } else if (countParejas > 4) {
                      formatInfo = `${countParejas} parejas: Fases de grupos con eliminación directa.`;
                    }

                    return (
                      <div
                        key={comp.id}
                        className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 transition hover:border-slate-600"
                      >
                        <div
                          onClick={() =>
                            setCategoriaExpandidaId(
                              estaExpandida ? null : comp.id,
                            )
                          }
                          className="flex justify-between items-center cursor-pointer select-none"
                        >
                          <div>
                            <h4 className="font-bold text-sm text-white">
                              {comp.nombre || comp.categoriaId}
                            </h4>
                            <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-1">
                              <span>
                                Parejas:{" "}
                                <strong className="text-slate-200">
                                  {parejasCat.length} /{" "}
                                  {comp.cupoMaximoParejas || "∞"}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                Inscripción:{" "}
                                <strong className="text-emerald-400">
                                  ${comp.precioInscripcionBase || 0}
                                </strong>
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/50">
                            {estaExpandida ? "▲ Ocultar" : "▼ Ver detalles"}
                          </span>
                        </div>

                        {/* DESCRIPCIÓN REGLAMENTO CORTO */}
                        <div className="mt-3 bg-blue-950/30 border border-blue-800/40 rounded-xl p-2.5 text-xs text-blue-300/90 flex items-center gap-2">
                          <span>📌</span>
                          <p>
                            <strong>Formato:</strong> {formatInfo}
                          </p>
                        </div>

                        {estaExpandida && (
                          <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase">
                              Parejas Registradas
                            </span>
                            {parejasCat.length === 0 ? (
                              <p className="text-xs text-slate-500 italic">
                                Sin parejas anotadas.
                              </p>
                            ) : (
                              parejasCat.map((p) => (
                                <div
                                  key={p.id}
                                  className="bg-slate-900/90 p-3 rounded-xl flex justify-between items-center text-xs border border-slate-800"
                                >
                                  <div>
                                    <p className="font-semibold text-slate-200">
                                      {p.jugador1?.nombre}{" "}
                                      {p.jugador1?.apellido} /{" "}
                                      {p.jugador2?.nombre}{" "}
                                      {p.jugador2?.apellido}
                                    </p>
                                    <span className="text-[10px] text-slate-500">
                                      Tel: {p.jugador1?.telefono || "N/A"}
                                    </span>
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      p.estadoPago === "APROBADO"
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        : p.estadoPago === "RECHAZADO"
                                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    }`}
                                  >
                                    {p.estadoPago || "PENDIENTE"}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GESTIÓN DE INSCRIPTOS */}
          {tabActiva === "inscriptos" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="🔍 Buscar por nombre, apellido o DNI..."
                  value={busquedaInscripto}
                  onChange={(e) => setBusquedaInscripto(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />

                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="TODAS">Todas las Categorías</option>
                  {competenciasDelTorneo.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre || c.categoriaId}
                    </option>
                  ))}
                </select>

                <select
                  value={filtroEstadoPago}
                  onChange={(e) => setFiltroEstadoPago(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="TODOS">Todos los Estados</option>
                  <option value="PENDIENTE">
                    ⏳ Pendiente de Pago/Revisión
                  </option>
                  <option value="APROBADO">✅ Pago Aprobado</option>
                  <option value="RECHAZADO">❌ Pago Rechazado</option>
                </select>
              </div>

              <div className="space-y-2">
                {parejasFiltradas.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-10">
                    No se encontraron inscriptos con los filtros aplicados.
                  </p>
                ) : (
                  parejasFiltradas.map((p) => {
                    const compPertenece = competenciasDelTorneo.find(
                      (c) => c.id === p.competenciaId,
                    );
                    const estaCargando = procesandoAccion === p.id;
                    const estadoActual = p.estadoPago || "PENDIENTE";

                    return (
                      <div
                        key={p.id}
                        className="bg-slate-800/40 border border-slate-700/60 p-3.5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-slate-700 text-slate-300 font-bold px-2 py-0.5 rounded-md">
                              {compPertenece?.nombre ||
                                compPertenece?.categoriaId ||
                                "Categoría"}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Comprobante:{" "}
                              {p.comprobantePagoUrl ? (
                                <a
                                  href={p.comprobantePagoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-400 underline font-semibold"
                                >
                                  Ver Archivo
                                </a>
                              ) : (
                                "Sin adjunto"
                              )}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white mt-1">
                            {p.jugador1?.nombre} {p.jugador1?.apellido}{" "}
                            <span className="text-slate-500 text-[10px]">
                              (DNI: {p.jugador1?.dni || "N/A"})
                            </span>{" "}
                            & {p.jugador2?.nombre} {p.jugador2?.apellido}{" "}
                            <span className="text-slate-500 text-[10px]">
                              (DNI: {p.jugador2?.dni || "N/A"})
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Tel: {p.jugador1?.telefono || "N/A"} |{" "}
                            {p.jugador2?.telefono || "N/A"}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                          {estadoActual !== "APROBADO" && (
                            <button
                              disabled={estaCargando}
                              onClick={() =>
                                handleCambiarEstado(p.id, "APROBADO")
                              }
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg text-[11px] transition disabled:opacity-50"
                            >
                              ✓ Aprobar
                            </button>
                          )}
                          {estadoActual !== "PENDIENTE" && (
                            <button
                              disabled={estaCargando}
                              onClick={() =>
                                handleCambiarEstado(p.id, "PENDIENTE")
                              }
                              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1 rounded-lg text-[11px] transition disabled:opacity-50"
                            >
                              ⏳ Pendiente
                            </button>
                          )}
                          {estadoActual !== "RECHAZADO" && (
                            <button
                              disabled={estaCargando}
                              onClick={() =>
                                handleCambiarEstado(p.id, "RECHAZADO")
                              }
                              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1 rounded-lg text-[11px] transition disabled:opacity-50"
                            >
                              ✕ Rechazar
                            </button>
                          )}
                          <button
                            disabled={estaCargando}
                            onClick={() => handleEliminar(p.id)}
                            className="bg-rose-950/60 hover:bg-rose-800 text-rose-300 font-bold px-2.5 py-1 rounded-lg text-[11px] transition border border-rose-800/50 disabled:opacity-50 ml-1"
                            title="Eliminar pareja"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PARTIDOS */}
          {tabActiva === "partidos" && (
            <div className="space-y-4">
              {competenciasDelTorneo.length > 1 && (
                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
                  <label className="text-xs text-slate-400 font-bold pl-2">
                    Categoría:
                  </label>
                  <select
                    value={competenciaSeleccionadaParaPartidos?.id || ""}
                    onChange={(e) => setCompetenciaPartidosId(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {competenciasDelTorneo.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre || c.categoriaId}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {competenciaSeleccionadaParaPartidos ? (
                <CuadrosYPartidosPanel
                  competenciaId={competenciaSeleccionadaParaPartidos.id}
                  parejasAprobadas={parejasDelTorneo.filter(
                    (p) =>
                      p.competenciaId ===
                        competenciaSeleccionadaParaPartidos.id &&
                      p.estadoPago === "APROBADO",
                  )}
                />
              ) : (
                <p className="text-center text-xs text-slate-500 py-10">
                  Crea al menos una categoría para gestionar los cuadros.
                </p>
              )}
            </div>
          )}

          {/* TAB 4: CONFIGURACIÓN Y REGLAMENTO */}
          {tabActiva === "config" && (
            <div className="space-y-4 text-xs">
              {/* REGLAMENTO GENERAL DEL TORNEO */}
              <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  <span>📜</span> Reglamento y Formato del Torneo
                </h4>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-slate-300 leading-relaxed">
                  <p>
                    <strong>Formato de Competencia General:</strong>
                  </p>
                  <p className="text-slate-400">
                    "Esta competencia consta de 4 parejas por categoría.
                    Disputarán una tabla de fase regular (todos contra todos) y
                    clasificarán 2 parejas directas que disputarán la final."
                  </p>
                </div>
              </div>

              {/* COBROS Y DATOS */}
              <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-200">
                  Datos de Transferencia y Cobro
                </h4>
                <div>
                  <label className="text-slate-400 block mb-1">
                    Alias de Pago para Inscriptos
                  </label>
                  <input
                    type="text"
                    disabled
                    value={torneo.datosPago?.alias || "No configurado"}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-300 font-mono text-xs cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Este alias es el que visualizarán los usuarios al momento de
                    pagar su inscripción.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
