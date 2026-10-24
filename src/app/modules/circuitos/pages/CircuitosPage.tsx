import { useCircuitos } from "../hooks/useCircuitos";
import { Link } from "react-router-dom";

export default function CircuitosPage() {
  const { circuitos, cargando, error } = useCircuitos();

  if (cargando) {
    return (
      <section className="p-8 text-center">
        <p className="text-muted">Cargando circuitos disponibles...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Cabecera de la sección pública */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#660090] to-[#32113d] border border-[var(--color-border)] flex items-center justify-center shadow-lg text-2xl">
            🏆
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white m-0">
              Circuitos de Pádel
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] m-0">
              Explorá los circuitos oficiales, complejos adheridos y competencias activas.
            </p>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 font-medium">{error}</p>}

      {!cargando && !error && circuitos.length === 0 && (
        <div className="fox-card text-center py-12">
          <p className="text-muted">No hay circuitos registrados en este momento.</p>
        </div>
      )}

      {/* Grilla de Circuitos */}
      <div className="fox-card-grid">
        {circuitos.map((circuito) => (
          <Link
            key={circuito.id}
            to={`/circuitos/${circuito.id}`}
            className="fox-card group block no-underline transition-all hover:border-[var(--color-accent)]"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Logo / Emblema del circuito */}
              <div className="w-14 h-14 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center justify-center text-xl font-bold text-[var(--color-accent)] group-hover:scale-105 transition-transform shrink-0 shadow-md overflow-hidden">
                {circuito.logoUrl ? (
                  <img src={circuito.logoUrl} alt={circuito.nombre} className="w-full h-full object-cover" />
                ) : (
                  circuito.nombre.charAt(0).toUpperCase()
                )}
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#32113d] text-[var(--color-accent)] border border-[var(--color-border)]">
                Temp. {circuito.temporada}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <h2 className="text-lg font-bold text-white group-hover:text-[var(--color-accent)] transition-colors m-0">
                {circuito.nombre}
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 m-0 leading-relaxed">
                {circuito.descripcion || "Circuito oficial de pádel amateur para gestión de competencias y rankings."}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-accent)] font-semibold">
              <span>Ver complejos y torneos</span>
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}