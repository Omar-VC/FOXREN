import { useState } from "react";

import { useCircuitos } from "../../circuitos/hooks/useCircuitos";
import { useComplejos } from "../../complejos/hooks/useComplejos";

interface Props {
  creando: boolean;

  onCrear: (datos: {
    nombre: string;
    circuitoId: string;
    complejoId: string;
    fechaInicio: Date;
    fechaFin?: Date;
    modalidad: "presencial";
    estado: "pendiente";
    contactoOrganizador: string;
  }) => Promise<void>;
}

export default function TorneoForm({
  creando,
  onCrear,
}: Props) {
  const {
    circuitos,
    cargando: cargandoCircuitos,
  } = useCircuitos();

  const {
    complejos,
    cargando: cargandoComplejos,
  } = useComplejos();

  const [nombre, setNombre] = useState("");
  const [circuitoId, setCircuitoId] = useState("");
  const [complejoId, setComplejoId] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [contactoOrganizador, setContactoOrganizador] =
    useState("");

  const complejosDisponibles = complejos.filter(
    (complejo) =>
      complejo.circuitoId === circuitoId &&
      complejo.estado === "activo"
  );

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    await onCrear({
      nombre,
      circuitoId,
      complejoId,
      fechaInicio: new Date(fechaInicio),
      fechaFin: fechaFin
        ? new Date(fechaFin)
        : undefined,
      modalidad: "presencial",
      estado: "pendiente",
      contactoOrganizador,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nombre del torneo</label>

        <input
          value={nombre}
          onChange={(event) =>
            setNombre(event.target.value)
          }
          required
        />
      </div>

      <div>
        <label>Circuito</label>

        <select
          value={circuitoId}
          onChange={(event) => {
            setCircuitoId(event.target.value);
            setComplejoId("");
          }}
          required
          disabled={cargandoCircuitos}
        >
          <option value="">
            {cargandoCircuitos
              ? "Cargando circuitos..."
              : "Seleccionar circuito"}
          </option>

          {circuitos
            .filter(
              (circuito) =>
                circuito.estado === "activo"
            )
            .map((circuito) => (
              <option
                key={circuito.id}
                value={circuito.id}
              >
                {circuito.nombre}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label>Complejo</label>

        <select
          value={complejoId}
          onChange={(event) =>
            setComplejoId(event.target.value)
          }
          required
          disabled={
            !circuitoId ||
            cargandoComplejos
          }
        >
          <option value="">
            {!circuitoId
              ? "Seleccioná primero un circuito"
              : cargandoComplejos
                ? "Cargando complejos..."
                : "Seleccionar complejo"}
          </option>

          {complejosDisponibles.map(
            (complejo) => (
              <option
                key={complejo.id}
                value={complejo.id}
              >
                {complejo.nombre}
              </option>
            )
          )}
        </select>
      </div>

      <div>
        <label>Fecha de inicio</label>

        <input
          type="date"
          value={fechaInicio}
          onChange={(event) =>
            setFechaInicio(event.target.value)
          }
          required
        />
      </div>

      <div>
        <label>Fecha de fin</label>

        <input
          type="date"
          value={fechaFin}
          onChange={(event) =>
            setFechaFin(event.target.value)
          }
        />
      </div>

      <div>
        <label>Contacto del organizador</label>

        <input
          value={contactoOrganizador}
          onChange={(event) =>
            setContactoOrganizador(
              event.target.value
            )
          }
          required
        />
      </div>

      <button
        type="submit"
        disabled={creando}
      >
        {creando
          ? "Creando..."
          : "Crear torneo"}
      </button>
    </form>
  );
}