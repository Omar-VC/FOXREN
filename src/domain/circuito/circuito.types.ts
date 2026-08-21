export type EstadoCircuito = "activo" | "inactivo";

export interface Circuito {
  id: string;

  nombre: string;
  descripcion?: string;

  estado: EstadoCircuito;
}