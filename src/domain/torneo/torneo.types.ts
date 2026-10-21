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

  organizadorIds?: string[];

  /** Legacy contact retained for reading old documents; new records use organizadorIds. */
  contactoOrganizador?: string;

  imagenUrl?: string;

  estado: EstadoTorneo;

  puntajeRanking?: number;

  fechaCreacion: Date;
}
