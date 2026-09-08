export type EstadoOrganizador =
  | "activo"
  | "inactivo";

export interface Organizador {
  id?: string;
  dniCuit: string;
  nombreCompleto: string;
  clubSede: string;
  telefono: string;
  localidad: string;
  estado: 'activo' | 'inactivo';
  fechaRegistro?: Date;
}