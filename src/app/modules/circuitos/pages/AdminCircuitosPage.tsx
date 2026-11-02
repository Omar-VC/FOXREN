import CircuitoForm from "../components/CircuitoForm";
import CircuitoList from "../components/CircuitoList";
import { useCircuitos } from "../hooks/useCircuitos";

export default function AdminCircuitosPage() {
  const {
    circuitos,
    cargando,
    creando,
    error,
    crearCircuito,
  } = useCircuitos();

  if (cargando) {
    return (
      <div className="py-12 text-center text-slate-400 font-medium">
        Cargando panel de circuitos...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Panel Superior / Cabecera de la Sección */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Administrar Circuitos
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Gestión y alta de circuitos oficiales de la administración.
            </p>
          </div>

          <div className="flex items-center">
            <span className="text-xs px-3 py-1 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-slate-300 font-medium">
              Total circuitos: {circuitos.length}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-950/40 border border-red-500/30 text-red-200 text-xs rounded-xl">
            {error}
          </div>
        )}
      </div>

      {/* Grilla Operativa: Formulario a la izquierda y Listado a la derecha (o distribución adaptativa) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Columna de Registro */}
        <div className="lg:col-span-1 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl">
          <CircuitoForm
            creando={creando}
            onCrear={crearCircuito}
          />
        </div>

        {/* Columna de Listado */}
        <div className="lg:col-span-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl">
          <CircuitoList circuitos={circuitos} />
        </div>
      </div>
    </div>
  );
}