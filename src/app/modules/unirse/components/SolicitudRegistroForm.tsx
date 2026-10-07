import { useState } from "react";

import { solicitudesRegistroRepository } from "../../../../infrastructure/repositories/solicitudesRegistroRepository";

import { jugadoresRepository } from "../../../../infrastructure/repositories/jugadoresRepository";

export default function SolicitudRegistroForm() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [apodo, setApodo] = useState("");
  const [dni, setDni] = useState("");
  const [sexo, setSexo] = useState<"masculino" | "femenino">("masculino");
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [ladoJuego, setLadoJuego] = useState<"drive" | "reves">("drive");
  const [categoriaDeclarada, setCategoriaDeclarada] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setEnviando(true);
      setMensaje("");
      setError("");

      const jugadorExistente =
        await jugadoresRepository.obtenerJugadorPorDni(dni);

      if (jugadorExistente) {
        setError("Este DNI ya pertenece a un jugador registrado en FOXREN.");
        return;
      }

      const solicitudesExistentes =
        await solicitudesRegistroRepository.obtenerPorDni(dni);

      const solicitudPendiente = solicitudesExistentes.find(
        (solicitud) => solicitud.estado === "pendiente",
      );

      if (solicitudPendiente) {
        setError("Ya existe una solicitud pendiente para este DNI.");
        return;
      }

      await solicitudesRegistroRepository.crearSolicitud({
        nombre,
        apellido,
        apodo: apodo || "",
        dni,
        sexo,
        ciudad,
        provincia,
        fechaNacimiento: new Date(fechaNacimiento),
        ladoJuego,
        categoriaDeclarada,
        estado: "pendiente",
        fechaSolicitud: new Date(),
      });

      setMensaje("Solicitud enviada correctamente. FOXREN revisará tus datos.");
    } catch (error) {
      console.error("ERROR AL CREAR SOLICITUD:", error);
      setError("No se pudo enviar la solicitud. Intentá nuevamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      {mensaje && <p>{mensaje}</p>}

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Apellido</label>
          <input
            type="text"
            value={apellido}
            onChange={(event) => setApellido(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Apodo</label>
          <input
            type="text"
            value={apodo}
            onChange={(event) => setApodo(event.target.value)}
          />
        </div>

        <div>
          <label>DNI</label>
          <input
            type="text"
            value={dni}
            onChange={(event) => setDni(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Sexo</label>
          <select
            value={sexo}
            onChange={(event) =>
              setSexo(event.target.value as "masculino" | "femenino")
            }
          >
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </div>

        <div>
          <label>Ciudad</label>
          <input
            type="text"
            value={ciudad}
            onChange={(event) => setCiudad(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Provincia</label>
          <input
            type="text"
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
            required
          />
        </div>

        <div>
          <label>Lado de juego</label>
          <select
            value={ladoJuego}
            onChange={(event) =>
              setLadoJuego(event.target.value as "drive" | "reves")
            }
          >
            <option value="drive">Drive</option>
            <option value="reves">Revés</option>
          </select>
        </div>

        <div>
          <label>Categoría declarada</label>
          <input
            type="text"
            value={categoriaDeclarada}
            onChange={(event) => setCategoriaDeclarada(event.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={enviando}>
          {enviando ? "Enviando..." : "Solicitar registro"}
        </button>
      </form>
    </div>
  );
}
