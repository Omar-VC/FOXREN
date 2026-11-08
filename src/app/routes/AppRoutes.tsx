import { Routes, Route } from "react-router-dom";

import { Layout } from "../../layout/Layout";
import AdminRoutes from "../admin/routes/AdminRoutes";
import HomePage from "../modules/home/pages/HomePage";
import CircuitosPage from "../modules/circuitos/pages/CircuitosPage";
import CircuitoDetallePage from "../modules/circuitos/pages/CircuitoDetallePage";
import TorneosPage from "../modules/torneos/pages/TorneosPage";
import TorneoDetallePage from "../modules/torneos/pages/TorneoDetallePage";
import CompetenciaPublicaPage from "../modules/torneos/pages/CompetenciaPublicaPage";
import RankingPublicoPage from "../modules/ranking/pages/RankingPublicoPage";
import UnirsePage from "../modules/unirse/pages/UnirsePage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Área pública */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/circuitos" element={<CircuitosPage />} />
        <Route
          path="/circuitos/:circuitoId"
          element={<CircuitoDetallePage />}
        />
        <Route path="/torneos" element={<TorneosPage />} />
        <Route path="/torneos/:torneoId" element={<TorneoDetallePage />} />
        <Route
          path="/torneos/:torneoId/competencias/:competenciaId"
          element={<CompetenciaPublicaPage />}
        />
        <Route path="/ranking" element={<RankingPublicoPage />} />
        <Route path="/unirse" element={<UnirsePage />} />
      </Route>

      {/* Área administrativa */}
      <Route path="/admin/*" element={<AdminRoutes />} />
    </Routes>
  );
}
