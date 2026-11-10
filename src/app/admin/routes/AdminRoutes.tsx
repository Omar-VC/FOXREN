import { Routes, Route } from "react-router-dom";
import AdminLoginPage from "../pages/AdminLoginPage";
import AdminLayout from "../components/AdminLayout";
import AdminGuard from "../components/AdminGuard";
import { InicioSegunRol, SoloSuperadmin } from "../components/RutasPorRol";
import AdminInicioPage from "../pages/AdminInicioPage";
import AdminCircuitosPage from "../../modules/circuitos/pages/AdminCircuitosPage";
import AdminComplejosPage from "../../modules/complejos/pages/AdminComplejosPage";
import AdminTorneosPage from "../../modules/torneos/pages/AdminTorneosPage";
import AdminTorneoDetallePage from "../../modules/torneos/pages/AdminTorneoDetallePage";
import AdminCategoriasPage from "../../modules/categorias/pages/AdminCategoriasPage";
import AdminSolicitudesRegistroPage from "../../modules/unirse/pages/AdminSolicitudesRegistroPage";
import AdminJugadoresPage from "../../modules/jugadores/pages/AdminJugadoresPage";
import AdminJugadorDetallePage from "../../modules/jugadores/pages/AdminJugadorDetallePage";
import CompetenciaAdminPage from "../../modules/torneos/pages/CompetenciaAdminPage";
import AdminOrganizadoresPage from "../../modules/organizadores/pages/AdminOrganizadoresPage";
import AdminRankingPage from "../../modules/ranking/pages/AdminRankingPage";

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
        {/* Compartidas: superadmin y admin de complejo */}
        <Route
          path="/"
          element={
            <InicioSegunRol>
              <AdminInicioPage />
            </InicioSegunRol>
          }
        />
        <Route path="/torneos" element={<AdminTorneosPage />} />
        <Route path="/torneos/:torneoId" element={<AdminTorneoDetallePage />} />
        <Route
          path="/torneos/:torneoId/competencias/:competenciaId"
          element={<CompetenciaAdminPage />}
        />
        <Route path="/organizadores" element={<AdminOrganizadoresPage />} />

        {/* Solo superadmin */}
        <Route path="/circuitos" element={<SoloSuperadmin><AdminCircuitosPage /></SoloSuperadmin>} />
        <Route path="/jugadores" element={<SoloSuperadmin><AdminJugadoresPage /></SoloSuperadmin>} />
        <Route path="/jugadores/:id" element={<SoloSuperadmin><AdminJugadorDetallePage /></SoloSuperadmin>} />
        <Route path="/ranking" element={<SoloSuperadmin><AdminRankingPage /></SoloSuperadmin>} />
        <Route path="/complejos" element={<SoloSuperadmin><AdminComplejosPage /></SoloSuperadmin>} />
        <Route path="/categorias" element={<SoloSuperadmin><AdminCategoriasPage /></SoloSuperadmin>} />
        <Route path="/solicitudes" element={<SoloSuperadmin><AdminSolicitudesRegistroPage /></SoloSuperadmin>} />
      </Route>
    </Routes>
  );
}
