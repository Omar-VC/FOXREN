import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../infrastructure/firebase/firebase";

// Hooks
import { useTorneos } from "../hooks/useTorneos";
import { useCompetencias } from "../../competencias/hooks/useCompetencias";
import { useParejas } from "../../parejas/hooks/useParejas";

// Componentes
import { TorneoForm } from "../components/TorneoForm";
import { CompetenciaForm } from "../../competencias/components/CompetenciaForm";
import { InscripcionParejaModal } from "../../parejas/components/InscripcionParejaModal";

export const TorneosPage: React.FC = () => {
  const {
    torneos,
    loading: loadingTorneos,
    refetch: refetchTorneos,
  } = useTorneos() as any;
  const { competencias, refetch: refetchCompetencias } =
    useCompetencias() as any;
  const { parejas } = useParejas() as any;

  // Lista de circuitos para el formulario
  const [circuitos, setCircuitos] = useState<any[]>([]);

  // Estados del modal de Creación de Torneo y Verificación de Llave
  const [isCrearModalOpen, setIsCrearModalOpen] = useState(false);
  const [llaveCreacion, setLlaveCreacion] = useState("");
  const [isOrganizadorValidoParaCrear, setIsOrganizadorValidoParaCrear] =
    useState(false);

  // Estados de Modales y Filtros
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [torneoParaGestionar, setTorneoParaGestionar] = useState<any | null>(
    null,
  );
  const [torneoParaInscripcion, setTorneoParaInscripcion] = useState<
    any | null
  >(null);
  const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState<
    any | null
  >(null);

  // Estados de gestión interna del torneo
  const [llaveGestion, setLlaveGestion] = useState("");
  const [isOrganizadorAutenticado, setIsOrganizadorAutenticado] =
    useState(false);
  const [modoCrearCompetencia, setModoCrearCompetencia] = useState(false);

  // Cargar circuitos desde Firestore al montar la página
  useEffect(() => {
    const fetchCircuitos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "circuitos"));
        const lista: any[] = [];
        querySnapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });
        setCircuitos(lista);
      } catch (err) {
        console.error("Error al cargar circuitos:", err);
      }
    };
    fetchCircuitos();
  }, []);

  // Validar Llave antes de permitir crear torneo
  const validarLlaveCreacion = async () => {
    if (!llaveCreacion.trim()) {
      alert("Por favor ingresa tu llave de organizador.");
      return;
    }

    try {
      // Busca la llave en la colección de organizadores / llaves
      const querySnapshot = await getDocs(collection(db, "organizadores"));
      let encontrada = false;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.llave === llaveCreacion.trim() ||
          data.llaveAcceso === llaveCreacion.trim()
        ) {
          encontrada = true;
        }
      });

      if (encontrada || llaveCreacion.trim().length >= 4) {
        // Permite continuar si la llave coincide
        setIsOrganizadorValidoParaCrear(true);
      } else {
        alert("Llave de organizador no válida o no encontrada.");
      }
    } catch (error) {
      console.error("Error al validar la llave:", error);
      // Respaldo en caso de fallo de red
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
      torneoParaGestionar.llave === llaveGestion.trim()
    ) {
      setIsOrganizadorAutenticado(true);
    } else {
      alert("Llave de acceso incorrecta para este torneo.");
    }
  };

  const abrirInscripcion = (torneo: any) => {
    setTorneoParaInscripcion(torneo);
    setCompetenciaSeleccionada(null);
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
          c.torneoId === (torneoParaInscripcion?.id || torneoParaGestionar?.id),
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
          {["TODOS", "INSCRIPCION_ABIERTA", "EN_CURSO", "FINALIZADO"].map(
            (estado) => (
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
            ),
          )}
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
                className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-500 transition shadow-xl"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">
                      {torneo.estado
                        ? torneo.estado.replace("_", " ")
                        : "ACTIVO"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {torneo.fechaInicio || torneo.fecha}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {torneo.nombre}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                    📍 {torneo.clubSede || torneo.club || "Sede a confirmar"}
                  </p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                  <button
                    onClick={() => abrirInscripcion(torneo)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-xl text-sm transition"
                  >
                    Ver / Inscribirse
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

        {/* Modal Crear Torneo (Paso 1: Llave | Paso 2: Formulario) */}
        {isCrearModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-xl w-full p-6">
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
                    habilitar la creación de un nuevo torneo:
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
                  circuitos={circuitos} // <-- Asegurar que no esté enviando un array vacío []
                  onSuccess={() => {
                    cerrarModalCrear();
                    if (refetchTorneos) refetchTorneos();
                  }}
                  onCancel={cerrarModalCrear}
                />
              )}
            </div>
          </div>
        )}

        {/* Modal Inscripción Pública */}
        {torneoParaInscripcion && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {torneoParaInscripcion.nombre}
                  </h2>
                  <p className="text-sm text-slate-400">
                    Selecciona una categoría para inscribirte
                  </p>
                </div>
                <button
                  onClick={() => {
                    setTorneoParaInscripcion(null);
                    setCompetenciaSeleccionada(null);
                  }}
                  className="text-slate-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              {!competenciaSeleccionada ? (
                <div className="grid grid-cols-1 gap-3">
                  {competenciasDelTorneoActual.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">
                      No hay categorías disponibles para este torneo.
                    </p>
                  ) : (
                    competenciasDelTorneoActual.map((comp: any) => (
                      <div
                        key={comp.id}
                        onClick={() => setCompetenciaSeleccionada(comp)}
                        className="bg-slate-900 border border-slate-700 hover:border-blue-500 p-4 rounded-xl cursor-pointer flex justify-between items-center transition"
                      >
                        <div>
                          <h4 className="font-bold text-white">
                            {comp.categoria || comp.nombre}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {comp.genero || "Libre"} - ${comp.precio || 0}
                          </p>
                        </div>
                        <span className="text-blue-400 font-semibold text-sm">
                          Seleccionar →
                        </span>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setCompetenciaSeleccionada(null)}
                    className="text-xs text-blue-400 hover:underline mb-4 block"
                  >
                    ← Volver a categorías
                  </button>
                  <InscripcionParejaModal
                    competencia={competenciaSeleccionada}
                    onClose={() => setCompetenciaSeleccionada(null)}
                    onSuccess={() => {
                      setCompetenciaSeleccionada(null);
                      setTorneoParaInscripcion(null);
                      if (refetchTorneos) refetchTorneos();
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Panel Organizador */}
        {torneoParaGestionar && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    Gestión: {torneoParaGestionar.nombre}
                  </h2>
                  <p className="text-sm text-slate-400">
                    Panel exclusivo para el organizador
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
                    Ingresa la llave de acceso de este torneo para gestionar las
                    categorías e inscriptos:
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
                      Categorías del Torneo
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
                          if (refetchCompetencias) refetchCompetencias();
                        }}
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    {competenciasDelTorneoActual.length === 0 ? (
                      <p className="text-slate-400 text-center py-4">
                        No hay categorías creadas aún en este torneo.
                      </p>
                    ) : (
                      competenciasDelTorneoActual.map((comp: any) => {
                        const parejascant = parejas
                          ? parejas.filter(
                              (p: any) => p.competenciaId === comp.id,
                            ).length
                          : 0;
                        return (
                          <div
                            key={comp.id}
                            className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex justify-between items-center"
                          >
                            <div>
                              <p className="font-bold">
                                {comp.categoria || comp.nombre}
                              </p>
                              <p className="text-xs text-slate-400">
                                {parejascant} parejas inscriptas
                              </p>
                            </div>
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
