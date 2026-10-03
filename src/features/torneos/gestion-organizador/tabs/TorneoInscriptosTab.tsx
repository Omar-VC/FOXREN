import React, { useState, useMemo } from "react";
import type { Competencia } from "../../../../domain/competencia/competencia.types";

export interface JugadorContacto {
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
}

export interface ParejaInscripta {
  id: string;
  competenciaId?: string;
  categoriaId?: string;
  idCompetencia?: string;
  torneoId?: string;
  jugador1?: JugadorContacto;
  jugador2?: JugadorContacto;
  // Campos planos de respaldo
  nombreJugador1?: string;
  apellidoJugador1?: string;
  nombreJugador2?: string;
  apellidoJugador2?: string;
  telefonoJugador1?: string;
  telefono1?: string;
  restriccionHoraria?: string;
  comprobantePago?: string;
  montoTotal?: number;
  estadoPago?: string;
  createdAt?: any;
}

interface TorneoInscriptosTabProps {
  competencias: Competencia[];
  parejas: ParejaInscripta[];
  onCambiarEstadoPago?: (parejaId: string, nuevoEstado: string) => Promise<void>;
  onEliminarPareja?: (parejaId: string) => Promise<void>;
}

export const TorneoInscriptosTab: React.FC<TorneoInscriptosTabProps> = ({
  competencias = [],
  parejas = [],
  onCambiarEstadoPago,
  onEliminarPareja,
}) => {
  const [busquedaInscripto, setBusquedaInscripto] = useState("");
  const [filtroEstadoPago, setFiltroEstadoPago] = useState<string>("TODOS");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("TODAS");
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  // Normaliza la obtención del ID de competencia (independiente del nombre de campo)
  const getCompId = (p: ParejaInscripta): string => {
    return String(p.competenciaId || p.categoriaId || p.idCompetencia || "");
  };

  // Normaliza los datos de jugador (soporta objetos anidados o atributos planos)
  const getJugadorData = (
    jObj?: JugadorContacto,
    nombrePlano?: string,
    apellidoPlano?: string,
    telPlano?: string
  ) => {
    const nombre = jObj?.nombre || nombrePlano || "";
    const apellido = jObj?.apellido || apellidoPlano || "";
    const telefono = jObj?.telefono || telPlano || "";
    const nombreCompleto = `${nombre} ${apellido}`.trim() || "Sin Nombre";
    return { nombre, apellido, telefono, nombreCompleto };
  };

  const idsCompetencias = useMemo(
    () => new Set(competencias.map((c) => String(c.id))),
    [competencias]
  );

  // Logs en consola para depuración
  console.log("🔍 [TorneoInscriptosTab] Competencias recibidas:", competencias.length, Array.from(idsCompetencias));
  console.log("🔍 [TorneoInscriptosTab] Parejas totales recibidas:", parejas.length, parejas);

  const parejasDelTorneo = useMemo(() => {
    // Si no hay lista de competencias disponible, muestra las parejas recibidas sin bloquearlas
    if (idsCompetencias.size === 0) return parejas;

    return parejas.filter((p) => {
      const compId = getCompId(p);
      return idsCompetencias.has(compId) || !compId;
    });
  }, [parejas, idsCompetencias]);

  const parejasFiltradas = useMemo(() => {
    const termino = busquedaInscripto.toLowerCase().trim();

    return parejasDelTorneo.filter((p) => {
      const j1 = getJugadorData(p.jugador1, p.nombreJugador1, p.apellidoJugador1, p.telefonoJugador1 || p.telefono1);
      const j2 = getJugadorData(p.jugador2, p.nombreJugador2, p.apellidoJugador2);

      const textoBusqueda = `${j1.nombreCompleto} ${j2.nombreCompleto}`.toLowerCase();
      const coincideTexto = !termino || textoBusqueda.includes(termino);

      const estadoP = (p.estadoPago || "PENDIENTE").toUpperCase();
      const coincideEstado = filtroEstadoPago === "TODOS" || estadoP === filtroEstadoPago;

      const compId = getCompId(p);
      const coincideCategoria = filtroCategoria === "TODAS" || compId === filtroCategoria;

      return coincideTexto && coincideEstado && coincideCategoria;
    });
  }, [parejasDelTorneo, busquedaInscripto, filtroEstadoPago, filtroCategoria]);

  const handleEstadoPago = async (parejaId: string, estado: string) => {
    setProcesandoId(parejaId);
    try {
      if (onCambiarEstadoPago) await onCambiarEstadoPago(parejaId, estado);
    } finally {
      setProcesandoId(null);
    }
  };

  const handleEliminar = async (parejaId: string) => {
    if (!window.confirm("¿Seguro que querés eliminar esta inscripción?")) return;
    setProcesandoId(parejaId);
    try {
      if (onEliminarPareja) await onEliminarPareja(parejaId);
    } finally {
      setProcesandoId(null);
    }
  };

  const renderLista = () => {
    if (parejasFiltradas.length === 0) {
      return (
        <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800 space-y-2">
          <p className="text-xs text-slate-400 font-medium">No se encontraron inscripciones registradas.</p>
          <p className="text-[11px] text-slate-600">
            (Parejas recibidas: {parejas.length} | Filtradas para este torneo: {parejasDelTorneo.length})
          </p>
        </div>
      );
    }

    return parejasFiltradas.map((p) => {
      const compId = getCompId(p);
      const comp = competencias.find((c) => String(c.id) === compId);
      const cargando = procesandoId === p.id;
      const estadoActual = (p.estadoPago || "PENDIENTE").toUpperCase();

      const j1 = getJugadorData(p.jugador1, p.nombreJugador1, p.apellidoJugador1, p.telefonoJugador1 || p.telefono1);
      const j2 = getJugadorData(p.jugador2, p.nombreJugador2, p.apellidoJugador2);

      return (
        <div
          key={p.id}
          className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition hover:border-slate-600"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-700 text-slate-300 font-bold px-2 py-0.5 rounded-md">
                {comp?.nombre || (comp as any)?.categoriaId || "Categoría"}
              </span>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  estadoActual === "APROBADO"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : estadoActual === "RECHAZADO"
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}
              >
                {estadoActual}
              </span>
            </div>

            <p className="text-xs font-bold text-white">
              {j1.nombreCompleto} {" & "} {j2.nombreCompleto}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-400 font-mono">
              {j1.telefono && <span>📱 {j1.telefono}</span>}
              {p.comprobantePago && (
                <span className="text-amber-300">🧾 Comp: {p.comprobantePago}</span>
              )}
              {p.restriccionHoraria && (
                <span className="text-blue-300">⏰ {p.restriccionHoraria}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            {estadoActual !== "APROBADO" && (
              <button
                disabled={cargando}
                onClick={() => handleEstadoPago(p.id, "APROBADO")}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg text-[11px] transition cursor-pointer disabled:opacity-50"
              >
                ✓ Aprobar
              </button>
            )}
            {estadoActual !== "PENDIENTE" && (
              <button
                disabled={cargando}
                onClick={() => handleEstadoPago(p.id, "PENDIENTE")}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1 rounded-lg text-[11px] transition cursor-pointer disabled:opacity-50"
              >
                ⏳ Pendiente
              </button>
            )}
            {estadoActual !== "RECHAZADO" && (
              <button
                disabled={cargando}
                onClick={() => handleEstadoPago(p.id, "RECHAZADO")}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1 rounded-lg text-[11px] transition cursor-pointer disabled:opacity-50"
              >
                ✕ Rechazar
              </button>
            )}
            <button
              disabled={cargando}
              onClick={() => handleEliminar(p.id)}
              className="bg-rose-950 hover:bg-rose-900 text-rose-300 px-2.5 py-1 rounded-lg text-[11px] border border-rose-800 ml-1 transition cursor-pointer disabled:opacity-50"
            >
              🗑
            </button>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
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
            <option key={c.id} value={c.id}>
              {c.nombre || (c as any).categoriaId || c.id}
            </option>
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

      {/* Lista de Parejas */}
      <div className="space-y-2">{renderLista()}</div>
    </div>
  );
};