import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 py-6">
      {/* Hero Section con estilo translúcido */}
      <section className="relative overflow-hidden rounded-3xl border border-fox-border/60 bg-fox-surface/40 backdrop-blur-md p-8 md:p-16 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-[var(--color-primary)]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-96 h-96 bg-fox-neon/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-fox-neon/30 bg-fox-neon/10 text-fox-neon text-xs font-extrabold uppercase tracking-widest shadow-inner backdrop-blur-sm">
            <span>⚡ Pádel de Alto Rendimiento</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            La plataforma definitiva para tus <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-fox-neon">Torneos y Circuitos</span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Gestioná competencias, descubrí complejos de pádel de primer nivel, seguí las tablas de posiciones en tiempo real y competí en los mejores circuitos.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/torneos"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-fox-neon text-fox-bg font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-yellow-500/20 hover:scale-105 transition-all"
            >
              <span>Ver Torneos Activos</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              to="/unirse"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-fox-border bg-white/[0.04] backdrop-blur-md text-white font-bold text-sm hover:bg-white/[0.08] hover:border-fox-neon/40 transition-all"
            >
              <span>Unirme como Jugador / Complejo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Grid de Secciones / Accesos Rápidos con efecto cristal transparente */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Circuitos */}
        <Link
          to="/circuitos"
          className="group relative rounded-2xl border border-fox-border/60 bg-fox-surface/40 backdrop-blur-md p-6 hover:border-fox-neon/50 hover:bg-fox-surface/70 transition-all duration-300 shadow-xl"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-fox-neon mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-fox-neon transition-colors">
            Circuitos Oficiales
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Explora los circuitos activos, sedes asociadas y calendarios anuales de competencia en tu región.
          </p>
        </Link>

        {/* Card 2: Torneos */}
        <Link
          to="/torneos"
          className="group relative rounded-2xl border border-fox-border/60 bg-fox-surface/40 backdrop-blur-md p-6 hover:border-fox-neon/50 hover:bg-fox-surface/70 transition-all duration-300 shadow-xl"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-fox-neon mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-fox-neon transition-colors">
            Torneos & Categorías
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Inscríbete en torneos abiertos, consulta las zonas, cruces de playoffs y resultados en tiempo real.
          </p>
        </Link>

        {/* Card 3: Ranking */}
        <Link
          to="/ranking"
          className="group relative rounded-2xl border border-fox-border/60 bg-fox-surface/40 backdrop-blur-md p-6 hover:border-fox-neon/50 hover:bg-fox-surface/70 transition-all duration-300 shadow-xl"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-fox-neon mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-fox-neon transition-colors">
            Ranking de Jugadores
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Consulta los puntajes acumulados, la tabla de posiciones general y la evolución de cada pareja.
          </p>
        </Link>
      </section>

      {/* Banner inferior translúcido */}
      <section className="rounded-2xl border border-fox-border/60 bg-fox-surface/40 backdrop-blur-md p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-xl font-black text-white tracking-wide">
            ¿Tenés un complejo o sos organizador?
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Suma tu complejo a la red FOXREN para digitalizar la gestión de canchas, inscripciones y cuadros de competencia de forma profesional.
          </p>
        </div>
        <Link
          to="/unirse"
          className="px-6 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-fox-border text-white text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap backdrop-blur-sm"
        >
          Registrar Solicitud
        </Link>
      </section>
    </div>
  );
}