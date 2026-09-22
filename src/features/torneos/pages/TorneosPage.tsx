import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// 1. Agregamos updateDoc y deleteDoc a las importaciones de Firestore
import { doc, getDoc, getDocs, collection, query, where, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../infrastructure/firebase/firebase";
import type { Torneo } from "../../../domain/torneo/torneo.types";

// Custom Hook
import { useTorneosRealtime } from "../hooks/useTorneosRealtime";

// Componentes Modularizados
import { TorneoCard } from "../components/TorneoCard";
import { TorneoForm } from "../components/TorneoForm";
import { TorneoDetalleModal } from "../components/TorneoDetalleModal";
import { InscripcionParejaModal } from "../../parejas/components/InscripcionParejaModal";
import { IngresoLlaveModal } from "../components/IngresoLlaveModal";
import { TorneoGestionPanel } from "../components/TorneoGestionPanel";

export const TorneosPage: React.FC = () => {
  const navigate = useNavigate();
  const { torneos, competencias, circuitos, parejas, loading } = useTorneosRealtime();

  // Modales y Estados de Autenticación
  const [isCrearModalOpen, setIsCrearModalOpen] = useState(false);
  const [isOrganizadorValidoParaCrear, setIsOrganizadorValidoParaCrear] = useState(false);
  const [llaveCreacion, setLlaveCreacion] = useState("");

  const [organizadorLogueado, setOrganizadorLogueado] = useState<{
    id: string;
    telefono: string;
    nombreCompleto?: string;
  } | null>(null);

  const [torneoSeleccionado, setTorneoSeleccionado] = useState<Torneo | null>(null);
  const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState<any | null>(null);
  const [torneoParaGestionar, setTorneoParaGestionar] = useState<any | null>(null);
  const [isOrganizadorAutenticado, setIsOrganizadorAutenticado] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");

  // 2. Handlers para actualizar y eliminar parejas en Firestore
  const handleCambiarEstadoPago = async (
    parejaId: string,
    nuevoEstado: "APROBADO" | "RECHAZADO" | "PENDIENTE"
  ) => {
    try {
      const parejaRef = doc(db, "parejas", parejaId);
      await updateDoc(parejaRef, {
        estadoPago: nuevoEstado,
      });
    } catch (error) {
      console.error("Error al actualizar estado de pago:", error);
      alert("No se pudo actualizar el estado de pago.");
    }
  };

  const handleEliminarPareja = async (parejaId: string) => {
    try {
      const parejaRef = doc(db, "parejas", parejaId);
      await deleteDoc(parejaRef);
    } catch (error) {
      console.error("Error al eliminar la pareja:", error);
      alert("No se pudo eliminar la pareja.");
    }
  };

  // Validación de Llave
  const validarLlaveCreacion = async (llaveIngresada: string) => {
    const codigoLimpio = llaveIngresada.trim();

    if (!codigoLimpio) {
      alert("Por favor ingresa una llave.");
      return;
    }

    try {
      const qLlave = query(
        collection(db, "llaves_organizadores"),
        where("codigo", "==", codigoLimpio)
      );
      const snapLlave = await getDocs(qLlave);

      if (snapLlave.empty) {
        alert("La llave ingresada no existe.");
        return;
      }

      const llaveDoc = snapLlave.docs[0];
      const llaveData = llaveDoc.data();

      if (llaveData.estado && llaveData.estado !== "activa") {
        alert("Esta llave de organizador ya no se encuentra activa.");
        return;
      }

      const organizadorId = llaveData.organizadorId;
      let telefonoOrganizador = "";
      let nombreOrganizador = llaveData.nombreOrganizador || "";

      if (organizadorId) {
        try {
          const orgRef = doc(db, "organizadores", organizadorId);
          const orgSnap = await getDoc(orgRef);

          if (orgSnap.exists()) {
            const orgData = orgSnap.data();
            telefonoOrganizador =
              orgData.telefono ||
              orgData.celular ||
              orgData.contacto ||
              "";

            if (!nombreOrganizador) {
              nombreOrganizador = orgData.nombreCompleto || "";
            }
          }
        } catch (errOrg) {
          console.warn("No se pudieron consultar los detalles extras del organizador:", errOrg);
        }
      }

      setLlaveCreacion(codigoLimpio);
      setOrganizadorLogueado({
        id: organizadorId || llaveDoc.id,
        telefono: telefonoOrganizador,
        nombreCompleto: nombreOrganizador,
      });
      setIsOrganizadorValidoParaCrear(true);

    } catch (err) {
      console.error("Error al validar la llave de organizador:", err);
      alert("Ocurrió un error al verificar la llave.");
    }
  };

  const torneosFiltrados = torneos.filter((t) =>
    filtroEstado === "TODOS" ? true : t.estado === filtroEstado
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
          className="bg-green-500 hover:bg-green-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-lg shadow-green-500/20 cursor-pointer"
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
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
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
            <TorneoCard
              key={t.id}
              torneo={t}
              competencias={competencias}
              onVerDetalles={(torneo) => setTorneoSeleccionado(torneo)}
              onVerTorneo={(torneo) => navigate(`/torneos/${torneo.id}`)}
              onGestionar={(torneo) => setTorneoParaGestionar(torneo)}
            />
          ))}
        </div>
      )}

      {/* Modales */}
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
              organizadorId={organizadorLogueado?.id}
              organizadorContacto={organizadorLogueado?.telefono}
              onSuccess={() => {
                setIsCrearModalOpen(false);
                setIsOrganizadorValidoParaCrear(false);
                setOrganizadorLogueado(null);
              }}
              onCancel={() => {
                setIsCrearModalOpen(false);
                setIsOrganizadorValidoParaCrear(false);
                setOrganizadorLogueado(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal interactivo de Detalles e Inscripción */}
      {torneoSeleccionado && (
        <TorneoDetalleModal
          torneo={torneoSeleccionado}
          competencias={competencias.filter(
            (c: any) => c.torneoId === torneoSeleccionado.id
          )}
          onClose={() => setTorneoSeleccionado(null)}
          onInscribirCompetencia={(comp: any) => {
            setCompetenciaSeleccionada({
              ...comp,
              aliasPago:
                torneoSeleccionado.datosPago?.alias ||
                torneoSeleccionado.aliasPago ||
                torneoSeleccionado.alias,
              torneoNombre: torneoSeleccionado.nombre,
            });
            setTorneoSeleccionado(null);
          }}
        />
      )}

      {competenciaSeleccionada && (
        <InscripcionParejaModal
          competencia={{
            ...competenciaSeleccionada,
            aliasPago:
              competenciaSeleccionada.aliasPago ||
              torneos.find((t) => t.id === competenciaSeleccionada.torneoId)?.datosPago?.alias ||
              torneos.find((t) => t.id === competenciaSeleccionada.torneoId)?.aliasPago ||
              torneos.find((t) => t.id === competenciaSeleccionada.torneoId)?.alias,
          }}
          onClose={() => setCompetenciaSeleccionada(null)}
          onSuccess={() => {
            setCompetenciaSeleccionada(null);
          }}
        />
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

      {/* 3. Pasamos los nuevos handlers a TorneoGestionPanel */}
      {torneoParaGestionar && isOrganizadorAutenticado && (
        <TorneoGestionPanel
          torneo={torneoParaGestionar}
          competencias={competencias}
          parejas={parejas}
          onClose={() => {
            setTorneoParaGestionar(null);
            setIsOrganizadorAutenticado(false);
          }}
          onCambiarEstadoPago={handleCambiarEstadoPago}
          onEliminarPareja={handleEliminarPareja}
        />
      )}
    </div>
  );
};