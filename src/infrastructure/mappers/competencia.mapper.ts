// src/infrastructure/mappers/competencia.mapper.ts

import type { Competencia } from "../../domain/competencia/competencia.types";
import type { FormatoPartido } from "../../domain/partido/partido.types";
import { reglamentoCompetenciaEsValido } from "../../domain/competencia/competencia.reglamento.rules";

/** Si falta o es inválido, "mejor_de_3": es lo que el sistema asumía antes de existir este campo. */
function leerFormatoPartido(valor: unknown): FormatoPartido {
  return valor === "un_set" || valor === "mejor_de_3" ? valor : "mejor_de_3";
}

function convertirFecha(valor: unknown): Date {
  if (valor instanceof Date) return valor;
  if (
    valor !== null &&
    typeof valor === "object" &&
    "toDate" in valor &&
    typeof valor.toDate === "function"
  ) {
    return valor.toDate();
  }
  if (typeof valor === "string" || typeof valor === "number") {
    return new Date(valor);
  }
  return new Date(Number.NaN);
}

export const competenciaMapper = {
  toFirestore(competencia: Competencia) {
    return {
      torneoId: competencia.torneoId,
      nombre: competencia.nombre,
      descripcion: competencia.descripcion ?? null,
      categoriaId: competencia.categoriaId,
      formato: competencia.formato,
      tipoReglaCategoria: competencia.tipoReglaCategoria,
      valorReglaCategoria: competencia.valorReglaCategoria,
      estado: competencia.estado,
      fechaInicio: competencia.fechaInicio,
      fechaFin: competencia.fechaFin,
      genero: competencia.genero,
      cupoMaximoParejas: competencia.cupoMaximoParejas,
      precioInscripcionPorPareja: competencia.precioInscripcionPorPareja,
      parejasClasificanPorZona: competencia.parejasClasificanPorZona ?? 2,
      formatoPartidoZona: competencia.formatoPartidoZona ?? "mejor_de_3",
      formatoPartidoPlayoff: competencia.formatoPartidoPlayoff ?? "mejor_de_3",
      ...(competencia.reglamento ? { reglamento: competencia.reglamento } : {}),
      ...(competencia.organizadorIds !== undefined
        ? { organizadorIds: [...new Set(competencia.organizadorIds)] }
        : {}),
    };
  },

  toFirestorePatch(competencia: Partial<Competencia>) {
    const datos: Record<string, unknown> = {};
    const campos: Array<keyof Competencia> = [
      "torneoId",
      "nombre",
      "categoriaId",
      "tipoReglaCategoria",
      "valorReglaCategoria",
      "estado",
      "fechaInicio",
      "fechaFin",
      "genero",
      "cupoMaximoParejas",
      "precioInscripcionPorPareja",
      "parejasClasificanPorZona",
      "formatoPartidoZona",
      "formatoPartidoPlayoff",
      "reglamento",
      "formato",
      "organizadorIds",
    ];

    for (const campo of campos) {
      const valor = competencia[campo];
      if (valor === undefined) continue;
      datos[campo] = campo === "organizadorIds" && Array.isArray(valor)
        ? [...new Set(valor)]
        : valor;
    }

    if (competencia.descripcion !== undefined) {
      datos.descripcion = competencia.descripcion ?? null;
    }

    return datos;
  },

  fromFirestore(id: string, doc: Record<string, unknown>): Competencia {
    return {
      id,
      torneoId: doc.torneoId as string,
      nombre: doc.nombre as string,
      descripcion: typeof doc.descripcion === "string" ? doc.descripcion : undefined,
      categoriaId: doc.categoriaId as string,
      tipoReglaCategoria: (doc.tipoReglaCategoria ?? "individual") as Competencia["tipoReglaCategoria"],
      valorReglaCategoria: typeof doc.valorReglaCategoria === "number" ? doc.valorReglaCategoria : 0,
      estado: (doc.estado ?? "inscripciones_abiertas") as Competencia["estado"],
      formato: (doc.formato ?? "zonas_eliminacion_directa") as Competencia["formato"],
      fechaInicio: convertirFecha(doc.fechaInicio),
      fechaFin: convertirFecha(doc.fechaFin),
      genero: (doc.genero ?? "MASCULINO") as Competencia["genero"],
      cupoMaximoParejas: typeof doc.cupoMaximoParejas === "number" ? doc.cupoMaximoParejas : 16,
      precioInscripcionPorPareja: typeof doc.precioInscripcionPorPareja === "number" ? doc.precioInscripcionPorPareja : 0,
      parejasClasificanPorZona: typeof doc.parejasClasificanPorZona === "number" ? doc.parejasClasificanPorZona : 2,
      parejasActivasCount: Number.isInteger(doc.parejasActivasCount)
        ? doc.parejasActivasCount as number
        : undefined,
      formatoPartidoZona: leerFormatoPartido(doc.formatoPartidoZona),
      formatoPartidoPlayoff: leerFormatoPartido(doc.formatoPartidoPlayoff),
      zonasGeneradas: doc.zonasGeneradas === true,
      playoffGenerado: doc.playoffGenerado === true,
      semillaSorteo: typeof doc.semillaSorteo === "number" ? doc.semillaSorteo : undefined,
      campeonParejaId: typeof doc.campeonParejaId === "string" ? doc.campeonParejaId : undefined,
      organizadorIds: Array.isArray(doc.organizadorIds)
        ? [...new Set<string>(doc.organizadorIds.filter((item): item is string => typeof item === "string"))]
        : [],
      reglamento: reglamentoCompetenciaEsValido(doc.reglamento)
        ? doc.reglamento
        : undefined,
    };
  },
};
