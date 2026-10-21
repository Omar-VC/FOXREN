import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Logo from "../assets/logo.svg";

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
      <header className="public-header">
        <div className="public-header-inner">
        <Link to="/" className="public-brand">
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
          className="public-menu-toggle"
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

        {/* Menú Desktop */}
        <nav className="public-nav">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`public-nav-link ${isActive ? "is-active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        </div>
      </header>

      {/* Backdrop para mobile */}
      <div
        className={`public-menu-backdrop ${menuOpen ? "is-open" : ""}`}
        aria-hidden="true"
        onClick={() => setMenuOpen(false)}
      />

      {/* Drawer Menú Mobile */}
      <aside
        id="public-mobile-menu"
        className={`public-mobile-menu ${menuOpen ? "is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="public-mobile-menu-content">
          <div className="public-mobile-menu-header">
            <div className="public-mobile-brand">
              <img src={Logo} alt="" />
              <span>FOXREN</span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="public-mobile-close"
              aria-label="Cerrar menú"
            >
              ✕
            </button>
          </div>

          <nav className="public-mobile-nav">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`public-mobile-nav-link ${isActive ? "is-active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="public-mobile-menu-footer">
          Plataforma de Torneos Deportivos
        </div>
      </aside>

      {/* Contenido Dinámico de las Rutas */}
      <main className="public-main flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
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
