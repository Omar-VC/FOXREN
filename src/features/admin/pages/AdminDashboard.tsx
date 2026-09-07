// src/features/admin/pages/AdminDashboard.tsx

import React, { useState } from "react";
import { db, auth } from "../../../infrastructure/firebase/firebase";
import { updateDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useJugadores } from "../../jugadores/hooks/useJugadores";
import { 
  aprobarSolicitudJugador, 
  rechazarSolicitudJugador, 
  cambiarEstadoJugador 
} from "../services/adminHelpers";
import { GestionCircuitos } from "./GestionCircuitos";
import Logo from "../../../assets/logo.svg";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { jugadores: pendientes, loading: loadingPendientes } = useJugadores("pendiente");
  const { jugadores: activos, loading: loadingActivos } = useJugadores("activo");
  
  const [seccionActiva, setSeccionActiva] = useState<"solicitudes" | "jugadores" | "circuitos">("solicitudes");
  const [menuOpen, setMenuOpen] = useState(false); // Estado para responsive
  const [searchTerm, setSearchTerm] = useState("");
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<{ [key: string]: string }>({});

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin-login");
  };

  const handleAprobar = async (solicitud: any) => {
    const catDeclarada = (solicitud.categoriaDeclarada || solicitud.nivelInicial || "OCTAVA").toUpperCase();
    const catOficial = categoriaSeleccionada[solicitud.id] || catDeclarada;

    try {
      await aprobarSolicitudJugador(solicitud, catOficial);
      alert(`Jugador ${solicitud.nombre} ${solicitud.apellido} aprobado en categoría ${catOficial}.`);
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

  const handleCambiarEstado = async (id: string, nuevoEstado: "activo" | "inactivo") => {
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

  if (loadingPendientes || loadingActivos) {
    return <p className="text-white p-6 font-semibold">Cargando panel de control...</p>;
  }

  const jugadoresFiltrados = activos.filter(
    (j) =>
      j.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.dni.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[var(--overlay-dark)] text-white font-[var(--font-family-base)]">
      {/* Header móvil */}
      <div className="md:hidden flex items-center justify-between p-4 bg-black/60 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <img src={Logo} alt="FOXREN" className="h-6 w-auto" />
          <span className="font-bold text-lg text-[var(--color-primary-light)]">FOXREN Admin</span>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white text-2xl focus:outline-none"
        >
          ☰
        </button>
      </div>

      {/* Overlay para cerrar menú en celular */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 z-20"
        />
      )}

      {/* Panel lateral */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-black/80 md:bg-black/40 backdrop-blur-md p-6 flex flex-col border-r border-gray-800 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="hidden md:flex items-center gap-3 mb-8">
          <img src={Logo} alt="FOXREN" className="h-8 w-auto" />
          <h2 className="text-xl font-bold text-[var(--color-primary-light)]">FOXREN Admin</h2>
        </div>

        <nav className="flex flex-col space-y-2 flex-1">
          <button
            onClick={() => {
              setSeccionActiva("solicitudes");
              setMenuOpen(false);
            }}
            className={`text-left px-4 py-3 rounded-[var(--border-radius)] flex justify-between items-center transition ${
              seccionActiva === "solicitudes"
                ? "bg-[var(--color-primary)] text-white font-bold shadow-[var(--shadow-card)]"
                : "hover:bg-[var(--overlay-light)] text-gray-300"
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
            onClick={() => {
              setSeccionActiva("jugadores");
              setMenuOpen(false);
            }}
            className={`text-left px-4 py-3 rounded-[var(--border-radius)] transition ${
              seccionActiva === "jugadores"
                ? "bg-[var(--color-primary)] text-white font-bold shadow-[var(--shadow-card)]"
                : "hover:bg-[var(--overlay-light)] text-gray-300"
            }`}
          >
            Lista Oficial
          </button>

          <button
            onClick={() => {
              setSeccionActiva("circuitos");
              setMenuOpen(false);
            }}
            className={`text-left px-4 py-3 rounded-[var(--border-radius)] transition ${
              seccionActiva === "circuitos"
                ? "bg-[var(--color-primary)] text-white font-bold shadow-[var(--shadow-card)]"
                : "hover:bg-[var(--overlay-light)] text-gray-300"
            }`}
          >
            Circuitos y Llaves
          </button>
        </nav>

        {/* Botón Cerrar Sesión */}
        <button
          onClick={handleLogout}
          className="mt-auto px-4 py-2.5 bg-red-900/40 hover:bg-red-800/60 text-red-200 border border-red-500/30 rounded font-semibold text-sm transition"
        >
          Cerrar Sesión
        </button>
      </aside>

      {/* Área principal */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {seccionActiva === "solicitudes" && (
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-6 text-[var(--color-primary-light)]">
              Solicitudes de Registro Pendientes
            </h1>
            {pendientes.length === 0 ? (
              <p className="text-gray-400">No hay solicitudes pendientes.</p>
            ) : (
              <ul className="space-y-4">
                {pendientes.map((sol) => (
                  <li key={sol.id} className="bg-gray-900/60 p-4 md:p-5 rounded-[var(--border-radius)] flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border border-gray-800 shadow-[var(--shadow-card)]">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">
                        {sol.nombre} {sol.apellido} {sol.apodo ? `("${sol.apodo}")` : ""}
                      </span>
                      <span className="text-sm text-gray-400">
                        DNI: {sol.dni} | Ciudad: {sol.ciudad} | Lado: {sol.ladoJuego}
                      </span>
                      <span className="text-sm text-yellow-400 mt-1">
                        Cat. declarada: {sol.nivelInicial || sol.categoriaDeclarada || "No especificado"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      <div className="flex flex-col flex-1 md:flex-initial">
                        <label className="text-xs text-gray-400 mb-1">Cat. Oficial</label>
                        <select
                          className="bg-gray-800 text-white px-3 py-1.5 rounded border border-gray-700 text-sm focus:outline-none"
                          value={
                            categoriaSeleccionada[sol.id] || 
                            (sol.categoriaDeclarada || sol.nivelInicial || "OCTAVA").toUpperCase()
                          }
                          onChange={(e) =>
                            setCategoriaSeleccionada({ ...categoriaSeleccionada, [sol.id]: e.target.value })
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
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold text-sm transition shadow"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleRechazar(sol.id)}
                        className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold text-sm transition shadow"
                      >
                        Rechazar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {seccionActiva === "jugadores" && !jugadorSeleccionado && (
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-6 text-[var(--color-primary-light)]">
              Lista Oficial de Jugadores
            </h1>
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full mb-6 px-4 py-2.5 rounded bg-gray-900/80 border border-gray-700 text-white focus:outline-none focus:border-[var(--color-primary)]"
            />
            <ul className="space-y-3">
              {jugadoresFiltrados.map((j) => (
                <li key={j.id} className="bg-gray-900/60 p-4 rounded-[var(--border-radius)] flex flex-col md:flex-row gap-3 justify-between items-start md:items-center border border-gray-800">
                  <div className="flex flex-col">
                    <span className="font-semibold text-lg">
                      {j.nombre} {j.apellido} - DNI {j.dni}
                    </span>
                    <span className="text-sm text-gray-400">
                      Categoría: <strong className="text-[var(--color-primary-light)]">{j.categoriaId || "Sin categoría"}</strong> | Estado: {j.estado}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 w-full md:w-auto">
                    <button
                      onClick={() => {
                        setJugadorSeleccionado(j);
                        setEditData(j);
                      }}
                      className="bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 rounded text-sm font-semibold transition"
                    >
                      Ficha
                    </button>
                    <button
                      onClick={() => handleCambiarEstado(j.id, j.estado === "activo" ? "inactivo" : "activo")}
                      className={`${
                        j.estado === "activo" ? "bg-amber-600 hover:bg-amber-500" : "bg-green-600 hover:bg-green-500"
                      } px-3.5 py-1.5 rounded text-sm font-semibold transition`}
                    >
                      {j.estado === "activo" ? "Inactivar" : "Activar"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {seccionActiva === "circuitos" && <GestionCircuitos />}

        {jugadorSeleccionado && (
          <div className="bg-gray-900/90 p-6 rounded-[var(--border-radius)] border border-gray-700 shadow-[var(--shadow-card)]">
            <h2 className="text-xl font-bold mb-4">Editar Ficha: {jugadorSeleccionado.nombre} {jugadorSeleccionado.apellido}</h2>
            <div className="space-y-3 max-w-lg">
              {Object.keys(editData).map((campo) => {
                if (campo === "id" || campo === "fechaRegistro") return null;
                return (
                  <div key={campo} className="flex flex-col">
                    <label className="text-xs text-gray-400 font-semibold uppercase">{campo}</label>
                    <input
                      type="text"
                      value={editData[campo] || ""}
                      onChange={(e) => setEditData({ ...editData, [campo]: e.target.value })}
                      className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 text-sm focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={guardarCambios} className="bg-green-600 px-4 py-2 rounded font-bold hover:bg-green-500">
                Guardar
              </button>
              <button onClick={() => setJugadorSeleccionado(null)} className="bg-gray-700 px-4 py-2 rounded font-bold hover:bg-gray-600">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};