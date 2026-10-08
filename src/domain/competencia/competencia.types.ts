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
}
