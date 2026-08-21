export type EstadoLlave =
  | "disponible"
  | "utilizada"
  | "expirada"
  | "cancelada";

export interface Llave {
  id: string;

  codigo: string;

  estado: EstadoLlave;

  fechaEmision: Date;
  fechaExpiracion: Date;

  torneoId?: string;
}