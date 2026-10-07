import { useState } from "react";

import type { Jugador } from "../../../../domain/jugador/jugador.types";

interface Props {
  jugador: Jugador;
  guardando: boolean;
  onGuardar: (datos: Partial<Jugador>) => Promise<void>;
  onCancelar: () => void;
}

export default function JugadorForm({
  jugador,
  guardando,
  onGuardar,
  onCancelar,
}: Props) {
  const [nombre, setNombre] = useState(jugador.nombre);
  const [apellido, setApellido] = useState(jugador.apellido);
  const [apodo, setApodo] = useState(jugador.apodo || "");
  const [sexo, setSexo] = useState(jugador.sexo);
  const [ciudad, setCiudad] = useState(jugador.ciudad);
  const [provincia, setProvincia] = useState(jugador.provincia);
  const [fechaNacimiento, setFechaNacimiento] = useState(() => {
    if (!jugador.fechaNacimiento) {
      return "";
    }

    const fecha =
      jugador.fechaNacimiento instanceof Date
        ? jugador.fechaNacimiento
        : new Date(jugador.fechaNacimiento);

    if (Number.isNaN(fecha.getTime())) {
      return "";
    }

    return fecha.toISOString().split("T")[0];
  });

  const [ladoJuego, setLadoJuego] = useState(jugador.ladoJuego);
  const [categoriaDeclarada, setCategoriaDeclarada] = useState(
    jugador.categoriaDeclarada,
  );
  

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    await onGuardar({
      nombre,
      apellido,
      apodo: apodo || "",
      sexo,
      ciudad,
      provincia,
      ...(fechaNacimiento
        ? {
            fechaNacimiento: new Date(fechaNacimiento),
          }
        : {}),
      ladoJuego,
      categoriaDeclarada,
      
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nombre</label>
        <input
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          required
        />
      </div>

      <div>
        <label>Apellido</label>
        <input
          value={apellido}
          onChange={(event) => setApellido(event.target.value)}
          required
        />
      </div>

      <div>
        <label>DNI</label>
        <input value={jugador.dni} disabled />
      </div>

      <div>
        <label>Apodo</label>
        <input
          value={apodo}
          onChange={(event) => setApodo(event.target.value)}
        />
      </div>

      <div>
        <label>Sexo</label>
        <select
          value={sexo}
          onChange={(event) => setSexo(event.target.value as Jugador["sexo"])}
        >
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
        </select>
      </div>

      <div>
        <label>Ciudad</label>
        <input
          value={ciudad}
          onChange={(event) => setCiudad(event.target.value)}
          required
        />
      </div>

      <div>
        <label>Provincia</label>
        <input
          value={provincia}
          onChange={(event) => setProvincia(event.target.value)}
          required
        />
      </div>

      <div>
        <label>Fecha de nacimiento</label>
        <input
          type="date"
          value={fechaNacimiento}
          onChange={(event) => setFechaNacimiento(event.target.value)}
        />
      </div>

      <div>
        <label>Lado de juego</label>
        <select
          value={ladoJuego}
          onChange={(event) =>
            setLadoJuego(event.target.value as Jugador["ladoJuego"])
          }
        >
          <option value="drive">Drive</option>
          <option value="reves">Revés</option>
        </select>
      </div>

      <div>
        <label>Categoría declarada</label>
        <input
          value={categoriaDeclarada}
          onChange={(event) => setCategoriaDeclarada(event.target.value)}
          required
        />
      </div>

      

      <button type="submit" disabled={guardando}>
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>

      <button type="button" onClick={onCancelar} disabled={guardando}>
        Cancelar
      </button>
    </form>
  );
}
