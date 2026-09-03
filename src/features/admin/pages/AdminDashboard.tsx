import React, { useState } from "react";
import { db } from "../../../infrastructure/firebase/firebase";
import { updateDoc, doc } from "firebase/firestore";
import { useJugadores } from "../../jugadores/hooks/useJugadores";

// categorías fijas por ahora (más adelante las traemos de Firestore)
const categorias = [
  { id: "primera", nombre: "Primera" },
  { id: "segunda", nombre: "Segunda" },
  { id: "tercera", nombre: "Tercera" },
  { id: "cuarta", nombre: "Cuarta" },
  { id: "quinta", nombre: "Quinta" },
  { id: "sexta", nombre: "Sexta" },
  { id: "septima", nombre: "Séptima" },
  { id: "octava", nombre: "Octava" },
];

export const AdminDashboard: React.FC = () => {
  const { jugadores: pendientes, loading } = useJugadores("pendiente");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<{ [key: string]: string }>({});

  const aprobar = async (id: string) => {
    const categoriaId = categoriaSeleccionada[id] || "sin_categoria";
    await updateDoc(doc(db, "jugadores", id), { estado: "activo", categoriaId });
  };

  const rechazar = async (id: string) => {
    await updateDoc(doc(db, "jugadores", id), { estado: "rechazado" });
  };

  if (loading) return <p className="text-white">Cargando solicitudes...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Solicitudes de Jugadores</h1>
      <ul className="space-y-2">
        {pendientes.map((j) => (
          <li key={j.id} className="bg-[rgba(255,255,255,0.05)] p-3 rounded flex justify-between items-center">
            <span>{j.nombre} {j.apellido} - DNI {j.dni}</span>
            <div className="flex items-center space-x-2">
              <select
                value={categoriaSeleccionada[j.id] || ""}
                onChange={(e) => setCategoriaSeleccionada({ ...categoriaSeleccionada, [j.id]: e.target.value })}
                className="bg-gray-700 text-white px-2 py-1 rounded"
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              <button onClick={() => aprobar(j.id)} className="bg-green-600 px-3 py-1 rounded">Aceptar</button>
              <button onClick={() => rechazar(j.id)} className="bg-red-600 px-3 py-1 rounded">Rechazar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
