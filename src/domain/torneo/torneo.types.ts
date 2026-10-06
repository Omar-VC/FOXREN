export type EstadoTorneo =
  | "pendiente"
  | "publicado"
  | "en_curso"
  | "finalizado"
  | "cancelado";

export type ModalidadTorneo =
  | "presencial";

export interface Torneo {
  id: string;

  nombre: string;

  circuitoId: string;

  complejoId: string;

  descripcion?: string;

  fechaInicio: Date;

  fechaFin?: Date;

  montoInscripcionPorPareja?: number;

  cupoMaximoParejas?: number;

  modalidad: ModalidadTorneo;

  premios?: string;

  reglamento?: string;

  contactoOrganizador: string;

  imagenUrl?: string;

  estado: EstadoTorneo;

  puntajeRanking?: number;

  fechaCreacion: Date;
}