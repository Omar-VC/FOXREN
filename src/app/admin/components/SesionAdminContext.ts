import { createContext, useContext } from "react";

import type { SesionAdmin } from "../../../domain/usuario/usuario.types";

export const SesionAdminContext = createContext<SesionAdmin | null>(null);

/** Sesión del panel. Solo se usa dentro de AdminGuard, que ya garantiza que existe. */
export function useSesionAdmin(): SesionAdmin {
  const sesion = useContext(SesionAdminContext);
  if (!sesion) throw new Error("useSesionAdmin se usó fuera de AdminGuard.");
  return sesion;
}
