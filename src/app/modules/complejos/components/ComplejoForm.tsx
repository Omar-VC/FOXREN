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
      nombre: nombre.trim(),
      circuitoId,
      ciudad: ciudad.trim(),
      provincia: provincia.trim(),
      cantidadCanchas,
      estado: "activo",
    });

    setNombre("");
    setCircuitoId("");
    setCiudad("");
    setProvincia("");
    setCantidadCanchas(1);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="border-b border-[var(--color-border)] pb-3">
        <h3 className="text-base font-bold text-white tracking-wide">
          Registrar Complejo
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Añade una nueva sede o complejo deportivo
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Nombre
        </label>
        <input
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          placeholder="Ej: Complejo Pádel Center"
          required
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors shadow-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Circuito
        </label>
        <select
          value={circuitoId}
          onChange={(event) => setCircuitoId(event.target.value)}
          required
          disabled={cargandoCircuitos}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors shadow-sm disabled:opacity-50"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Ciudad
          </label>
          <input
            value={ciudad}
            onChange={(event) => setCiudad(event.target.value)}
            placeholder="Ej: Neuquén"
            required
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors shadow-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Provincia
          </label>
          <input
            value={provincia}
            onChange={(event) => setProvincia(event.target.value)}
            placeholder="Ej: Neuquén"
            required
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Cantidad de canchas
        </label>
        <input
          type="number"
          min="1"
          value={cantidadCanchas}
          onChange={(event) => setCantidadCanchas(Number(event.target.value))}
          required
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors shadow-sm"
        />
      </div>

      <button
        type="submit"
        disabled={creando}
        className="w-full mt-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 px-4 py-3 text-xs font-bold text-white uppercase tracking-wider transition-colors disabled:opacity-50 shadow-md shadow-purple-950/20"
      >
        {creando ? "Creando complejo..." : "Crear complejo"}
      </button>
    </form>
  );
}
