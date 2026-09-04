import React, { useState } from "react";
import { useJugadores } from "../hooks/useJugadores";

export const JugadoresPage: React.FC = () => {
  const { jugadores, loading } = useJugadores("activo");
  const [genero, setGenero] = useState<"masculino" | "femenino">("masculino");
  const [ciudad, setCiudad] = useState<string>("");

  if (loading) return <p className="text-white">Cargando jugadores...</p>;

  // Obtener lista única de ciudades
  const ciudades = Array.from(new Set(jugadores.map((j) => j.ciudad))).filter(
    Boolean,
  );

  // Filtrar jugadores por género y ciudad
  const jugadoresFiltrados = jugadores.filter(
    (j) => j.sexo === genero && (ciudad === "" || j.ciudad === ciudad),
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">
        Jugadores Oficiales
      </h1>

      {/* Toggle Masculino/Femenino */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-[var(--color-secondary)] rounded-lg overflow-hidden shadow-md">
          <button
            onClick={() => setGenero("masculino")}
            className={`px-6 py-2 font-semibold ${
              genero === "masculino"
                ? "bg-[var(--color-primary)] text-[var(--color-light)]"
                : "bg-[var(--color-dark)] text-[var(--color-light)] hover:bg-[var(--color-secondary)]"
            }`}
          >
            Masculino
          </button>
          <button
            onClick={() => setGenero("femenino")}
            className={`px-6 py-2 font-semibold ${
              genero === "femenino"
                ? "bg-[var(--color-primary-light)] text-[var(--color-dark)]"
                : "bg-[var(--color-dark)] text-[var(--color-light)] hover:bg-[var(--color-secondary)]"
            }`}
          >
            Femenino
          </button>
        </div>
      </div>

      {/* Dropdown Ciudad */}
      <div className="flex justify-center mb-6">
        <select
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          className="px-4 py-2 rounded bg-[var(--color-dark)] text-[var(--color-light)] shadow-md"
        >
          <option value="">Todas las ciudades</option>
          {ciudades.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Lista filtrada */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jugadoresFiltrados.map((j) => (
          <li
            key={j.id}
            className="bg-[var(--color-secondary)] p-4 rounded-[var(--border-radius)] shadow-[var(--shadow-card)] hover:scale-[1.02] transition-transform"
          >
            <h2 className="text-lg font-bold text-[var(--color-primary-light)]">
              {j.nombre} {j.apellido}
            </h2>
            <p className="text-[var(--color-light)]">Ciudad: {j.ciudad}</p>
            <p className="text-[var(--color-light)]">DNI: {j.dni}</p>
            <p className="text-[var(--color-primary)]">
              Categoría: {j.categoriaId}
            </p>
          </li>
        ))}
        {jugadoresFiltrados.length === 0 && (
          <p className="text-gray-400">
            No hay jugadores registrados con esos filtros.
          </p>
        )}
      </ul>
    </div>
  );
};
