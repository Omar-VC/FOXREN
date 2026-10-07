import { Routes, Route } from "react-router-dom";

import { Layout } from "../../layout/Layout";
import AdminRoutes from "../admin/routes/AdminRoutes";
import CircuitosPage from "../modules/circuitos/pages/CircuitosPage";
import CircuitoDetallePage from "../modules/circuitos/pages/CircuitoDetallePage";
import TorneosPage from "../modules/torneos/pages/TorneosPage";
import TorneoDetallePage from "../modules/torneos/pages/TorneoDetallePage";
import UnirsePage from "../modules/unirse/pages/UnirsePage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Área pública */}
      <Route element={<Layout />}>
        <Route path="/" element={<div>Inicio</div>} />
        <Route path="/circuitos" element={<CircuitosPage />} />
        <Route
          path="/circuitos/:circuitoId"
          element={<CircuitoDetallePage />}
        />
        <Route path="/torneos" element={<TorneosPage />} />
        <Route path="/torneos/:torneoId" element={<TorneoDetallePage />} />
        <Route path="/unirse" element={<UnirsePage />} />
      </Route>

      {/* Área administrativa */}
      <Route path="/admin/*" element={<AdminRoutes />} />
    </Routes>
  );
}
