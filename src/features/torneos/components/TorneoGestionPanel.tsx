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

  // 1. CREAR ESTE ESTADO LOCAL:
  const [parejasLocales, setParejasLocales] = useState<Pareja[]>(parejas);

  const [tabActiva, setTabActiva] = useState<
    "categorias" | "inscriptos" | "partidos" | "config"
  >("categorias");
  const [modoCrearCompetencia, setModoCrearCompetencia] = useState(false);
  const [categoriaExpandidaId, setCategoriaExpandidaId] = useState<
    string | null
  >(null);

  // Filtros para Inscriptos
  const [busquedaInscripto, setBusquedaInscripto] = useState("");
  const [filtroEstadoPago, setFiltroEstadoPago] = useState<
    "TODOS" | "APROBADO" | "PENDIENTE" | "RECHAZADO"
  >("TODOS");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("TODAS");

  // Competencia seleccionada para Tab de Partidos
  const [competenciaPartidosId, setCompetenciaPartidosId] = useState<string>("");

  const [procesandoAccion, setProcesandoAccion] = useState<string | null>(null);

  // Relaciones
  const competenciasDelTorneo = competencias.filter(
    (c) => c.torneoId === torneo.id,
  );
  const idsCompetencias = competenciasDelTorneo.map((c) => c.id);
  const parejasDelTorneo = parejasLocales.filter((p) =>
    idsCompetencias.includes(p.competenciaId),
  );

  // Métricas
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

  // Filtrado de Parejas
  const parejasFiltradas = parejasDelTorneo.filter((p) => {
    const j1 =
      `${p.jugador1?.nombre || ""} ${p.jugador1?.apellido || ""}`.toLowerCase();
    const j2 =
      `${p.jugador2?.nombre || ""} ${p.jugador2?.apellido || ""}`.toLowerCase();
    const dni1 = (p.jugador1?.dni || "").toString();
    const dni2 = (p.jugador2?.dni || "").toString();
    const termino = busquedaInscripto.toLowerCase();

    const coincideTexto =
      j1.includes(termino) || j2.includes(termino) || dni1.includes(termino) || dni2.includes(termino);

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

    // Actualiza la pantalla INMEDIATAMENTE
    setParejasLocales((prev) =>
      prev.map((p) => (p.id === parejaId ? { ...p, estadoPago: nuevoEstado } : p))
    );

    try {
      if (onCambiarEstadoPago) {
        await onCambiarEstadoPago(parejaId, nuevoEstado);
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      setParejasLocales(parejas); // Revierte si hay error
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

    // Quita la pareja de la pantalla INMEDIATAMENTE
    setParejasLocales((prev) => prev.filter((p) => p.id !== parejaId));

    try {
      if (onEliminarPareja) {
        await onEliminarPareja(parejaId);
      }
    } catch (error) {
      console.error("Error al eliminar la pareja:", error);
      setParejasLocales(parejas); // Revierte si hay error
    } finally {
      setProcesandoAccion(null);
    }
  };

  // Competencia activa para la pestaña de partidos
  const competenciaSeleccionadaParaPartidos =
    competenciasDelTorneo.find((c) => c.id === competenciaPartidosId) ||
    competenciasDelTorneo[0];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full flex flex-col max-h-[92vh] text-white shadow-2xl overflow-hidden">
        {/* Cabecera Principal */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Panel de Administración
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Gestión Directa
              </span>
            </div>
            <h2 className="text-2xl font-black mt-1 text-slate-100">
              {torneo.nombre}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="self-end sm:self-auto text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Tarjetas de Métricas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-950/60 border-b border-slate-800/80 p-3 gap-3 text-center text-xs">
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
            <span className="block text-slate-400 text-[11px]">
              Total Parejas
            </span>
            <span className="text-lg font-bold text-blue-400">
              {totalInscriptos}
            </span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
            <span className="block text-slate-400 text-[11px]">
              Pagos Aprobados
            </span>
            <span className="text-lg font-bold text-emerald-400">
              {pagosAprobados}
            </span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
            <span className="block text-slate-400 text-[11px]">
              Pendientes
            </span>
            <span className="text-lg font-bold text-amber-400">
              {pagosPendientes}
            </span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
            <span className="block text-slate-400 text-[11px]">
              Rechazados
            </span>
            <span className="text-lg font-bold text-rose-400">
              {pagosRechazados}
            </span>
          </div>
        </div>

        {/* Navegación por Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setTabActiva("categorias")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              tabActiva === "categorias"
                ? "border-blue-500 text-blue-400 bg-slate-800/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            🏆 Categorías ({competenciasDelTorneo.length})
          </button>
          <button
            onClick={() => setTabActiva("inscriptos")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              tabActiva === "inscriptos"
                ? "border-blue-500 text-blue-400 bg-slate-800/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            👥 Gestión de Inscriptos ({totalInscriptos})
          </button>
          <button
            onClick={() => setTabActiva("partidos")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              tabActiva === "partidos"
                ? "border-blue-500 text-blue-400 bg-slate-800/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            ⚔️ Cuadros y Partidos
          </button>
          <button
            onClick={() => setTabActiva("config")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              tabActiva === "config"
                ? "border-blue-500 text-blue-400 bg-slate-800/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            ⚙️ Datos y Cobros
          </button>
        </div>

        {/* Cuerpos de las Tabs */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: CATEGORÍAS */}
          {tabActiva === "categorias" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Categorías Habilitadas
                </h3>
                <button
                  onClick={() => setModoCrearCompetencia(!modoCrearCompetencia)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm"
                >
                  {modoCrearCompetencia ? "✕ Cancelar" : "➕ Nueva Categoría"}
                </button>
              </div>

              {modoCrearCompetencia && (
                <div className="bg-slate-800/90 p-4 rounded-xl border border-blue-500/30">
                  <CompetenciaForm
                    torneoId={torneo.id}
                    onSuccess={() => setModoCrearCompetencia(false)}
                  />
                </div>
              )}

              <div className="space-y-3">
                {competenciasDelTorneo.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-8 border border-dashed border-slate-800 rounded-xl">
                    No hay categorías creadas para este torneo aún.
                  </p>
                ) : (
                  competenciasDelTorneo.map((comp) => {
                    const parejasCat = parejasDelTorneo.filter(
                      (p) => p.competenciaId === comp.id,
                    );
                    const estaExpandida = categoriaExpandidaId === comp.id;

                    return (
                      <div
                        key={comp.id}
                        className="bg-slate-800/40 border border-slate-700/70 rounded-xl p-4 transition hover:border-slate-600"
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
                            <div className="flex gap-3 text-xs text-slate-400 mt-1">
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
                          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                            {estaExpandida ? "▲ Ocultar" : "▼ Ver detalles"}
                          </span>
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
                                  className="bg-slate-900/90 p-2.5 rounded-lg flex justify-between items-center text-xs border border-slate-800"
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

          {/* TAB 2: GESTIÓN DE INSCRIPTOS Y PAGOS */}
          {tabActiva === "inscriptos" && (
            <div className="space-y-4">
              {/* Barra de Búsqueda y Filtros */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="🔍 Buscar por nombre, apellido o DNI..."
                  value={busquedaInscripto}
                  onChange={(e) => setBusquedaInscripto(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />

                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
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
                  onChange={(e) =>
                    setFiltroEstadoPago(
                      e.target.value as "TODOS" | "APROBADO" | "PENDIENTE" | "RECHAZADO",
                    )
                  }
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="TODOS">Todos los Estados</option>
                  <option value="PENDIENTE">⏳ Pendiente de Pago/Revisión</option>
                  <option value="APROBADO">✅ Pago Aprobado</option>
                  <option value="RECHAZADO">❌ Pago Rechazado</option>
                </select>
              </div>

              {/* Lista de Inscriptos */}
              <div className="space-y-2">
                {parejasFiltradas.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-8">
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
                        className="bg-slate-800/40 border border-slate-700/60 p-3 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-slate-700 text-slate-300 font-bold px-1.5 py-0.5 rounded">
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

                        {/* Botones de Acción */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {estadoActual !== "APROBADO" && (
                            <button
                              disabled={estaCargando}
                              onClick={() => handleCambiarEstado(p.id, "APROBADO")}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded text-[11px] transition disabled:opacity-50"
                            >
                              ✓ Aprobar
                            </button>
                          )}

                          {estadoActual !== "PENDIENTE" && (
                            <button
                              disabled={estaCargando}
                              onClick={() => handleCambiarEstado(p.id, "PENDIENTE")}
                              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-2.5 py-1 rounded text-[11px] transition disabled:opacity-50"
                            >
                              ⏳ Pendiente
                            </button>
                          )}

                          {estadoActual !== "RECHAZADO" && (
                            <button
                              disabled={estaCargando}
                              onClick={() => handleCambiarEstado(p.id, "RECHAZADO")}
                              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-2.5 py-1 rounded text-[11px] transition disabled:opacity-50"
                            >
                              ✕ Rechazar
                            </button>
                          )}

                          <button
                            disabled={estaCargando}
                            onClick={() => handleEliminar(p.id)}
                            className="bg-rose-950 hover:bg-rose-800 text-rose-300 font-bold px-2 py-1 rounded text-[11px] transition border border-rose-700/50 disabled:opacity-50 ml-1"
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

          {/* TAB 3: CUADROS Y PARTIDOS */}
          {tabActiva === "partidos" && (
            <div className="space-y-4">
              {competenciasDelTorneo.length > 1 && (
                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <label className="text-xs text-slate-400 font-bold pl-2">
                    Categoría:
                  </label>
                  <select
                    value={competenciaSeleccionadaParaPartidos?.id || ""}
                    onChange={(e) => setCompetenciaPartidosId(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
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
                      p.competenciaId === competenciaSeleccionadaParaPartidos.id &&
                      p.estadoPago === "APROBADO",
                  )}
                />
              ) : (
                <p className="text-center text-xs text-slate-500 py-8">
                  Crea al menos una categoría para gestionar los cuadros.
                </p>
              )}
            </div>
          )}

          {/* TAB 4: CONFIGURACIÓN DE COBROS Y TORNEO */}
          {tabActiva === "config" && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl space-y-3">
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
                    value={
                      torneo.datosPago?.alias ||
                      "No configurado"
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 font-mono text-xs cursor-not-allowed"
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