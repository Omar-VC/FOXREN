import type { TipoFormatoCompetencia } from "./competencia.formato.types";


export type EstadoCompetencia =
  | "borrador"
  | "inscripciones_abiertas"
  | "inscripciones_cerradas"
  | "en_curso"
  | "finalizada"
  | "cancelada";

export type GeneroCompetencia = "MASCULINO" | "FEMENINO" | "MIXTO";

export type TipoReglaCategoria = "individual" | "suma";

export type CriterioDesempateZona =
  | "victorias"
  | "diferencia_sets"
  | "diferencia_games";

export interface ReglamentoCompetencia {
  origen: "foxren" | "reglamento_oficial" | "propuesta_organizador";
  referencia: string;
  estado: "pendiente_revision" | "aprobado";
  criteriosDesempate: CriterioDesempateZona[];
  empatePersistente:
    | "partido_desempate"
    | "enfrentamiento_directo"
    | "sorteo"
    | "resolucion_administrativa";
}

export interface Competencia {
  id: string;

  torneoId: string;

  nombre: string;

  descripcion?: string;

  categoriaId: string;

  tipoReglaCategoria: TipoReglaCategoria;

  formato: TipoFormatoCompetencia;

  valorReglaCategoria: number;

  genero: GeneroCompetencia;

  estado: EstadoCompetencia;

  fechaInicio: Date;

  fechaFin: Date;

  cupoMaximoParejas: number;

  precioInscripcionPorPareja: number;

  parejasClasificanPorZona?: number;

  /** Regla deportiva acordada para esta competencia; opcional en documentos históricos. */
  reglamento?: ReglamentoCompetencia;

  organizadorIds?: string[];

  /** Contador administrativo para serializar altas y validar el cupo. */
  parejasActivasCount?: number;

  /** Evita que dos procesos creen simultáneamente zonas para la competencia. */
  zonasGeneradas?: boolean;
}
