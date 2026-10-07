import { useJugadores } from "../hooks/useJugadores";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function AdminJugadoresPage() {
  const { jugadores, cargando, error } = useJugadores();

  const [busqueda, setBusqueda] = useState("");

  const jugadoresFiltrados = jugadores.filter((jugador) => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) {
      return true;
    }

    const nombreCompleto =
      `${jugador.nombre} ${jugador.apellido}`.toLowerCase();

    return nombreCompleto.includes(texto) || jugador.dni.includes(texto);
  });

  return (
    <section>
      <input
        type="text"
        placeholder="Buscar por nombre, apellido o DNI"
        value={busqueda}
        onChange={(event) => setBusqueda(event.target.value)}
      />
      <h1>Jugadores</h1>

      {cargando && <p>Cargando jugadores...</p>}

      {error && <p>{error}</p>}

      {!cargando && !error && jugadores.length === 0 && (
        <p>No hay jugadores registrados.</p>
      )}

      {!cargando &&
        !error &&
        jugadores.length > 0 &&
        jugadoresFiltrados.length === 0 && <p>No se encontraron jugadores.</p>}

      {!cargando && jugadoresFiltrados.length > 0 && (
        <div>
          {jugadoresFiltrados.map((jugador) => (
            <Link key={jugador.id} to={`/admin/jugadores/${jugador.id}`}>
              <article>
                <h2>
                  {jugador.nombre} {jugador.apellido}
                </h2>

                <p>DNI: {jugador.dni}</p>

                <p>
                  Ciudad: {jugador.ciudad}, {jugador.provincia}
                </p>

                <p>Categoría: {jugador.categoriaDeclarada}</p>

                <p>Lado: {jugador.ladoJuego}</p>

                <p>Estado: {jugador.estado}</p>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
