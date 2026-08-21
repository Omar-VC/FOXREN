export type EstadoInscripcion =
  | "pendiente"
  | "confirmada"
  | "cancelada"
  | "rechazada";

export interface Inscripcion {
  id: string;

  competenciaId: string;
  parejaId: string;

  estado: EstadoInscripcion;

  fechaInscripcion: Date;
}