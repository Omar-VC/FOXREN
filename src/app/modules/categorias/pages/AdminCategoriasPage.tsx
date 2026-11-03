import CategoriaForm from "../components/CategoriaForm";
import CategoriaList from "../components/CategoriaList";
import { useCategorias } from "../hooks/useCategorias";

export default function AdminCategoriasPage() {
  const {
    categorias,
    cargando,
    creando,
    error,
    crearCategoria,
  } = useCategorias();

  if (cargando) {
    return (
      <div className="py-12 text-center space-y-2">
        <div className="inline-block w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-[var(--color-text-muted)] m-0">
          Cargando categorías...
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* Cabecera de la página */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white tracking-tight m-0">
          Administrar categorías
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] m-0">
          Creá y administrá las categorías disponibles para los torneos de FOXREN.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Bloque de formulario integrado en contenedor sutil */}
      <div className="bg-black/20 border border-white/5 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white m-0">Nueva categoría</h3>
        <CategoriaForm
          creando={creando}
          onCrear={crearCategoria}
        />
      </div>

      {/* Listado de categorías */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-sm font-bold text-white m-0">Categorías registradas</h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#32113d] text-[var(--color-accent)] border border-[var(--color-border)]">
            Total: {categorias.length}
          </span>
        </div>

        <CategoriaList categorias={categorias} />
      </div>
    </section>
  );
}