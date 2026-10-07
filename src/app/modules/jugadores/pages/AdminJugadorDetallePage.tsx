import { useState } from "react";
import { useParams } from "react-router-dom";

import { useJugador } from "../hooks/useJugador";
import JugadorForm from "../components/JugadorForm";

export default function AdminJugadorDetallePage() {
  const { id } = useParams();

  const {
    jugador,
    cargando,
    error,
    guardando,
    actualizarJugador,
  } = useJugador(id);

  const [editando, setEditando] = useState(false);

  if (cargando) {
    return <p>Cargando jugador...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!jugador) {
    return <p>Jugador no encontrado.</p>;
  }

  if (editando) {
    return (
      <section>
        <h1>Editar jugador</h1>

        <JugadorForm
          jugador={jugador}
          guardando={guardando}
          onGuardar={async (datos) => {
            await actualizarJugador(datos);
            setEditando(false);
          }}
          onCancelar={() => setEditando(false)}
        />
      </section>
    );
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

      <p>Sexo: {jugador.sexo}</p>

      <p>Ciudad: {jugador.ciudad}</p>

      <p>Provincia: {jugador.provincia}</p>

      <p>Lado de juego: {jugador.ladoJuego}</p>

      <p>
        Categoría declarada:{" "}
        {jugador.categoriaDeclarada}
      </p>

      <p>Estado: {jugador.estado}</p>

      <button
        type="button"
        onClick={() => setEditando(true)}
      >
        Editar jugador
      </button>
    </section>
  );
}