import { useCircuitos } from "../hooks/useCircuitos";
import { Link } from "react-router-dom";

// Configuración de colores y acentos inspirados en las banderas provinciales
const getProvincialBadge = (nombre: string) => {
  const lower = nombre.toLowerCase();
  
  if (lower.includes("neuquén") || lower.includes("neuquen")) {
    return {
      sigla: "NEU",
      region: "Neuquén",
      // Inspirado en la bandera de Neuquén: azul, blanco y verde (con acento verde/cian)
      stripeColor: "from-blue-600 via-emerald-500 to-emerald-400",
      glow: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
    };
  }
  
  if (lower.includes("santiago") || lower.includes("santiagueño")) {
    return {
      sigla: "SGO",
      region: "Santiago del Estero",
      // Inspirado en la bandera de Santiago del Estero: rojo, blanco y negro
      stripeColor: "from-red-600 via-white to-neutral-900",
      glow: "border-red-500/40 text-red-400 bg-red-500/10",
    };
  }
  
  if (lower.includes("córdoba") || lower.includes("cordoba")) {
    return {
      sigla: "CBA",
      region: "Córdoba",
      // Inspirado en la bandera de Córdoba: rojo, blanco y celeste/azul
      stripeColor: "from-blue-500 via-white to-red-600",
      glow: "border-blue-500/40 text-blue-400 bg-blue-500/10",
    };
  }

  // Fallback por defecto
  return {
    sigla: "PRO",
    region: "Oficial",
    stripeColor: "from-purple-600 to-fox-neon",
    glow: "border-fox-neon/40 text-fox-neon bg-fox-neon/10",
  };
};

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
              Explorá los circuitos oficiales, complejos adheridos y competencias activas por región.
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
      <div className="fox-card-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {circuitos.map((circuito) => {
          const badge = getProvincialBadge(circuito.nombre);

          return (
            <Link
              key={circuito.id}
              to={`/circuitos/${circuito.id}`}
              className="fox-card group block no-underline transition-all hover:border-[var(--color-accent)] relative overflow-hidden bg-fox-surface/80 border border-fox-border p-6 rounded-2xl shadow-xl"
            >
              {/* Franja superior con los colores representativos de la bandera provincial */}
              <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${badge.stripeColor}`} />

              {/* Sutil brillo de fondo al hacer hover */}
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[var(--color-primary)]/10 rounded-full blur-2xl group-hover:bg-fox-neon/20 transition-all pointer-events-none" />

              <div className="flex items-start justify-between gap-4 relative z-10 pt-1">
                {/* Logo del circuito o sigla estilizada */}
                <div className="w-14 h-14 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center justify-center text-lg font-black text-white group-hover:scale-105 transition-transform shrink-0 shadow-md overflow-hidden">
                  {circuito.logoUrl ? (
                    <img src={circuito.logoUrl} alt={circuito.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span>{badge.sigla}</span>
                  )}
                </div>

                {/* Badge provincial y temporada */}
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${badge.glow}`}>
                    {badge.region}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/[0.04] text-slate-300 border border-fox-border">
                    Temp. {circuito.temporada}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 relative z-10">
                <h2 className="text-lg font-bold text-white group-hover:text-[var(--color-accent)] transition-colors m-0">
                  {circuito.nombre}
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 m-0 leading-relaxed">
                  {circuito.descripcion || "Circuito oficial de pádel amateur para gestión de competencias y rankings regionales."}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-accent)] font-semibold relative z-10">
                <span>Ver complejos y torneos</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}