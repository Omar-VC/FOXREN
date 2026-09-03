import React from "react";
import { JugadorForm } from "../components/JugadorForm";
import { useJugadores } from "../hooks/useJugadores";

export const JugadoresPage: React.FC = () => {
  const { jugadores, loading } = useJugadores("activo");

  if (loading) return <p className="text-white">Cargando jugadores...</p>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-4">Jugadores Oficiales</h1>
        <ul className="space-y-2">
          {jugadores.map((j) => (
            <li key={j.id} className="bg-[rgba(255,255,255,0.05)] p-3 rounded">
              {j.nombre} {j.apellido} - {j.categoriaId}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <JugadorForm />
      </div>
    </div>
  );
};
