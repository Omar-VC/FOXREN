// src/infrastructure/mappers/competencia.mapper.ts

import type { Competencia } from "../../domain/competencia/competencia.types";

export const competenciaMapper = {
  toFirestore(competencia: Competencia) {
    return {
      torneoId: competencia.torneoId,
      nombre: competencia.nombre,
      descripcion: competencia.descripcion ?? null,
      categoriaId: competencia.categoriaId,
      tipoReglaCategoria: competencia.tipoReglaCategoria,
      valorReglaCategoria: competencia.valorReglaCategoria,
      estado: competencia.estado,
      fechaInicio: competencia.fechaInicio,
      fechaFin: competencia.fechaFin,
      genero: competencia.genero,
      cupoMaximoParejas: competencia.cupoMaximoParejas,
      precioInscripcionPorPareja: competencia.precioInscripcionPorPareja,
      parejasClasificanPorZona: competencia.parejasClasificanPorZona ?? 2,
    };
  },

  fromFirestore(id: string, doc: any): Competencia {
    return {
      id,
      torneoId: doc.torneoId,
      nombre: doc.nombre,
      descripcion: doc.descripcion ?? undefined,
      categoriaId: doc.categoriaId,
      tipoReglaCategoria: doc.tipoReglaCategoria ?? "individual",
      valorReglaCategoria: doc.valorReglaCategoria ?? 0,
      estado: doc.estado ?? "inscripciones_abiertas",
      fechaInicio: doc.fechaInicio?.toDate
        ? doc.fechaInicio.toDate()
        : new Date(doc.fechaInicio),
      fechaFin: doc.fechaFin?.toDate
        ? doc.fechaFin.toDate()
        : new Date(doc.fechaFin),
      genero: doc.genero ?? "MASCULINO",
      cupoMaximoParejas: doc.cupoMaximoParejas ?? 16,
      precioInscripcionPorPareja: doc.precioInscripcionPorPareja ?? 0,
      parejasClasificanPorZona: doc.parejasClasificanPorZona ?? 2,
    };
  },
};
