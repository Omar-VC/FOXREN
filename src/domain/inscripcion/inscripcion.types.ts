export type EstadoInscripcion =
  | "PENDIENTE"
  | "APROBADO"
  | "RECHAZADO"
  | "CANCELADA"
  | "confirmada"
  | "pendiente"
  | "cancelada"
  | "rechazada";

export interface Inscripcion {
  id: string;
  competenciaId: string;
  parejaId: string;
  estado: EstadoInscripcion;
  fechaInscripcion: Date | any;
  montoAbonado?: number;
  comprobanteUrl?: string;
}