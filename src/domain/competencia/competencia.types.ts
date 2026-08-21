export type EstadoCompetencia =
  | "borrador"
  | "inscripciones_abiertas"
  | "inscripciones_cerradas"
  | "en_curso"
  | "finalizada"
  | "cancelada";

export interface Competencia {
  id: string;

  torneoId: string;

  nombre: string;
  descripcion?: string;

  categoriaId: string;

  estado: EstadoCompetencia;

  fechaInicio: Date;
  fechaFin: Date;
}