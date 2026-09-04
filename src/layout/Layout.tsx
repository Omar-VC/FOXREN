import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Logo from "../assets/logo.svg";

export const Layout: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Inicio" },
    { to: "/competencias", label: "Competencias" },
    { to: "/jugadores", label: "Jugadores" },
    { to: "/parejas", label: "Parejas" },
    { to: "/torneos", label: "Torneos" },
    { to: "/ranking", label: "Ranking" },
    { to: "/unirse", label: "Unirse" },
    { to: "/admin", label: "Admin" },
    { to: "/auth", label: "Login" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--overlay-dark)] font-[var(--font-family-base)]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-[var(--overlay-dark)] backdrop-blur-md shadow-[0_2px_4px_rgba(0,0,0,0.4)] relative z-30">
        <div className="flex items-center gap-2 md:gap-3">
          <img src={Logo} alt="Logo FOXREN" className="h-6 md:h-7 lg:h-10 w-auto" />
          <h1 className="text-base md:text-lg lg:text-2xl font-bold text-[var(--color-primary-light)]">
            FOXREN
          </h1>
        </div>

        {/* Botón hamburguesa (mobile) */}
        <button
          className="md:hidden text-[var(--color-light)] focus:outline-none text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Menú desktop */}
        <nav className="hidden md:flex gap-2 md:gap-3 lg:gap-4 text-[var(--color-light)] text-xs md:text-sm lg:text-base">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-1 md:px-2 lg:px-3 py-1 md:py-2 rounded-[var(--border-radius)] transition-all duration-300 ${
                location.pathname === link.to
                  ? "bg-[var(--color-primary)] text-[var(--color-light)] shadow-[var(--shadow-card)]"
                  : "hover:bg-[var(--overlay-light)] hover:text-[var(--color-primary-light)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Overlay con fade */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          menuOpen ? "opacity-50 z-20" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Menú mobile con slide */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-2/3 bg-[var(--color-dark)] text-[var(--color-light)] shadow-[var(--shadow-card)] transform transition-transform duration-300 z-30 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col p-6 gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-3 rounded-[var(--border-radius)] transition-all duration-300 ${
                location.pathname === link.to
                  ? "bg-[var(--color-primary)] text-[var(--color-light)]"
                  : "hover:bg-[var(--overlay-light)] hover:text-[var(--color-primary-light)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Contenido dinámico */}
      <main className="flex-1 p-6 relative z-0">
        <Outlet />
      </main>
    </div>
  );
};
