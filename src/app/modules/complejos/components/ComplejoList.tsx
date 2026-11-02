import type { Complejo } from "../../../../domain/complejo/complejo.types";

interface Props {
  complejos: Complejo[];
}

export default function ComplejoList({ complejos }: Props) {
  if (complejos.length === 0) {
    return (
      <div className="space-y-3">
        <div className="border-b border-[var(--color-border)] pb-3">
          <h3 className="text-base font-bold text-white tracking-wide">
            Complejos Registrados
          </h3>
        </div>
        <p className="text-xs text-slate-400 italic py-8 text-center bg-white/[0.02] rounded-xl border border-[var(--color-border)]">
          No hay complejos registrados actualmente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <h3 className="text-base font-bold text-white tracking-wide">
          Complejos Registrados
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          {complejos.length} {complejos.length === 1 ? "complejo" : "complejos"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {complejos.map((complejo) => (
          <article
            key={complejo.id}
            className="group relative bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-surface)]/80 border border-[var(--color-border)] hover:border-slate-500 rounded-xl p-4 shadow-sm transition-all duration-200 flex flex-col justify-between gap-3"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-white group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
                  {complejo.nombre}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 uppercase tracking-wider shrink-0">
                  {complejo.estado}
                </span>
              </div>

              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                📍 <span>{complejo.ciudad}, {complejo.provincia}</span>
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                🎾 Canchas: <strong className="text-slate-200 font-semibold">{complejo.cantidadCanchas}</strong>
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
