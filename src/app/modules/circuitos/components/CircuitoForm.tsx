import { useState } from "react";

interface Props {
  creando: boolean;
  onCrear: (datos: {
    nombre: string;
    descripcion?: string;
    temporada: string;
    estado: "activo";
  }) => Promise<void>;
}

export default function CircuitoForm({
  creando,
  onCrear,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [temporada, setTemporada] = useState("");

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!nombre.trim() || !temporada.trim()) {
      return;
    }

    await onCrear({
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      temporada: temporada.trim(),
      estado: "activo",
    });

    setNombre("");
    setDescripcion("");
    setTemporada("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nombre</label>

        <input
          value={nombre}
          onChange={(event) =>
            setNombre(event.target.value)
          }
          placeholder="Ej: Circuito Neuquén"
        />
      </div>

      <div>
        <label>Descripción</label>

        <textarea
          value={descripcion}
          onChange={(event) =>
            setDescripcion(event.target.value)
          }
          placeholder="Descripción del circuito"
        />
      </div>

      <div>
        <label>Temporada</label>

        <input
          value={temporada}
          onChange={(event) =>
            setTemporada(event.target.value)
          }
          placeholder="Ej: 2026"
        />
      </div>

      <button type="submit" disabled={creando}>
        {creando ? "Creando..." : "Crear circuito"}
      </button>
    </form>
  );
}