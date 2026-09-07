// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./layout/Layout";
import { InicioPage } from "./features/inicio/pages/InicioPage";
import { CompetenciasPage } from "./features/competencias/pages/CompetenciasPage";
import { JugadoresPage } from "./features/jugadores/pages/JugadoresPage";
import { TorneosPage } from "./features/torneos/pages/TorneosPage";
import { RankingPage } from "./features/ranking/pages/RankingPage";
import { UnirsePage } from "./features/unirse/pages/UnirsePage";
import { AdminDashboard } from "./features/admin/pages/AdminDashboard";
import { AuthPage } from "./features/auth/pages/AuthPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* NAVEGACIÓN PÚBLICA (Usa el Layout con Navbar pública) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<InicioPage />} />
          <Route path="circuitos" element={<CompetenciasPage />} />
          <Route path="torneos" element={<TorneosPage />} />
          <Route path="ranking" element={<RankingPage />} />
          <Route path="jugadores" element={<JugadoresPage />} />
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
