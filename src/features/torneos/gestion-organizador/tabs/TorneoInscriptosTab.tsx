import React, { useState, useMemo } from "react";
import type { Competencia } from "../../../../domain/competencia/competencia.types";
import type { Pareja } from "../../../../domain/pareja/pareja.types";

interface TorneoInscriptosTabProps {
  competencias: Competencia[];
  parejas: Pareja[];
  onCambiarEstadoPago?: (parejaId: string, nuevoEstado: any) => Promise<void>;
  onEliminarPareja?: (parejaId: string) => Promise<void>;
}

export const TorneoInscriptosTab: React.FC<TorneoInscriptosTabProps> = ({
  competencias,
  parejas,
  onCambiarEstadoPago,
  onEliminarPareja,
}) => {
  const [busquedaInscripto, setBusquedaInscripto] = useState("");
  const [filtroEstadoPago, setFiltroEstadoPago] = useState<string>("TODOS");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("TODAS");
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  const idsCompetencias = useMemo(() => new Set(competencias.map((c) => c.id)), [competencias]);
  const parejasDelTorneo = useMemo(() => parejas.filter((p) => idsCompetencias.has(p.competenciaId)), [parejas, idsCompetencias]);

  const parejasFiltradas = useMemo(() => {
    const termino = busquedaInscripto.toLowerCase().trim();
    return parejasDelTorneo.filter((p) => {
      const j1 = `${p.jugador1?.nombre || ""} ${p.jugador1?.apellido || ""}`.toLowerCase();
      const j2 = `${p.jugador2?.nombre || ""} ${p.jugador2?.apellido || ""}`.toLowerCase();
      const coincideTexto = !termino || j1.includes(termino) || j2.includes(termino);
      const estadoP = p.estadoPago || "PENDIENTE";
      const coincideEstado = filtroEstadoPago === "TODOS" || estadoP === filtroEstadoPago;
      const coincideCategoria = filtroCategoria === "TODAS" || p.competenciaId === filtroCategoria;
      return coincideTexto && coincideEstado && coincideCategoria;
    });
  }, [parejasDelTorneo, busquedaInscripto, filtroEstadoPago, filtroCategoria]);

  const handleEstadoPago = async (parejaId: string, estado: any) => {
    setProcesandoId(parejaId);
    try {
      if (onCambiarEstadoPago) await onCambiarEstadoPago(parejaId, estado);
    } finally {
      setProcesandoId(null);
    }
  };

  const handleEliminar = async (parejaId: string) => {
    if (!window.confirm("¿Seguro de eliminar esta pareja?")) return;
    setProcesandoId(parejaId);
    try {
      if (onEliminarPareja) await onEliminarPareja(parejaId);
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o apellido..."
          value={busquedaInscripto}
          onChange={(e) => setBusquedaInscripto(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
        >
          <option value="TODAS">Todas las Categorías</option>
          {competencias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre || c.categoriaId}</option>
          ))}
        </select>
        <select
          value={filtroEstadoPago}
          onChange={(e) => setFiltroEstadoPago(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
        >
          <option value="TODOS">Todos los Estados</option>
          <option value="PENDIENTE">⏳ Pendientes</option>
          <option value="APROBADO">✅ Aprobados</option>
          <option value="RECHAZADO">❌ Rechazados</option>
        </select>
      </div>

      <div className="space-y-2">
        {parejasFiltradas.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-10">No se encontraron inscriptos.</p>
        ) : (
          parejasFiltradas.map((p) => {
            const comp = competencias.find((c) => c.id === p.competenciaId);
            const cargando = procesandoId === p.id;
            const estadoActual = p.estadoPago || "PENDIENTE";

            return (
              <div key={p.id} className="bg-slate-800/40 border border-slate-700/60 p-3.5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-[10px] bg-slate-700 text-slate-300 font-bold px-2 py-0.5 rounded-md">
                    {comp?.nombre || comp?.categoriaId || "Categoría"}
                  </span>
                  <p className="text-xs font-bold text-white mt-1">
                    {p.jugador1?.nombre} {p.jugador1?.apellido} & {p.jugador2?.nombre} {p.jugador2?.apellido}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                  {estadoActual !== "APROBADO" && (
                    <button disabled={cargando} onClick={() => handleEstadoPago(p.id, "APROBADO")} className="bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg text-[11px]">✓ Aprobar</button>
                  )}
                  {estadoActual !== "PENDIENTE" && (
                    <button disabled={cargando} onClick={() => handleEstadoPago(p.id, "PENDIENTE")} className="bg-amber-600 text-white font-bold px-3 py-1 rounded-lg text-[11px]">⏳ Pendiente</button>
                  )}
                  {estadoActual !== "RECHAZADO" && (
                    <button disabled={cargando} onClick={() => handleEstadoPago(p.id, "RECHAZADO")} className="bg-rose-600 text-white font-bold px-3 py-1 rounded-lg text-[11px]">✕ Rechazar</button>
                  )}
                  <button disabled={cargando} onClick={() => handleEliminar(p.id)} className="bg-rose-950 text-rose-300 px-2.5 py-1 rounded-lg text-[11px] border border-rose-800 ml-1">🗑</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};