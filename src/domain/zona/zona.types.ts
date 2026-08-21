export type EstadoZona =
  | "pendiente"
  | "en_curso"
  | "finalizada";

export interface Zona {
  id: string;

  faseId: string;

  nombre: string;

  estado: EstadoZona;
}