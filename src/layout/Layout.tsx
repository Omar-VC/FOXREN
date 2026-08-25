import React from "react";
import { Outlet, Link } from "react-router-dom";
import Logo from "../assets/logo.svg";

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[rgba(39,55,54,0.85)]">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-[rgba(39,55,54,0.85)] backdrop-blur-md shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3">
          <img src={Logo} alt="Logo FOXREN" className="h-10 w-auto" />
          <h1 className="text-2xl font-bold text-[var(--color-primary-light)]">
            FOXREN
          </h1>
        </div>
        <nav className="flex gap-4 text-white">
          <Link to="/">Inicio</Link>
          <Link to="/competencias">Competencias</Link>
          <Link to="/jugadores">Jugadores</Link>
          <Link to="/parejas">Parejas</Link>
          <Link to="/torneos">Torneos</Link>
          <Link to="/ranking">Ranking</Link>
          <Link to="/admin">Admin</Link>
          <Link to="/auth">Login</Link>
        </nav>
      </header>

      {/* Contenido dinámico */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};
