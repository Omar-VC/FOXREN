// src/domain/competencia/competencia.types.ts

export type EstadoCompetencia =
  | "borrador"
  | "inscripciones_abiertas"
  | "inscripciones_cerradas"
  | "en_curso"
  | "finalizada"
  | "cancelada";

export type GeneroCompetencia = "MASCULINO" | "FEMENINO" | "MIXTO";

export interface Competencia {
  id: string;

  torneoId: string;

  nombre: string;
  descripcion?: string;

  categoriaId: string; // Ej: ID de 4ta, 5ta, Suma 11, etc.

  estado: EstadoCompetencia;

  fechaInicio: Date;
  fechaFin: Date;

  // --- Parámetros Configurables para la Competencia ---
  genero: GeneroCompetencia;

  cupoMaximoParejas: number; // Ej: 12, 16, 24, 32

  precioInscripcionBase: number; // Valor que cobra el organizador por pareja

  feeFoxrenPorPareja?: number; // Comisión/Canon de plataforma por pareja inscripta

  parejasClasificanPorZona?: number; // Ej: 2 parejas clasifican por cada grupo a playoffs
}