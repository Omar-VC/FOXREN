export type EstadoCategoria = "activa" | "inactiva";

export interface Categoria {
  id: string;

  nombre: string;
  descripcion?: string;

  estado: EstadoCategoria;
}