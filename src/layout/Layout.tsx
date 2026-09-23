import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Logo from "../assets/logo.svg";

export const Layout: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Enlaces públicos de navegación (se elimina "Jugadores")
  const navLinks = [
    { to: "/", label: "Inicio" },
    { to: "/circuitos", label: "Circuitos" },
    { to: "/torneos", label: "Torneos" },
    { to: "/ranking", label: "Ranking" },
    { to: "/unirse", label: "Unirme" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-fox-bg text-slate-100 font-sans selection:bg-fox-neon selection:text-fox-bg">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-fox-surface/90 backdrop-blur-md border-b border-fox-border/60 shadow-lg px-4 md:px-8 py-3.5 flex items-center justify-between">
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

        {/* Botón hamburguesa (mobile) */}
        <button
          className="md:hidden p-2 text-fox-muted hover:text-white focus:outline-none transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú de navegación"
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

        {/* Menú Desktop */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-fox-neon text-fox-bg shadow-fox-glow font-bold"
                    : "text-fox-muted hover:text-white hover:bg-fox-card/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Backdrop para mobile */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Drawer Menú Mobile */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-4/5 max-w-xs bg-fox-surface border-r border-fox-border shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col justify-between ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between pb-6 border-b border-fox-border/50 mb-6">
            <div className="flex items-center gap-2">
              <img src={Logo} alt="Logo" className="h-7 w-auto" />
              <span className="text-lg font-extrabold text-white">FOXREN</span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-fox-muted hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-fox-neon text-fox-bg font-bold shadow-fox-glow"
                      : "text-fox-muted hover:text-white hover:bg-fox-card"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-fox-border/50 text-xs text-fox-muted text-center">
          Plataforma de Torneos Deportivos
        </div>
      </aside>

      {/* Contenido Dinámico de las Rutas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <Outlet />
      </main>

      {/* Footer Pro */}
      <footer className="border-t border-fox-border/40 bg-fox-surface/40 py-6 text-center text-xs text-fox-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} FOXREN. Plataforma de Alto Rendimiento Deportivo.</p>
          <div className="flex gap-4 text-fox-muted">
            <span className="hover:text-fox-neon cursor-pointer transition">Términos</span>
            <span>•</span>
            <span className="hover:text-fox-neon cursor-pointer transition">Privacidad</span>
          </div>
        </div>
      </footer>
    </div>
  );
};