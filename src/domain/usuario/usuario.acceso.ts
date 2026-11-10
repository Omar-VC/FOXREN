import type { PerfilUsuario, SesionAdmin } from "./usuario.types.ts";

/** Rutas del panel (sin el prefijo /admin) a las que puede entrar un admin de complejo. */
export const RUTAS_COMPLEJO = ["/admin", "/admin/torneos", "/admin/organizadores"];

/**
 * Decide qué sesión de administración corresponde a una cuenta.
 * - El propietario es superadmin siempre, exista o no su documento en `usuarios`.
 * - Una cuenta de complejo necesita rol "complejo", complejoId y estar activa.
 * - Cualquier otro caso: sin acceso (null).
 */
export function resolverAcceso(
  uid: string,
  ownerUid: string,
  perfil: PerfilUsuario | null,
): SesionAdmin | null {
  if (uid === ownerUid) return { uid, rol: "superadmin" };
  if (!perfil || !perfil.activo) return null;
  if (perfil.rol === "complejo" && perfil.complejoId) {
    return { uid, rol: "complejo", complejoId: perfil.complejoId };
  }
  return null;
}
