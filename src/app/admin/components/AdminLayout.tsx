import { NavLink, Outlet } from "react-router-dom";

import { authRepository } from "../../../infrastructure/repositories/authRepository";

export default function AdminLayout() {
  async function cerrarSesion() {
    await authRepository.cerrarSesion();
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">FOXREN ADMIN</div>

          <nav className="admin-nav">
            <NavLink to="/admin" end>
              Inicio
            </NavLink>

            <NavLink to="/admin/circuitos">Circuitos</NavLink>

            <NavLink to="/admin/complejos">Complejos</NavLink>

            <NavLink to="/admin/torneos">Torneos</NavLink>

            <NavLink to="/admin/categorias">Categorías</NavLink>

            <NavLink to="/admin/jugadores">Jugadores</NavLink>

            <NavLink to="/admin/ranking">Ranking</NavLink>

            <NavLink to="/admin/solicitudes">Solicitudes</NavLink>
          </nav>

          <button className="admin-logout" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
