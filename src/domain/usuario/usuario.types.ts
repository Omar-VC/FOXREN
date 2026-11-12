export type RolUsuario = "superadmin" | "complejo";

/** Documento `usuarios/{uid}`: solo existe para cuentas que no son la del propietario. */
export interface PerfilUsuario {
  rol: RolUsuario;
  complejoId?: string;
  activo: boolean;
  /** Solo para mostrar en el panel; el login real lo maneja Firebase Auth. */
  email?: string;
}

/** Cuenta con su UID, tal como se lista en el panel del superadmin. */
export interface CuentaUsuario extends PerfilUsuario {
  uid: string;
}

/** Sesión ya resuelta del panel de administración. */
export interface SesionAdmin {
  uid: string;
  rol: RolUsuario;
  /** Presente solo cuando el rol es "complejo". */
  complejoId?: string;
}
