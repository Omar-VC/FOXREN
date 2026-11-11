import { useState } from "react";

import { useCircuitos } from "../../circuitos/hooks/useCircuitos";
import { useComplejos } from "../../complejos/hooks/useComplejos";
import OrganizadorSelector from "../../../shared/OrganizadorSelector";

interface Props {
  creando: boolean;

  /**
   * Admin de complejo: el torneo se crea siempre en este complejo (bloqueado).
   * El circuito arranca con el de su complejo pero puede elegir otro.
   */
  complejoFijoId?: string;

  onCrear: (datos: {
    nombre: string;
    circuitoId: string;
    complejoId: string;
    fechaInicio: Date;
    fechaFin?: Date;
    modalidad: "presencial";
    estado: "pendiente";
    organizadorIds: string[];
  }) => Promise<void>;
}

export default function TorneoForm({
  creando,
  complejoFijoId,
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
  const [organizadorIds, setOrganizadorIds] = useState<string[]>([]);

  const complejoFijo = complejoFijoId
    ? complejos.find((complejo) => complejo.id === complejoFijoId)
    : undefined;
  const esComplejoFijo = Boolean(complejoFijoId);

  // Para el admin de complejo, el circuito de su complejo es el valor por defecto.
  const circuitoEfectivo =
    circuitoId || (esComplejoFijo ? complejoFijo?.circuitoId ?? "" : "");
  const complejoEfectivo = complejoFijoId ?? complejoId;

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
      circuitoId: circuitoEfectivo,
      complejoId: complejoEfectivo,
      fechaInicio: new Date(fechaInicio),
      fechaFin: fechaFin
        ? new Date(fechaFin)
        : undefined,
      modalidad: "presencial",
      estado: "pendiente",
      organizadorIds,
    });
  }

  return (
    <form className="fox-form" onSubmit={handleSubmit}>
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
          value={circuitoEfectivo}
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

      {esComplejoFijo ? (
        <div>
          <label>Complejo</label>
          <input
            value={
              cargandoComplejos
                ? "Cargando..."
                : complejoFijo?.nombre ??
                  "No se encontró tu complejo. Avisá al administrador de FOXREN."
            }
            disabled
            readOnly
          />
        </div>
      ) : (
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
      )}

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

      <OrganizadorSelector value={organizadorIds} onChange={setOrganizadorIds} label="Organizadores específicos del torneo (se suman a los del circuito)" />

      <button
        type="submit"
        disabled={creando || !circuitoEfectivo || (esComplejoFijo && !complejoFijo)}
      >
        {creando
          ? "Creando..."
          : "Crear torneo"}
      </button>
    </form>
  );
}
