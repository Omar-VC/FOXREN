import { useState } from "react";

import {
  CATALOGO_CATEGORIAS,
  descripcionDeCategoria,
} from "../../../../domain/jugador/categoriaJugador";

interface Props {
  creando: boolean;
  /** Nombres de categorías ya creadas, para no ofrecerlas de nuevo. */
  existentes?: string[];
  onCrear: (datos: {
    nombre: string;
    descripcion?: string;
    estado: "activa";
  }) => Promise<void>;
}

const CLASE_INPUT =
  "w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none transition-colors";

export default function CategoriaForm({ creando, existentes = [], onCrear }: Props) {
  const [nombre, setNombre] = useState("");

  const normalizadas = existentes.map((item) => item.trim().toLowerCase());
  const disponibles = CATALOGO_CATEGORIAS.filter(
    (categoria) => !normalizadas.includes(categoria.nombre.toLowerCase()),
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!nombre) return;

    await onCrear({
      nombre,
      descripcion: descripcionDeCategoria(nombre),
      estado: "activa",
    });

    setNombre("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-xs text-[var(--color-text-muted)] font-medium">
          Categoría
        </label>
        <select
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          required
          className={CLASE_INPUT}
        >
          <option value="">Seleccionar categoría</option>
          {disponibles.map((categoria) => (
            <option key={categoria.nombre} value={categoria.nombre}>
              {categoria.nombre} — {categoria.descripcion}
            </option>
          ))}
        </select>
        {disponibles.length === 0 && (
          <p className="text-xs text-[var(--color-text-muted)]">
            Ya creaste todas las categorías del catálogo.
          </p>
        )}
      </div>

      <div className="flex justify-end pt-2 border-t border-white/5">
        <button
          type="submit"
          disabled={creando || !nombre}
          className="fox-button-primary text-xs py-2.5 px-4 font-semibold transition-all w-full md:w-auto"
        >
          {creando ? "Creando..." : "Crear categoría"}
        </button>
      </div>
    </form>
  );
}
