import React, { useState } from "react";
import { db } from "../../../infrastructure/firebase/firebase";
import { updateDoc, doc, deleteDoc } from "firebase/firestore";
import { useJugadores } from "../../jugadores/hooks/useJugadores";

export const AdminDashboard: React.FC = () => {
  const { jugadores: pendientes, loading: loadingPendientes } = useJugadores("pendiente");
  const { jugadores: activos, loading: loadingActivos } = useJugadores("activo");
  const [seccionActiva, setSeccionActiva] = useState("solicitudes");
  const [searchTerm, setSearchTerm] = useState("");
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState<any>(null); // jugador en edición
  const [editData, setEditData] = useState<any>({}); // datos editables

  const eliminar = async (id: string) => {
    if (confirm("¿Seguro que deseas eliminar este jugador? Esta acción no se puede deshacer.")) {
      await deleteDoc(doc(db, "jugadores", id));
    }
  };

  const guardarCambios = async () => {
    if (!jugadorSeleccionado) return;
    await updateDoc(doc(db, "jugadores", jugadorSeleccionado.id), editData);
    alert("Cambios guardados correctamente.");
    setJugadorSeleccionado(null);
  };

  if (loadingPendientes || loadingActivos) return <p className="text-white">Cargando...</p>;

  const jugadoresFiltrados = activos.filter(
    (j) =>
      j.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.dni.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Panel lateral */}
      <aside className="w-64 bg-gray-800 p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-6">Administración FOXREN</h2>
        <nav className="flex flex-col space-y-2">
          <button
            onClick={() => setSeccionActiva("solicitudes")}
            className={`text-left px-3 py-2 rounded ${seccionActiva === "solicitudes" ? "bg-gray-700" : "hover:bg-gray-700"}`}
          >
            Solicitudes jugadores
            {pendientes.length > 0 && (
              <span className="ml-2 bg-red-600 text-xs px-2 py-1 rounded-full">
                {pendientes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSeccionActiva("jugadores")}
            className={`text-left px-3 py-2 rounded ${seccionActiva === "jugadores" ? "bg-gray-700" : "hover:bg-gray-700"}`}
          >
            Lista oficial
          </button>
        </nav>
      </aside>

      {/* Área principal */}
      <main className="flex-1 p-6 overflow-y-auto">
        {seccionActiva === "jugadores" && !jugadorSeleccionado && (
          <>
            <h1 className="text-2xl font-bold mb-4">Lista oficial de jugadores</h1>
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white"
            />
            <ul className="space-y-2">
              {jugadoresFiltrados.map((j) => (
                <li key={j.id} className="bg-[rgba(255,255,255,0.05)] p-3 rounded flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {j.nombre} {j.apellido} - DNI {j.dni}
                    </span>
                    <span className="text-sm opacity-80">
                      Categoría oficial: {j.categoriaId || "Sin categoría"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setJugadorSeleccionado(j);
                        setEditData(j);
                      }}
                      className="bg-blue-600 px-3 py-1 rounded hover:opacity-80"
                    >
                      Ver ficha
                    </button>
                    <button onClick={() => eliminar(j.id)} className="bg-red-700 px-3 py-1 rounded hover:opacity-80">
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
              {jugadoresFiltrados.length === 0 && (
                <p className="text-gray-400">No se encontraron jugadores con ese criterio.</p>
              )}
            </ul>
          </>
        )}

        {/* Ficha editable */}
        {jugadorSeleccionado && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Ficha de {jugadorSeleccionado.nombre} {jugadorSeleccionado.apellido}</h2>
            <div className="space-y-3">
              {Object.keys(editData).map((campo) => (
                <div key={campo} className="flex flex-col">
                  <label className="text-sm font-semibold">{campo}</label>
                  <input
                    type="text"
                    value={editData[campo] || ""}
                    onChange={(e) => setEditData({ ...editData, [campo]: e.target.value })}
                    className="px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white"
                  />
                </div>
              ))}
            </div>
            <div className="flex space-x-2 mt-4">
              <button onClick={guardarCambios} className="bg-green-600 px-4 py-2 rounded hover:opacity-80">
                Guardar cambios
              </button>
              <button onClick={() => setJugadorSeleccionado(null)} className="bg-gray-600 px-4 py-2 rounded hover:opacity-80">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

