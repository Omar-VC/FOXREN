import ComplejoForm from "../components/ComplejoForm";
import ComplejoList from "../components/ComplejoList";
import { useComplejos } from "../hooks/useComplejos";

export default function AdminComplejosPage() {
  const {
    complejos,
    cargando,
    creando,
    error,
    crearComplejo,
  } = useComplejos();

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-slate-400 tracking-wider uppercase">
            Cargando complejos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera de la página */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Administrar Complejos
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Gestiona los complejos deportivos, ubicaciones y sedes disponibles.
        </p>
      </div>

      {/* Alerta de error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
          <p className="font-semibold uppercase tracking-wider mb-0.5">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Workspace en grilla para separar Formulario y Listado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Formulario (Columna izquierda en pantallas grandes) */}
        <div className="lg:col-span-1 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
          <ComplejoForm
            creando={creando}
            onCrear={crearComplejo}
          />
        </div>

        {/* Listado (Columna derecha / principal) */}
        <div className="lg:col-span-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
          <ComplejoList complejos={complejos} />
        </div>
      </div>
    </div>
  );
}