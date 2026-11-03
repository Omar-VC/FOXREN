import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Logo from "../assets/logo.svg";
import heroImage from "../assets/images/agustin-tapia.webp";

// Enlaces públicos con iconos SVG profesionales
const navLinks = [
  {
    to: "/",
    label: "Inicio",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: "/circuitos",
    label: "Circuitos",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    to: "/torneos",
    label: "Torneos",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    to: "/ranking",
    label: "Ranking",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    to: "/unirse",
    label: "Unirme",
    isCTA: true,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
];

export const Layout: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-fox-bg text-slate-100 font-sans selection:bg-fox-neon selection:text-fox-bg relative overflow-x-hidden">
      
      {/* Fondo global de la app con la imagen corporativa nítida y un overlay oscuro elegante */}
      {/* Fondo global de la app con la imagen mucho más nítida y visible */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src={heroImage} 
          alt="Fondo FOXREN" 
          className="w-full h-full object-cover object-center opacity-60 filter contrast-110 saturate-110"
        />
        {/* Un gradiente mucho más sutil para que la foto luzca clara y definida */}
        <div className="absolute inset-0 bg-gradient-to-b from-fox-bg/80 via-fox-bg/50 to-fox-bg/85" />
      </div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 border-b border-fox-border/40 bg-fox-surface/60 backdrop-blur-xl px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={Logo} 
              alt="Logo FOXREN" 
              className="h-8 md:h-9 w-auto transition-transform duration-300 group-hover:scale-105" 
            />
            <span className="text-xl md:text-2xl font-black tracking-wider text-white group-hover:text-fox-neon transition-colors">
              FOXREN<span className="text-fox-neon">.</span>
            </span>
          </Link>

          <button
            className="lg:hidden p-2 rounded-xl border border-fox-border/60 bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            aria-expanded={menuOpen}
            aria-controls="public-mobile-menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;

              if (link.isCTA) {
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`ml-2 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
                      isActive
                        ? "bg-fox-neon text-fox-bg border border-fox-neon"
                        : "bg-gradient-to-r from-[var(--color-primary)] to-[#32113d] text-white border border-fox-neon/40 hover:border-fox-neon hover:scale-[1.02]"
                    }`}
                  >
                    <span className="opacity-90">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-white/[0.08] text-white border border-fox-border shadow-inner"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="opacity-75">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Backdrop para mobile */}
      <div
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
      />

      {/* Drawer Menú Mobile */}
      <aside
        id="public-mobile-menu"
        className={`fixed inset-y-0 right-0 z-50 w-80 max-w-full bg-fox-surface/90 backdrop-blur-xl border-l border-fox-border/60 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-fox-border/40">
            <div className="flex items-center gap-2.5">
              <img src={Logo} alt="" className="h-7 w-auto" />
              <span className="text-sm font-black text-white tracking-wider">
                FOXREN<span className="text-fox-neon">.</span>
              </span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
              aria-label="Cerrar menú"
            >
              ✕
            </button>
          </div>

          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    link.isCTA
                      ? "mt-2 bg-gradient-to-r from-[var(--color-primary)] to-[#32113d] text-white border border-fox-neon/40 shadow-md"
                      : isActive
                      ? "bg-white/[0.08] text-white border border-fox-border"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="text-fox-neon">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-5 border-t border-fox-border/40 bg-black/20 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            Plataforma de Torneos Deportivos de Alto Rendimiento
          </p>
        </div>
      </aside>

      {/* Contenido Dinámico de las Rutas (por encima del fondo global) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 relative z-10">
        <Outlet />
      </main>

      {/* Footer Pro */}
      <footer className="border-t border-fox-border/40 bg-fox-surface/40 backdrop-blur-md py-6 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} FOXREN. Plataforma de Alto Rendimiento Deportivo.</p>
          <div className="flex gap-4 text-slate-400">
            <span className="hover:text-fox-neon cursor-pointer transition">Términos</span>
            <span>•</span>
            <span className="hover:text-fox-neon cursor-pointer transition">Privacidad</span>
          </div>
        </div>
      </footer>
    </div>
  );
};