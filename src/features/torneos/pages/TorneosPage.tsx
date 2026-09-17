import React, { useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../../infrastructure/firebase/firebase";

// Custom Hook
import { useTorneosRealtime } from "../hooks/useTorneosRealtime";

// Componentes Modularizados
import { TorneoForm } from "../components/TorneoForm";
import { TorneoDetalleModal } from "../components/TorneoDetalleModal";
import { InscripcionParejaModal } from "../../parejas/components/InscripcionParejaModal";
import { IngresoLlaveModal } from "../components/IngresoLlaveModal";
import { TorneoGestionPanel } from "../components/TorneoGestionPanel";

export const TorneosPage: React.FC = () => {
  const { torneos, competencias, circuitos, parejas, loading } =
    useTorneosRealtime();

  // Modales
  const [isCrearModalOpen, setIsCrearModalOpen] = useState(false);
  const [isOrganizadorValidoParaCrear, setIsOrganizadorValidoParaCrear] =
    useState(false);
  const [llaveCreacion, setLlaveCreacion] = useState("");

  const [torneoVerDetalle, setTorneoVerDetalle] = useState<any | null>(null);

  const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState<
    any | null
  >(null);

  const [torneoParaGestionar, setTorneoParaGestionar] = useState<any | null>(
    null,
  );
  const [isOrganizadorAutenticado, setIsOrganizadorAutenticado] =
    useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");

  const validarLlaveCreacion = async (llave: string) => {
    try {
      const snap = await getDocs(collection(db, "organizadores"));
      let encontrada = false;
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.llave === llave || data.llaveAcceso === llave)
          encontrada = true;
      });

      if (encontrada || llave.length >= 4) {
        setLlaveCreacion(llave);
        setIsOrganizadorValidoParaCrear(true);
      } else {
        alert("Llave de organizador no válida.");
      }
    } catch (err) {
      setIsOrganizadorValidoParaCrear(true);
    }
  };

  const torneosFiltrados = torneos.filter((t) =>
    filtroEstado === "TODOS" ? true : t.estado === filtroEstado,
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-400 tracking-tight">
            Torneos Foxren
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Explora, inscribe a tu pareja o gestiona tu competencia
          </p>
        </div>

        <button
          onClick={() => setIsCrearModalOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-lg shadow-green-500/20"
        >
          ➕ Crear Nuevo Torneo
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          "TODOS",
          "INSCRIPCION_ABIERTA",
          "PENDIENTE_APROBACION",
          "FINALIZADO",
        ].map((est) => (
          <button
            key={est}
            onClick={() => setFiltroEstado(est)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filtroEstado === est
                ? "bg-blue-600 text-white"
                : "bg-slate-900 text-slate-400 border border-slate-800"
            }`}
          >
            {est.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Grid de Torneos */}
      {loading ? (
        <p className="text-center text-slate-500 py-12 text-sm">
          Cargando torneos...
        </p>
      ) : torneosFiltrados.length === 0 ? (
        <p className="text-center text-slate-500 py-12 text-sm">
          No hay torneos registrados en esta categoría.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {torneosFiltrados.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                  {t.estado || "INSCRIPCION_ABIERTA"}
                </span>
                <span className="text-xs text-slate-400">📍 {t.sede}</span>
              </div>

              <h3 className="text-xl font-bold mb-1">{t.nombre}</h3>

              <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-800/80 gap-2">
                <button
                  onClick={() => setTorneoVerDetalle(t)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs transition"
                >
                  🔍 Ver Ficha
                </button>
                <button
                  onClick={() => setTorneoParaGestionar(t)}
                  className="bg-slate-800/80 hover:bg-slate-700 text-blue-400 px-3 py-1.5 rounded-xl text-xs transition"
                >
                  ⚙️ Gestionar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALES */}
      {isCrearModalOpen && !isOrganizadorValidoParaCrear && (
        <IngresoLlaveModal
          titulo="Validación de Organizador"
          subtitulo="Ingresa tu llave autorizada para crear torneos"
          onValidar={validarLlaveCreacion}
          onClose={() => setIsCrearModalOpen(false)}
        />
      )}

      {isCrearModalOpen && isOrganizadorValidoParaCrear && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-white max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Torneo</h2>
            <TorneoForm
              circuitos={circuitos}
              organizadorLlaveId={llaveCreacion}
              onSuccess={() => {
                setIsCrearModalOpen(false);
                setIsOrganizadorValidoParaCrear(false);
              }}
              onCancel={() => {
                setIsCrearModalOpen(false);
                setIsOrganizadorValidoParaCrear(false);
              }}
            />
          </div>
        </div>
      )}

      {torneoVerDetalle && (
        <TorneoDetalleModal
          torneo={torneoVerDetalle}
          competencias={competencias.filter(
            (c) => c.torneoId === torneoVerDetalle.id,
          )}
          onClose={() => setTorneoVerDetalle(null)}
          onInscribirse={(comp) => {
            setCompetenciaSeleccionada(comp);
            setTorneoVerDetalle(null);
          }}
        />
      )}

      {competenciaSeleccionada && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-lg w-full">
            <InscripcionParejaModal
              competencia={competenciaSeleccionada}
              onClose={() => setCompetenciaSeleccionada(null)}
              onSuccess={() => {
                setCompetenciaSeleccionada(null);
              }}
            />
          </div>
        </div>
      )}

      {torneoParaGestionar && !isOrganizadorAutenticado && (
        <IngresoLlaveModal
          titulo="Gestionar Torneo"
          subtitulo={`Ingresa la llave de organizador para ${torneoParaGestionar.nombre}`}
          onValidar={(llave) => {
            if (llave.length >= 4) setIsOrganizadorAutenticado(true);
            else alert("Llave incorrecta.");
          }}
          onClose={() => setTorneoParaGestionar(null)}
        />
      )}

      {torneoParaGestionar && isOrganizadorAutenticado && (
        <TorneoGestionPanel
          torneo={torneoParaGestionar}
          competencias={competencias}
          parejas={parejas}
          onClose={() => {
            setTorneoParaGestionar(null);
            setIsOrganizadorAutenticado(false);
          }}
        />
      )}
    </div>
  );
};
