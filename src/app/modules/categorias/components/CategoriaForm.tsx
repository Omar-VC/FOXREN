import { useState } from "react";

interface Props {
  creando: boolean;
  onCrear: (datos: {
    nombre: string;
    descripcion?: string;
    estado: "activa";
  }) => Promise<void>;
}

const CLASE_INPUT =
  "w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none transition-colors";

export default function CategoriaForm({ creando, onCrear }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  async function handleSubmit(event: React.FormEvent) {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre de la categoría */}
        <div className="space-y-1.5">
          <label className="block text-xs text-[var(--color-text-muted)] font-medium">
            Nombre de la categoría
          </label>
          <input
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            placeholder="Ej: 5ta"
            required
            className={CLASE_INPUT}
          />
        </div>

        {/* Descripción */}
        <div className="space-y-1.5">
          <label className="block text-xs text-[var(--color-text-muted)] font-medium">
            Descripción
          </label>
          <input
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            placeholder="Ej: Quinta categoría"
            className={CLASE_INPUT}
          />
        </div>
      </div>

      {/* Botón de envío */}
      <div className="flex justify-end pt-2 border-t border-white/5">
        <button
          type="submit"
          disabled={creando}
          className="fox-button-primary text-xs py-2.5 px-4 font-semibold transition-all w-full md:w-auto"
        >
          {creando ? "Creando..." : "Crear categoría"}
        </button>
      </div>
    </form>
  );
}