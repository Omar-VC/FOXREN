import React, { useState } from "react";
import { CompetenciaForm } from "../../competencias/components/CompetenciaForm";
import type { Torneo } from "../../../domain/torneo/torneo.types";
import type { Competencia } from "../../../domain/competencia/competencia.types";
import type { Pareja } from "../../../domain/pareja/pareja.types";

interface TorneoGestionPanelProps {
  torneo: Torneo;
  competencias: Competencia[];
  parejas: Pareja[];
  onClose: () => void;
  onCambiarEstadoPago?: (parejaId: string, nuevoEstado: 'APROBADO' | 'RECHAZADO' | 'PENDIENTE') => Promise<void>;
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
  const [tabActiva, setTabActiva] = useState<"categorias" | "inscriptos" | "partidos" | "config">("categorias");
  const [modoCrearCompetencia, setModoCrearCompetencia] = useState(false);
  const [categoriaExpandidaId, setCategoriaExpandidaId] = useState<string | null>(null);
  const [busquedaInscripto, setBusquedaInscripto] = useState("");
  const [procesandoAccion, setProcesandoAccion] = useState<string | null>(null);

  const competenciasDelTorneo = competencias.filter((c) => c.torneoId === torneo.id);
  const idsCompetencias = competenciasDelTorneo.map((c) => c.id);
  const parejasDelTorneo = parejas.filter((p) => idsCompetencias.includes(p.competenciaId));

  const totalInscriptos = parejasDelTorneo.length;
  const pagosAprobados = parejasDelTorneo.filter((p) => p.estadoPago === "APROBADO").length;
  const pagosPendientes = parejasDelTorneo.filter((p) => p.estadoPago !== "APROBADO").length;

  const parejasFiltradas = parejasDelTorneo.filter((p) => {
    const j1 = `${p.jugador1?.nombre || ""} ${p.jugador1?.apellido || ""}`.toLowerCase();
    const j2 = `${p.jugador2?.nombre || ""} ${p.jugador2?.apellido || ""}`.toLowerCase();
    const termino = busquedaInscripto.toLowerCase();
    return j1.includes(termino) || j2.includes(termino);
  });

  const handleAprobar = async (parejaId: string) => {
    if (!onCambiarEstadoPago) return;
    setProcesandoAccion(parejaId);
    try {
      await onCambiarEstadoPago(parejaId, "APROBADO");
    } finally {
      setProcesandoAccion(null);
    }
  };

  const handleRechazar = async (parejaId: string) => {
    if (!onCambiarEstadoPago) return;
    setProcesandoAccion(parejaId);
    try {
      await onCambiarEstadoPago(parejaId, "RECHAZADO");
    } finally {
      setProcesandoAccion(null);
    }
  };

  const handleEliminar = async (parejaId: string) => {
    if (!onEliminarPareja) return;
    if (!window.confirm("¿Estás seguro de eliminar esta pareja? Se liberará el cupo en la competencia.")) return;
    setProcesandoAccion(parejaId);
    try {
      await onEliminarPareja(parejaId);
    } finally {
      setProcesandoAccion(null);
    }
  };

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
                Llave Activa
              </span>
            </div>
            <h2 className="text-2xl font-black mt-1 text-slate-100">{torneo.nombre}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="self-end sm:self-auto text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Tarjetas de Métricas Rápidas */}
        <div className="grid grid-cols-3 bg-slate-950/60 border-b border-slate-800/80 p-3 gap-3 text-center text-xs">
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
            <span className="block text-slate-400 text-[11px]">Total Parejas</span>
            <span className="text-lg font-bold text-blue-400">{totalInscriptos}</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
            <span className="block text-slate-400 text-[11px]">Pagos Aprobados</span>
            <span className="text-lg font-bold text-emerald-400">{pagosAprobados}</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
            <span className="block text-slate-400 text-[11px]">Pendientes / Revisión</span>
            <span className="text-lg font-bold text-amber-400">{pagosPendientes}</span>
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
                    const parejasCat = parejasDelTorneo.filter((p) => p.competenciaId === comp.id);
                    const estaExpandida = categoriaExpandidaId === comp.id;

