import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./layout/Layout";
import { InicioPage } from "./features/inicio/pages/InicioPage";
import { CompetenciasPage } from "./features/competencias/pages/CompetenciasPage";
import { JugadoresPage } from "./features/jugadores/pages/JugadoresPage";
import { ParejasPage } from "./features/parejas/pages/ParejasPage";
import { TorneosPage } from "./features/torneos/pages/TorneosPage";
import { RankingPage } from "./features/ranking/pages/RankingPage";
import { AdminDashboard } from "./features/admin/pages/AdminDashboard";
import { AuthPage } from "./features/auth/pages/AuthPage";
import { UnirsePage } from "./features/unirse/pages/UnirsePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<InicioPage />} />
          <Route path="competencias" element={<CompetenciasPage />} />
          <Route path="jugadores" element={<JugadoresPage />} />
          <Route path="parejas" element={<ParejasPage />} />
          <Route path="torneos" element={<TorneosPage />} />
          <Route path="ranking" element={<RankingPage />} />
          <Route path="unirse" element={<UnirsePage />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="auth" element={<AuthPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

