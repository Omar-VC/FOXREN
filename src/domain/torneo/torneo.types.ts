export type EstadoTorneo =
  | "borrador"
  | "abierto"
  | "en_curso"
  | "finalizado"
  | "cancelado";

export interface Torneo {
  id: string;

  nombre: string;
  descripcion?: string;

  circuitoId: string;
  organizadorIds: string[];

  fechaInicio: Date;
  fechaFin: Date;

  estado: EstadoTorneo;

  llaveId: string;
}