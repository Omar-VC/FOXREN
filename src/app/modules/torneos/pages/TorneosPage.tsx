import { Link } from "react-router-dom";
import { useTorneos } from "../hooks/useTorneos";

export default function TorneosPage() {
  const { torneos, cargando, error } = useTorneos();

  if (cargando) {
    return (
      <section className="p-8 text-center">
        <p className="text-muted">Cargando torneos disponibles...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Cabecera impactante de la sección */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#660090] to-[#32113d] border border-[var(--color-border)] flex items-center justify-center shadow-lg text-2xl">
            🏆
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white m-0">
              Torneos de Pádel
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] m-0">
              Consultá las competencias oficiales, fechas de inicio, modalidades y resultados en tiempo real.
            </p>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 font-medium">{error}</p>}

      {!cargando && !error && torneos.length === 0 && (
        <div className="fox-card text-center py-12">
          <p className="text-muted">No hay torneos registrados en este momento.</p>
        </div>
      )}

      {torneos.length > 0 && (
        <div className="fox-card-grid">
          {torneos.map((torneo) => {
            const fechaInicioTexto = torneo.fechaInicio
              ? torneo.fechaInicio instanceof Date
                ? torneo.fechaInicio.toLocaleDateString()
                : String(torneo.fechaInicio)
              : "A confirmar";

            return (
              <Link
                key={torneo.id}
                to={`/torneos/${torneo.id}`}
                className="fox-card group block no-underline transition-all hover:border-[var(--color-accent)] space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold text-white group-hover:text-[var(--color-accent)] transition-colors m-0">
                    {torneo.nombre}
                  </h2>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#32113d] text-[var(--color-accent)] border border-[var(--color-border)] shrink-0">
                    {torneo.estado ?? "Activo"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[var(--color-text-muted)]">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider">Modalidad</span>
                    <strong className="text-white font-medium">{torneo.modalidad || "General"}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider">Inicio</span>
                    <strong className="text-white font-medium">{fechaInicioTexto}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-accent)] font-semibold">
                  <span>Ver categorías y zonas</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}