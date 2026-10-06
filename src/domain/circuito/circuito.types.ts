export type EstadoCircuito =
  | "activo"
  | "inactivo"
  | "finalizado";

export interface Circuito {
  id: string;

  nombre: string;

  descripcion?: string;

  temporada: string;

  logoUrl?: string;

  estado: EstadoCircuito;

  fechaCreacion: Date;
}