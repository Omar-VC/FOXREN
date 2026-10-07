import { Routes, Route } from "react-router-dom";
import AdminLoginPage from "../pages/AdminLoginPage";
import AdminLayout from "../components/AdminLayout";
import AdminGuard from "../components/AdminGuard";
import AdminInicioPage from "../pages/AdminInicioPage";
import AdminCircuitosPage from "../../modules/circuitos/pages/AdminCircuitosPage";
import AdminComplejosPage from "../../modules/complejos/pages/AdminComplejosPage";
import AdminTorneosPage from "../../modules/torneos/pages/AdminTorneosPage";
import AdminCategoriasPage from "../../modules/categorias/pages/AdminCategoriasPage";
import AdminSolicitudesRegistroPage from "../../modules/unirse/pages/AdminSolicitudesRegistroPage";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />

      <Route
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route path="/" element={<AdminInicioPage />} />
        <Route path="/circuitos" element={<AdminCircuitosPage />} />
        <Route path="/torneos" element={<AdminTorneosPage />} />
        <Route path="/jugadores" element={<div>Administrar jugadores</div>} />
        <Route path="/ranking" element={<div>Administrar ranking</div>} />
        <Route path="/complejos" element={<AdminComplejosPage />} />
        <Route path="/categorias" element={<AdminCategoriasPage />} />
        <Route path="/solicitudes" element={<AdminSolicitudesRegistroPage />} />
      </Route>
    </Routes>
  );
}
