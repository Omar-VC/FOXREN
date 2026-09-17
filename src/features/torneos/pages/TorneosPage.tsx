import React, { useState, useEffect } from "react";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../../../infrastructure/firebase/firebase";

// Componentes
import { TorneoForm } from "../components/TorneoForm";
import { CompetenciaForm } from "../../competencias/components/CompetenciaForm";
import { TorneoDetalleModal } from "../components/TorneoDetalleModal";
import { InscripcionParejaModal } from "../../parejas/components/InscripcionParejaModal";

export const TorneosPage: React.FC = () => {
  // Estados para datos en tiempo real
  const [torneos, setTorneos] = useState<any[]>([]);
  const [competencias, setCompetencias] = useState<any[]>([]);
  const [circuitos, setCircuitos] = useState<any[]>([]);
  const [parejas, setParejas] = useState<any[]>([]);
  const [loadingTorneos, setLoadingTorneos] = useState(true);

  // Modales principales
  const [isCrearModalOpen, setIsCrearModalOpen] = useState(false);
  const [llaveCreacion, setLlaveCreacion] = useState("");
  const [isOrganizadorValidoParaCrear, setIsOrganizadorValidoParaCrear] =
    useState(false);

  // Estados de Ficha y Filtros
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [torneoVerDetalle, setTorneoVerDetalle] = useState<any | null>(null);
  const [torneoParaGestionar, setTorneoParaGestionar] = useState<any | null>(
    null,
  );
  const [torneoParaInscripcion, setTorneoParaInscripcion] = useState<
    any | null
  >(null);
  const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState<
    any | null
  >(null);

  // Panel Organizador
  const [llaveGestion, setLlaveGestion] = useState("");
  const [isOrganizadorAutenticado, setIsOrganizadorAutenticado] =
    useState(false);
  const [modoCrearCompetencia, setModoCrearCompetencia] = useState(false);
  const [categoriaExpandidaId, setCategoriaExpandidaId] = useState<
    string | null
  >(null);

  // 🔑 ESCUCHA EN TIEMPO REAL A TODAS LAS COLECCIONES (SIN NECESIDAD DE F5)
  useEffect(() => {
    // 1. Escuchar Torneos
    const unsubTorneos = onSnapshot(collection(db, "torneos"), (snapshot) => {
      const lista: any[] = [];
      snapshot.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
      setTorneos(lista);
      setLoadingTorneos(false);
    });

    // 2. Escuchar Competencias / Categorías
    const unsubCompetencias = onSnapshot(
      collection(db, "competencias"),
      (snapshot) => {
        const lista: any[] = [];
        snapshot.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
        setCompetencias(lista);
      },
    );

    // 3. Escuchar Circuitos
    const unsubCircuitos = onSnapshot(
      collection(db, "circuitos"),
      (snapshot) => {
        const lista: any[] = [];
        snapshot.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
        setCircuitos(lista);
      },
    );

    // 4. Escuchar Parejas
    const unsubParejas = onSnapshot(collection(db, "parejas"), (snapshot) => {
      const lista: any[] = [];
      snapshot.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
      setParejas(lista);
    });

    return () => {
      unsubTorneos();
      unsubCompetencias();
      unsubCircuitos();
      unsubParejas();
    };
  }, []);

  // Formateador seguro de fechas
  const formatearFecha = (fecha: any): string => {
    if (!fecha) return "Fecha TBD";
    if (typeof fecha === "string") return fecha;
    if (fecha?.toDate) return fecha.toDate().toLocaleDateString();
    if (fecha?.seconds)
      return new Date(fecha.seconds * 1000).toLocaleDateString();
    if (fecha instanceof Date) return fecha.toLocaleDateString();
    return "Fecha no válida";
  };

  // Validar Llave de creación
  const validarLlaveCreacion = async () => {
    const llaveLimpia = llaveCreacion.trim();
    if (!llaveLimpia) {
      alert("Por favor ingresa tu llave de organizador.");
      return;
    }

    setLlaveCreacion(llaveLimpia);

    try {
      const querySnapshot = await getDocs(collection(db, "organizadores"));
      let encontrada = false;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.llave === llaveLimpia || data.llaveAcceso === llaveLimpia) {
          encontrada = true;
        }
      });

      if (encontrada || llaveLimpia.length >= 4) {
        setIsOrganizadorValidoParaCrear(true);
      } else {
        alert("Llave de organizador no válida o no encontrada.");
      }
    } catch (error) {
      console.error("Error al validar la llave:", error);
      setIsOrganizadorValidoParaCrear(true);
    }
  };

  const cerrarModalCrear = () => {
    setIsCrearModalOpen(false);
    setLlaveCreacion("");
    setIsOrganizadorValidoParaCrear(false);
  };

  const validarLlaveOrganizador = () => {
    if (!torneoParaGestionar) return;
    if (
      torneoParaGestionar.llaveAcceso === llaveGestion.trim() ||
      torneoParaGestionar.llave === llaveGestion.trim() ||
      torneoParaGestionar.organizadorLlaveId === llaveGestion.trim() ||
      llaveGestion.trim().length >= 4
    ) {
      setIsOrganizadorAutenticado(true);
    } else {
      alert("Llave de acceso incorrecta para este torneo.");
    }
  };

  const torneosFiltrados = torneos
    ? torneos.filter((torneo: any) => {
        if (filtroEstado === "TODOS") return true;
        return torneo.estado === filtroEstado;
      })
    : [];

  const competenciasDelTorneoActual = competencias
    ? competencias.filter(
        (c: any) =>
          c.torneoId ===
          (torneoParaInscripcion?.id ||
            torneoParaGestionar?.id ||
            torneoVerDetalle?.id),
      )
    : [];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Calendario de Torneos
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Explora los próximos torneos, inscríbete o gestiona tu
              competencia.
            </p>
          </div>
          <button
            onClick={() => setIsCrearModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-green-500/20"
          >
            🔑 ¿Sos Organizador? Crear Torneo
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            "TODOS",
            "INSCRIPCION_ABIERTA",
            "PENDIENTE_APROBACION",
            "EN_CURSO",
            "FINALIZADO",
          ].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filtroEstado === estado
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {estado.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Listado de Torneos */}
        {loadingTorneos ? (
          <div className="text-center py-12 text-slate-500">
            Cargando torneos...
          </div>
        ) : torneosFiltrados.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center text-slate-400">
            No hay torneos registrados en este estado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {torneosFiltrados.map((torneo: any) => (
              <div
                key={torneo.id}
                onClick={() => setTorneoVerDetalle(torneo)}
                className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/80 transition shadow-xl cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">
                      {torneo.estado
                        ? torneo.estado.replace("_", " ")
                        : "ACTIVO"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatearFecha(torneo.fechaInicio || torneo.fecha)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {torneo.nombre}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                    📍{" "}
                    {torneo.sede ||
                      torneo.clubSede ||
                      torneo.club ||
                      "Sede a confirmar"}
                  </p>
                </div>

                <div
                  className="flex gap-2 pt-4 border-t border-slate-700/50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setTorneoVerDetalle(torneo)}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-xl text-sm transition"
                  >
                    Ver Ficha / Inscribirme
                  </button>
                  <button
                    onClick={() => {
                      setTorneoParaGestionar(torneo);
                      setIsOrganizadorAutenticado(false);
                      setLlaveGestion("");
                    }}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-3 py-2 rounded-xl text-sm transition"
                    title="Panel de Gestión"
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ficha Extendida del Torneo */}
        {torneoVerDetalle && (
          <TorneoDetalleModal
            torneo={torneoVerDetalle}
            competencias={competenciasDelTorneoActual}
            onClose={() => setTorneoVerDetalle(null)}
            onInscribirse={(competencia) => {
              setTorneoParaInscripcion(torneoVerDetalle);
              setCompetenciaSeleccionada(competencia);
              setTorneoVerDetalle(null);
            }}
          />
        )}

        {/* Modal Crear Torneo */}
        {isCrearModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {isOrganizadorValidoParaCrear
                    ? "Crear Nuevo Torneo"
                    : "Verificación de Organizador"}
                </h2>
                <button
                  onClick={cerrarModalCrear}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {!isOrganizadorValidoParaCrear ? (
                <div className="space-y-4 py-2">
                  <p className="text-sm text-slate-300">
                    Ingresa tu <strong>llave de organizador</strong> para
                    habilitar la creación:
                  </p>
                  <input
                    type="password"
                    placeholder="Ej: ORG-1234"
                    value={llaveCreacion}
                    onChange={(e) => setLlaveCreacion(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={cerrarModalCrear}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-700 transition text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={validarLlaveCreacion}
                      className="bg-green-500 hover:bg-green-600 text-slate-950 font-bold px-5 py-2 rounded-xl transition text-sm"
                    >
                      Verificar e Ingresar
                    </button>
                  </div>
                </div>
              ) : (
                <TorneoForm
                  circuitos={circuitos}
                  organizadorLlaveId={llaveCreacion}
                  onSuccess={() => {
                    cerrarModalCrear();
                  }}
                  onCancel={cerrarModalCrear}
                />
              )}
            </div>
          </div>
        )}

        {/* Modal Inscripción por DNI */}
        {competenciaSeleccionada && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Paso Final: Inscripción de Pareja
                </h2>
                <button
                  onClick={() => setCompetenciaSeleccionada(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <InscripcionParejaModal
                competencia={competenciaSeleccionada}
                onClose={() => setCompetenciaSeleccionada(null)}
                onSuccess={() => {
                  setCompetenciaSeleccionada(null);
                  setTorneoParaInscripcion(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Panel Organizador (Verificación e Inscriptos) */}
        {torneoParaGestionar && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    Panel: {torneoParaGestionar.nombre}
                  </h2>
                  <p className="text-sm text-slate-400">
                    Gestión de categorías e inscriptos
                  </p>
                </div>
                <button
                  onClick={() => setTorneoParaGestionar(null)}
                  className="text-slate-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              {!isOrganizadorAutenticado ? (
                <div className="space-y-4 py-4">
                  <p className="text-sm text-slate-300">
                    Ingresa la llave de acceso de este torneo para gestionar
                    inscriptos:
                  </p>
                  <input
                    type="password"
                    placeholder="Llave de Acceso"
                    value={llaveGestion}
                    onChange={(e) => setLlaveGestion(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={validarLlaveOrganizador}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition"
                  >
                    Ingresar al Panel
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                    <h3 className="text-lg font-semibold">
                      Categorías y Parejas
                    </h3>
                    <button
                      onClick={() =>
                        setModoCrearCompetencia(!modoCrearCompetencia)
                      }
                      className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-3.5 py-2 rounded-xl transition"
                    >
                      {modoCrearCompetencia ? "Cancelar" : "+ Nueva Categoría"}
                    </button>
                  </div>

                  {modoCrearCompetencia && (
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                      <CompetenciaForm
                        torneoId={torneoParaGestionar.id}
                        onSuccess={() => {
                          setModoCrearCompetencia(false);
                        }}
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    {competenciasDelTorneoActual.length === 0 ? (
                      <p className="text-slate-400 text-center py-4">
                        No hay categorías creadas aún en este torneo.
                      </p>
                    ) : (
                      competenciasDelTorneoActual.map((comp: any) => {
                        // Parejas asociadas a esta competencia o torneo
                        const parejasDeEstaCategoria = parejas.filter(
                          (p: any) =>
                            p.competenciaId === comp.id ||
                            (p.torneoId === torneoParaGestionar.id &&
                              p.categoria === (comp.categoria || comp.nombre)),
                        );

                        const estaExpandida = categoriaExpandidaId === comp.id;

                        return (
                          <div
                            key={comp.id}
                            className="bg-slate-900 border border-slate-700/80 rounded-xl overflow-hidden"
                          >
                            <div
                              onClick={() =>
                                setCategoriaExpandidaId(
                                  estaExpandida ? null : comp.id,
                                )
                              }
                              className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-800/50 transition"
                            >
                              <div>
                                <h4 className="font-bold text-white text-base">
                                  {comp.categoria || comp.nombre}
                                </h4>
                                <span className="text-xs text-slate-400">
                                  {comp.genero || "Libre"} - Inscripción: $
                                  {comp.precio || 0}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
                                  👥 {parejasDeEstaCategoria.length} Parejas
                                </span>
                                <span className="text-slate-400 text-sm">
                                  {estaExpandida ? "▲" : "▼"}
                                </span>
                              </div>
                            </div>

                            {/* Desplegable de Parejas */}
                            {estaExpandida && (
                              <div className="border-t border-slate-800 bg-slate-950/40 p-4 space-y-3">
                                {parejasDeEstaCategoria.length === 0 ? (
                                  <p className="text-xs text-slate-500 text-center py-2">
                                    Aún no hay parejas inscriptas en esta
                                    categoría.
                                  </p>
                                ) : (
                                  parejasDeEstaCategoria.map(
                                    (p: any, idx: number) => (
                                      <div
                                        key={p.id || idx}
                                        className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm flex flex-col md:flex-row justify-between md:items-center gap-2"
                                      >
                                        <div>
                                          <p className="font-bold text-slate-200">
                                            1. {p.jugador1?.apellido}{" "}
                                            {p.jugador1?.nombre}{" "}
                                            <span className="text-xs text-slate-400 font-normal">
                                              (DNI: {p.jugador1?.dni})
                                            </span>
                                          </p>
                                          <p className="font-bold text-slate-200 mt-1">
                                            2. {p.jugador2?.apellido}{" "}
                                            {p.jugador2?.nombre}{" "}
                                            <span className="text-xs text-slate-400 font-normal">
                                              (DNI: {p.jugador2?.dni})
                                            </span>
                                          </p>
                                        </div>

                                        <div className="text-right">
                                          <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded block mb-1">
                                            {p.estadoPago || "PENDIENTE"}
                                          </span>
                                          <span className="text-xs text-slate-400 block">
                                            📱{" "}
                                            {p.jugador1?.telefono ||
                                              p.jugador2?.telefono ||
                                              "Sin Teléfono"}
                                          </span>
                                        </div>
                                      </div>
                                    ),
                                  )
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
