import { useState } from "react";

import { useCircuitos } from "../../circuitos/hooks/useCircuitos";

interface Props {
  creando: boolean;

  onCrear: (datos: {
    nombre: string;
    circuitoId: string;
    ciudad: string;
    provincia: string;
    ubicacion?: string;
    telefono?: string;
    cantidadCanchas: number;
    tipoCanchas?: string;
    servicios?: string[];
    estado: "activo";
  }) => Promise<void>;
}

export default function ComplejoForm({ creando, onCrear }: Props) {
  const { circuitos, cargando: cargandoCircuitos } = useCircuitos();

  const [nombre, setNombre] = useState("");
  const [circuitoId, setCircuitoId] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [cantidadCanchas, setCantidadCanchas] = useState(1);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    await onCrear({
      nombre,
      circuitoId,
      ciudad,
      provincia,
      cantidadCanchas,
      estado: "activo",
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
        <label>Circuito</label>

        <select
          value={circuitoId}
          onChange={(event) => setCircuitoId(event.target.value)}
          required
          disabled={cargandoCircuitos}
        >
          <option value="">
            {cargandoCircuitos
              ? "Cargando circuitos..."
              : "Seleccionar circuito"}
          </option>

          {circuitos
            .filter((circuito) => circuito.estado === "activo")
            .map((circuito) => (
              <option key={circuito.id} value={circuito.id}>
                {circuito.nombre}
              </option>
            ))}
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
        <label>Cantidad de canchas</label>

        <input
          type="number"
          min="1"
          value={cantidadCanchas}
          onChange={(event) => setCantidadCanchas(Number(event.target.value))}
          required
        />
      </div>

      <button type="submit" disabled={creando}>
        {creando ? "Creando..." : "Crear complejo"}
      </button>
    </form>
  );
}
