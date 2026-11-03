import type { Categoria } from "../../../../domain/categoria/categoria.types";

interface Props {
  categorias: Categoria[];
}

export default function CategoriaList({ categorias }: Props) {
  if (categorias.length === 0) {
    return (
      <p className="text-xs text-[var(--color-text-muted)] py-6 text-center m-0">
        No hay categorías registradas.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-0 m-0 list-none">
      {categorias.map((categoria) => (
        <li
          key={categoria.id}
          className="bg-black/20 hover:bg-black/40 border border-white/5 hover:border-[var(--color-accent)]/40 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between space-y-3 group"
        >
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <strong className="text-white font-semibold text-sm group-hover:text-[var(--color-accent)] transition-colors">
                {categoria.nombre}
              </strong>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-accent)] bg-[#32113d] px-2 py-0.5 rounded-full border border-[var(--color-border)]">
                {categoria.estado}
              </span>
            </div>

            {categoria.descripcion && (
              <p className="text-xs text-[var(--color-text-muted)] m-0 line-clamp-2">
                {categoria.descripcion}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}