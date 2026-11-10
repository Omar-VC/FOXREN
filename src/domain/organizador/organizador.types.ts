export interface Organizador {
  id: string;
  nombre: string;
  contactoPublico?: string;
  /** Complejo dueño del organizador. Sin valor = organizador general (creado por el superadmin). */
  complejoId?: string;
  activo: boolean;
  fechaCreacion: Date;
}
