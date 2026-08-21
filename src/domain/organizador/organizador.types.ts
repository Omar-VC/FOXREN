export type EstadoOrganizador =
  | "activo"
  | "inactivo";

export interface Organizador {
  id: string;

  nombre: string;
  apellido: string;

  email: string;

  estado: EstadoOrganizador;
}