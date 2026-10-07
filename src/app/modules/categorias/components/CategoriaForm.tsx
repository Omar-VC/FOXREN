import { useState } from "react";

interface Props {
  creando: boolean;
  onCrear: (datos: {
    nombre: string;
    descripcion?: string;
    estado: "activa";
  }) => Promise<void>;
}

export default function CategoriaForm({
  creando,
  onCrear,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    await onCrear({
      nombre,
      descripcion: descripcion || undefined,
      estado: "activa",
    });

    setNombre("");
    setDescripcion("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nombre de la categoría</label>

        <input
          value={nombre}
          onChange={(event) =>
            setNombre(event.target.value)
          }
          placeholder="Ej: 5ta"
          required
        />
      </div>

      <div>
        <label>Descripción</label>

        <input
          value={descripcion}
          onChange={(event) =>
            setDescripcion(event.target.value)
          }
          placeholder="Ej: Quinta categoría"
        />
      </div>

      <button
        type="submit"
        disabled={creando}
      >
        {creando
          ? "Creando..."
          : "Crear categoría"}
      </button>
    </form>
  );
}