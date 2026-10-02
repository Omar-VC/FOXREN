import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./layout/Layout";
import { InicioPage } from "./features/inicio/pages/InicioPage";
import { TorneosPage } from "./features/torneos/public/TorneosPage";
import { TorneoDetallePublico } from "./features/torneos/public/TorneoDetallePublico";
import { RankingPage } from "./features/ranking/pages/RankingPage";
import { UnirsePage } from "./features/unirse/pages/UnirsePage";
import { AdminDashboard } from "./features/admin/pages/AdminDashboard";
import { AuthPage } from "./features/auth/pages/AuthPage";
import { CircuitosPage } from "./features/circuitos/pages/CircuitosPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* NAVEGACIÓN PÚBLICA (Usa el Layout con Navbar pública) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<InicioPage />} />
          <Route path="circuitos" element={<CircuitosPage />} />
          
          {/* Rutas de Torneos */}
          <Route path="torneos" element={<TorneosPage />} />
          <Route path="torneos/:torneoId" element={<TorneoDetallePublico />} />

          <Route path="ranking" element={<RankingPage />} />
          <Route path="unirse" element={<UnirsePage />} />
        </Route>

        {/* ACCESO PRIVADO ADMIN (Ruta directa/oculta sin Layout público) */}
        <Route path="/foxren-admin" element={<AdminDashboard />} />
        <Route path="/admin-login" element={<AuthPage />} />

        {/* Redirección por defecto si meten una ruta que no existe */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;