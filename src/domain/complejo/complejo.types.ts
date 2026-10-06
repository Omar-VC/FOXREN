export type EstadoComplejo =
  | "activo"
  | "inactivo";

export interface Complejo {
  id: string;

  nombre: string;

  circuitoId: string;

  ciudad: string;

  provincia: string;

  direccion?: string;

  ubicacion?: string;

  telefono?: string;

  cantidadCanchas: number;

  tipoCanchas?: string;

  servicios?: string[];

  estado: EstadoComplejo;

  fechaCreacion: Date;
}