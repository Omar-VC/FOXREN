// src/features/admin/pages/AdminDashboard.tsx

import React, { useState } from "react";
import { db } from "../../../infrastructure/firebase/firebase";
import { updateDoc, doc } from "firebase/firestore";
import { useJugadores } from "../../jugadores/hooks/useJugadores";
import {
  aprobarSolicitudJugador,
  rechazarSolicitudJugador,
  cambiarEstadoJugador,
} from "../services/adminHelpers";

export const AdminDashboard: React.FC = () => {
  // NOTA: Asegúrate de ajustar useJugadores o un useSolicitudes para traer la colección solicitudesRegistro
  const { jugadores: pendientes, loading: loadingPendientes } =
    useJugadores("pendiente");
  const { jugadores: activos, loading: loadingActivos } =
    useJugadores("activo");

  const [seccionActiva, setSeccionActiva] = useState<
    "solicitudes" | "jugadores"
  >("solicitudes");
  const [searchTerm, setSearchTerm] = useState("");
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});

  // Estado para la categoría que asigna el Admin en cada solicitud
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<{
    [key: string]: string;
  }>({});

  const handleAprobar = async (solicitud: any) => {
  // 1. Averigua qué categoría declaró o qué nivel inicial tiene
  const catDeclarada = (solicitud.categoriaDeclarada || solicitud.nivelInicial || "OCTAVA").toUpperCase();

  // 2. Si vos la cambiaste manualmente en el select usa esa; si no tocó nada, usa la declarada por la persona
  const catOficial = categoriaSeleccionada[solicitud.id] || catDeclarada;

  try {
    await aprobarSolicitudJugador(solicitud, catOficial);
    alert(
      `Jugador ${solicitud.nombre} ${solicitud.apellido} aprobado con éxito en categoría ${catOficial}.`
    );
  } catch (error) {
    console.error(error);
    alert("Error al aprobar la solicitud.");
  }
};

  const handleRechazar = async (id: string) => {
    if (confirm("¿Deseas rechazar esta solicitud de registro?")) {
      try {
        await rechazarSolicitudJugador(id);
      } catch (error) {
        console.error(error);
        alert("Error al rechazar la solicitud.");
      }
    }
  };

  const handleCambiarEstado = async (
    id: string,
    nuevoEstado: "activo" | "inactivo",
  ) => {
    const accion = nuevoEstado === "inactivo" ? "desactivar" : "activar";
    if (confirm(`¿Seguro que deseas ${accion} a este jugador?`)) {
      try {
        await cambiarEstadoJugador(id, nuevoEstado);
      } catch (error) {
        console.error(error);
        alert("Error al cambiar el estado del jugador.");
      }
    }
  };

  const guardarCambios = async () => {
    if (!jugadorSeleccionado) return;
    try {
      await updateDoc(doc(db, "jugadores", jugadorSeleccionado.id), editData);
      alert("Cambios guardados correctamente.");
      setJugadorSeleccionado(null);
    } catch (error) {
      console.error(error);
      alert("Error al guardar cambios.");
    }
  };

  if (loadingPendientes || loadingActivos)
    return <p className="text-white p-6">Cargando dashboard...</p>;

  const jugadoresFiltrados = activos.filter(
    (j) =>
      j.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.dni.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Panel lateral */}
      <aside className="w-64 bg-gray-800 p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-6">Administración FOXREN</h2>
        <nav className="flex flex-col space-y-2">
          <button
            onClick={() => setSeccionActiva("solicitudes")}
            className={`text-left px-3 py-2 rounded flex justify-between items-center ${
              seccionActiva === "solicitudes"
                ? "bg-gray-700 font-semibold"
                : "hover:bg-gray-700"
            }`}
          >
            <span>Solicitudes</span>
            {pendientes.length > 0 && (
              <span className="bg-red-600 text-xs px-2 py-0.5 rounded-full text-white font-bold">
                {pendientes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSeccionActiva("jugadores")}
            className={`text-left px-3 py-2 rounded ${
              seccionActiva === "jugadores"
                ? "bg-gray-700 font-semibold"
                : "hover:bg-gray-700"
            }`}
          >
            Lista oficial
          </button>
        </nav>
      </aside>

      {/* Área principal */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* SECCIÓN 1: SOLICITUDES PENDIENTES */}
        {seccionActiva === "solicitudes" && (
          <>
            <h1 className="text-2xl font-bold mb-4">
              Solicitudes de Registro Pendientes
            </h1>
            {pendientes.length === 0 ? (
              <p className="text-gray-400">
                No hay solicitudes pendientes de aprobación.
              </p>
            ) : (
              <ul className="space-y-3">
                {pendientes.map((sol) => (
                  <li
                    key={sol.id}
                    className="bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">
                        {sol.nombre} {sol.apellido}{" "}
                        {sol.apodo ? `("${sol.apodo}")` : ""}
                      </span>
                      <span className="text-sm text-gray-300">
                        DNI: {sol.dni} | Ciudad: {sol.ciudad} | Lado:{" "}
                        {sol.ladoJuego}
                      </span>
                      <span className="text-sm text-yellow-400">
                        Nivel / Cat. declarada:{" "}
                        {sol.nivelInicial ||
                          sol.categoriaDeclarada ||
                          "No especificado"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-400 mb-1">
                          Cat. Oficial FOXREN
                        </label>
                        <select
                          className="bg-gray-700 text-white px-2 py-1 rounded text-sm border border-gray-600 focus:outline-none"
                          // Toma la categoría seleccionada o, por defecto, la categoría declarada/nivel del jugador (en mayúsculas)
                          value={
                            categoriaSeleccionada[sol.id] ||
                            (
                              sol.categoriaDeclarada ||
                              sol.nivelInicial ||
                              "OCTAVA"
                            ).toUpperCase()
                          }
                          onChange={(e) =>
                            setCategoriaSeleccionada({
                              ...categoriaSeleccionada,
                              [sol.id]: e.target.value,
                            })
                          }
                        >
                          <option value="PRIMERA">Primera</option>
                          <option value="SEGUNDA">Segunda</option>
                          <option value="TERCERA">Tercera</option>
                          <option value="CUARTA">Cuarta</option>
                          <option value="QUINTA">Quinta</option>
                          <option value="SEXTA">Sexta</option>
                          <option value="SEPTIMA">Séptima</option>
                          <option value="OCTAVA">Octava</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handleAprobar(sol)}
                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded font-medium text-sm transition"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleRechazar(sol.id)}
                        className="bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded font-medium text-sm transition"
                      >
                        Rechazar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* SECCIÓN 2: JUGADORES OFICIALES */}
        {seccionActiva === "jugadores" && !jugadorSeleccionado && (
          <>
            <h1 className="text-2xl font-bold mb-4">
              Lista Oficial de Jugadores
            </h1>
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none"
            />
            <ul className="space-y-2">
              {jugadoresFiltrados.map((j) => (
                <li
                  key={j.id}
                  className="bg-gray-800 p-3 rounded flex justify-between items-center border border-gray-700"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {j.nombre} {j.apellido} - DNI {j.dni}
                    </span>
                    <span className="text-sm text-gray-400">
                      Categoría oficial:{" "}
                      <strong className="text-blue-400">
                        {j.categoriaId || "Sin categoría"}
                      </strong>{" "}
                      | Estado: {j.estado}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setJugadorSeleccionado(j);
                        setEditData(j);
                      }}
                      className="bg-blue-600 px-3 py-1 rounded hover:opacity-80 text-sm"
                    >
                      Ver ficha
                    </button>
                    <button
                      onClick={() =>
                        handleCambiarEstado(
                          j.id,
                          j.estado === "activo" ? "inactivo" : "activo",
                        )
                      }
                      className={`${
                        j.estado === "activo"
                          ? "bg-amber-600 hover:bg-amber-500"
                          : "bg-green-600 hover:bg-green-500"
                      } px-3 py-1 rounded text-sm transition`}
                    >
                      {j.estado === "activo" ? "Inactivar" : "Activar"}
                    </button>
                  </div>
                </li>
              ))}
              {jugadoresFiltrados.length === 0 && (
                <p className="text-gray-400">
                  No se encontraron jugadores que coincidan con la búsqueda.
                </p>
              )}
            </ul>
          </>
        )}

        {/* FICHA EDITABLE DE JUGADOR */}
        {jugadorSeleccionado && (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4">
              Ficha de {jugadorSeleccionado.nombre}{" "}
              {jugadorSeleccionado.apellido}
            </h2>
            <div className="space-y-3 max-w-lg">
              {Object.keys(editData).map((campo) => {
                if (campo === "id" || campo === "fechaRegistro") return null;
                return (
                  <div key={campo} className="flex flex-col">
                    <label className="text-xs text-gray-400 font-semibold uppercase">
                      {campo}
                    </label>
                    <input
                      type="text"
                      value={editData[campo] || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, [campo]: e.target.value })
                      }
                      className="px-3 py-1.5 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none text-sm"
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex space-x-2 mt-6">
              <button
                onClick={guardarCambios}
                className="bg-green-600 px-4 py-2 rounded hover:opacity-80 font-medium"
              >
                Guardar cambios
              </button>
              <button
                onClick={() => setJugadorSeleccionado(null)}
                className="bg-gray-600 px-4 py-2 rounded hover:opacity-80 font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
