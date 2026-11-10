export type RolUsuario = "superadmin" | "complejo";

/** Documento `usuarios/{uid}`: solo existe para cuentas que no son la del propietario. */
export interface PerfilUsuario {
  rol: RolUsuario;
  complejoId?: string;
  activo: boolean;
}

/** Sesión ya resuelta del panel de administración. */
export interface SesionAdmin {
  uid: string;
  rol: RolUsuario;
  /** Presente solo cuando el rol es "complejo". */
  complejoId?: string;
}