                    return (
                      <div key={comp.id} className="bg-slate-800/40 border border-slate-700/70 rounded-xl p-4 transition hover:border-slate-600">
                        <div
                          onClick={() => setCategoriaExpandidaId(estaExpandida ? null : comp.id)}
                          className="flex justify-between items-center cursor-pointer select-none"
                        >
                          <div>
                            <h4 className="font-bold text-sm text-white">{comp.nombre || comp.categoriaId}</h4>
                            <div className="flex gap-3 text-xs text-slate-400 mt-1">
                              <span>Parejas: <strong className="text-slate-200">{parejasCat.length} / {comp.cupoMaximoParejas || "∞"}</strong></span>
                              <span>•</span>
                              <span>Inscripción: <strong className="text-emerald-400">${comp.precioInscripcionBase || 0}</strong></span>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                            {estaExpandida ? "▲ Ocultar" : "▼ Ver detalles"}
                          </span>
                        </div>

                        {estaExpandida && (
                          <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase">Parejas Registradas</span>
                            {parejasCat.length === 0 ? (
                              <p className="text-xs text-slate-500 italic">Sin parejas anotadas.</p>
                            ) : (
                              parejasCat.map((p) => (
                                <div key={p.id} className="bg-slate-900/90 p-2.5 rounded-lg flex justify-between items-center text-xs border border-slate-800">
                                  <div>
                                    <p className="font-semibold text-slate-200">
                                      {p.jugador1?.nombre} {p.jugador1?.apellido} / {p.jugador2?.nombre} {p.jugador2?.apellido}
                                    </p>
                                    <span className="text-[10px] text-slate-500">Tel: {p.jugador1?.telefono || "N/A"}</span>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    p.estadoPago === "APROBADO" 
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                      : p.estadoPago === "RECHAZADO"
                                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  }`}>
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
              <input
                type="text"
                placeholder="🔍 Buscar jugador por nombre o apellido..."
                value={busquedaInscripto}
                onChange={(e) => setBusquedaInscripto(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />

              <div className="space-y-2">
                {parejasFiltradas.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-8">No se encontraron inscriptos.</p>
                ) : (
                  parejasFiltradas.map((p) => {
                    const compPertenece = competenciasDelTorneo.find((c) => c.id === p.competenciaId);
                    const estaCargando = procesandoAccion === p.id;

                    return (
                      <div key={p.id} className="bg-slate-800/40 border border-slate-700/60 p-3 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-slate-700 text-slate-300 font-bold px-1.5 py-0.5 rounded">
                              {compPertenece?.nombre || compPertenece?.categoriaId || "Categoría"}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Ref/Comp: {p.comprobantePagoUrl ? (
                                <a href={p.comprobantePagoUrl} target="_blank" rel="noreferrer" className="text-blue-400 underline">Ver Comprobante</a>
                              ) : (
                                "Sin comprobante"
                              )}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white mt-1">
                            {p.jugador1?.nombre} {p.jugador1?.apellido} & {p.jugador2?.nombre} {p.jugador2?.apellido}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Contacto: {p.jugador1?.telefono || "Sin teléfono"} | {p.jugador2?.telefono || ""}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                            p.estadoPago === "APROBADO" 
                              ? "bg-emerald-500/20 text-emerald-400" 
                              : p.estadoPago === "RECHAZADO"
                              ? "bg-rose-500/20 text-rose-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {p.estadoPago || "PENDIENTE"}
                          </span>

                          {p.estadoPago !== "APROBADO" && (
                            <button
                              disabled={estaCargando}
                              onClick={() => handleAprobar(p.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded text-[11px] transition disabled:opacity-50"
                            >
                              ✓ Aprobar
                            </button>
                          )}

                          {p.estadoPago !== "RECHAZADO" && (
                            <button
                              disabled={estaCargando}
                              onClick={() => handleRechazar(p.id)}
                              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-2.5 py-1 rounded text-[11px] transition disabled:opacity-50"
                            >
                              ✕ Rechazar
                            </button>
                          )}

                          <button
                            disabled={estaCargando}
                            onClick={() => handleEliminar(p.id)}
                            className="bg-rose-900/60 hover:bg-rose-800 text-rose-300 font-bold px-2 py-1 rounded text-[11px] transition border border-rose-700/50 disabled:opacity-50"
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
            <div className="space-y-4 text-center py-8">
              <div className="max-w-md mx-auto bg-slate-800/40 border border-slate-700 p-6 rounded-xl space-y-3">
                <span className="text-3xl">⚔️</span>
                <h4 className="font-bold text-sm text-slate-200">Generación de Fixtures y Zonas</h4>
                <p className="text-xs text-slate-400">
                  Una vez confirmadas las parejas aprobadas por categoría, podés armar las zonas de juego y registrar los resultados para enviar los puntos al Ranking.
                </p>
                <button 
                  disabled={pagosAprobados < 2}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
                >
                  {pagosAprobados < 2 ? "Se requieren al menos 2 parejas aprobadas" : "Generar Zonas Automáticas"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: CONFIGURACIÓN DE COBROS Y TORNEO */}
          {tabActiva === "config" && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-200">Datos de Transferencia y Cobro</h4>
                <div>
                  <label className="text-slate-400 block mb-1">Alias de Pago para Inscriptos</label>
                  <input
                    type="text"
                    disabled
                    value={torneo.datosPago?.alias || (torneo as any).aliasPago || "No configurado"}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 font-mono text-xs cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Este alias es el que visualizarán los usuarios al momento de pagar su inscripción.
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