// src/domain/competencia/competencia.rules.ts

import type { Competencia } from "./competencia.types";

// --- Verificaciones de Estado ---

export function competenciaAceptaInscripciones(
  competencia: Competencia
): boolean {
  return competencia.estado === "inscripciones_abiertas";
}

export function competenciaEstaEnCurso(
  competencia: Competencia
): boolean {
  return competencia.estado === "en_curso";
}

export function competenciaEstaFinalizada(
  competencia: Competencia
): boolean {
  return competencia.estado === "finalizada";
}

// --- Validaciones de Formulario / Datos de Negocio ---

export interface ValidacionCompetenciaResultado {
  esValido: boolean;
  errores: string[];
}

export function validarDatosCompetencia(
  datos: Partial<Competencia>
): ValidacionCompetenciaResultado {
  const errores: string[] = [];

  if (!datos.nombre || datos.nombre.trim().length === 0) {
    errores.push("El nombre de la competencia/categoría es obligatorio.");
  }

  if (!datos.categoriaId) {
    errores.push("Debes seleccionar una categoría oficial.");
  }

  if (!datos.genero) {
    errores.push("Debes seleccionar el género/rama (Masculino, Femenino o Mixto).");
  }

  if (!datos.cupoMaximoParejas || datos.cupoMaximoParejas <= 0) {
    errores.push("El cupo máximo debe ser mayor a 0 parejas.");
  }

  if (datos.precioInscripcionBase === undefined || datos.precioInscripcionBase < 0) {
    errores.push("El precio de inscripción no puede ser un valor negativo.");
  }

  return {
    esValido: errores.length === 0,
    errores,
  };
}