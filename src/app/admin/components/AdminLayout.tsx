import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { authRepository } from "../../../infrastructure/repositories/authRepository";

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  async function cerrarSesion() {
    await authRepository.cerrarSesion();
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <span className="admin-brand-mark" aria-hidden="true">F</span>
            <span>FOXREN <small>ADMINISTRACIÓN</small></span>
          </div>

          <button
            className="admin-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Cerrar menú administrativo" : "Abrir menú administrativo"}
            aria-expanded={menuOpen}
            aria-controls="admin-navigation"
          >
            <span className="admin-menu-toggle-icon" aria-hidden="true">
              {menuOpen ? "×" : "☰"}
            </span>
            <span className="admin-menu-toggle-label">Menú</span>
          </button>

          <nav
            id="admin-navigation"
            className={`admin-nav ${menuOpen ? "is-open" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <NavLink to="/admin" end>
              Inicio
            </NavLink>

            <NavLink to="/admin/circuitos">Circuitos</NavLink>

            <NavLink to="/admin/complejos">Complejos</NavLink>

            <NavLink to="/admin/torneos">Torneos</NavLink>

            <NavLink to="/admin/categorias">Categorías</NavLink>

            <NavLink to="/admin/organizadores">Organizadores</NavLink>

            <NavLink to="/admin/jugadores">Jugadores</NavLink>

            <NavLink to="/admin/ranking">Ranking</NavLink>

            <NavLink to="/admin/solicitudes">Solicitudes</NavLink>
            <button className="admin-logout" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>
      <button
        className={`admin-menu-backdrop ${menuOpen ? "is-open" : ""}`}
        aria-label="Cerrar menú administrativo"
        tabIndex={menuOpen ? 0 : -1}
        onClick={() => setMenuOpen(false)}
      />

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
