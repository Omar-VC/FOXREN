import { useState } from "react";
import OrganizadorSelector from "../../../shared/OrganizadorSelector";

interface Props {
  creando: boolean;
  onCrear: (datos: {
    nombre: string;
    descripcion?: string;
    temporada: string;
    estado: "activo";
    organizadorIds: string[];
  }) => Promise<void>;
}

export default function CircuitoForm({
  creando,
  onCrear,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [temporada, setTemporada] = useState("");
  const [organizadorIds, setOrganizadorIds] = useState<string[]>([]);

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
      organizadorIds,
    });

    setNombre("");
    setDescripcion("");
    setTemporada("");
    setOrganizadorIds([]);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="border-b border-[var(--color-border)] pb-3">
        <h3 className="text-base font-bold text-white tracking-wide">
          Registrar Circuito
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Creá un nuevo circuito oficial para la temporada
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Nombre
        </label>
        <input
          value={nombre}
          onChange={(event) =>
            setNombre(event.target.value)
          }
          placeholder="Ej: Circuito Neuquén"
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors shadow-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Descripción
        </label>
        <textarea
          value={descripcion}
          onChange={(event) =>
            setDescripcion(event.target.value)
          }
          placeholder="Descripción breve del circuito..."
          rows={3}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors shadow-sm resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Temporada
        </label>
        <input
          value={temporada}
          onChange={(event) =>
            setTemporada(event.target.value)
          }
          placeholder="Ej: 2026"
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors shadow-sm"
        />
      </div>

      <div className="pt-1">
        <OrganizadorSelector 
          value={organizadorIds} 
          onChange={setOrganizadorIds} 
          label="Organizadores del circuito" 
        />
      </div>

      <button 
        type="submit" 
        disabled={creando}
        className="w-full mt-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 px-4 py-3 text-xs font-bold text-white uppercase tracking-wider transition-colors disabled:opacity-50 shadow-md shadow-purple-950/20"
      >
        {creando ? "Creando circuito..." : "Crear circuito"}
      </button>
    </form>
  );
}