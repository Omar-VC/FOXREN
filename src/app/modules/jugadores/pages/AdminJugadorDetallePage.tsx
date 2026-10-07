import { useParams } from "react-router-dom";

import { useJugador } from "../hooks/useJugador";

export default function AdminJugadorDetallePage() {
  const { id } = useParams();

  const {
    jugador,
    cargando,
    error,
  } = useJugador(id);

  if (cargando) {
    return <p>Cargando jugador...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!jugador) {
    return <p>Jugador no encontrado.</p>;
  }

  return (
    <section>
      <h1>
        {jugador.nombre} {jugador.apellido}
      </h1>

      <p>DNI: {jugador.dni}</p>

      <p>
        Apodo: {jugador.apodo || "Sin apodo"}
      </p>

      <p>
        Sexo: {jugador.sexo}
      </p>

      <p>
        Ciudad: {jugador.ciudad}
      </p>

      <p>
        Provincia: {jugador.provincia}
      </p>

      <p>
        Lado de juego: {jugador.ladoJuego}
      </p>

      <p>
        Categoría declarada: {jugador.categoriaDeclarada}
      </p>

      <p>
        Estado: {jugador.estado}
      </p>
    </section>
  );
}