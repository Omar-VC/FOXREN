import { Navigate } from "react-router-dom";

import { useSesionAdmin } from "./SesionAdminContext";

/** Envuelve una pantalla que solo puede ver el superadmin. */
export function SoloSuperadmin({ children }: { children: React.ReactNode }) {
  const { rol } = useSesionAdmin();
  if (rol !== "superadmin") return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

/** El complejo no tiene "Inicio" propio: va directo a sus torneos. */
export function InicioSegunRol({ children }: { children: React.ReactNode }) {
  const { rol } = useSesionAdmin();
  if (rol === "complejo") return <Navigate to="/admin/torneos" replace />;
  return <>{children}</>;
}
