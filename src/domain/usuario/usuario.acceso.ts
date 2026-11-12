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

export const LARGO_MINIMO_PASSWORD = 8;

/** Devuelve el mensaje de error, o null si los datos del nuevo acceso son válidos. */
export function validarNuevoAcceso(email: string, password: string): string | null {
  const correo = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return "Ingresá un email válido.";
  }
  if (password.length < LARGO_MINIMO_PASSWORD) {
    return `La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.`;
  }
  return null;
}

// Sin 0/O, 1/l/I: se leen mal cuando se la pasás a alguien por mensaje.
const ALFABETO_PASSWORD = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/** Arma una contraseña legible a partir de bytes aleatorios (los provee quien llama). */
export function passwordDesdeBytes(bytes: ArrayLike<number>): string {
  return Array.from(bytes, (byte) => ALFABETO_PASSWORD[byte % ALFABETO_PASSWORD.length]).join("");
}
