// src/infrastructure/mappers/torneo.mapper.ts

import type { EstadoTorneo, Torneo } from "../../domain/torneo/torneo.types";

function convertirEstado(valor: unknown): EstadoTorneo {
  return valor === "pendiente" || valor === "publicado" || valor === "en_curso" ||
    valor === "finalizado" || valor === "cancelado"
    ? valor
    : "pendiente";
}

function convertirFechaFirestore(
  fechaRaw: unknown
): Date {
  if (!fechaRaw) {
    return new Date();
  }

  if (
    typeof fechaRaw === "object" &&
    fechaRaw !== null &&
    typeof (fechaRaw as { toDate?: unknown }).toDate === "function"
  ) {
    return (fechaRaw as { toDate: () => Date }).toDate();
  }

  if (
    typeof fechaRaw === "object" &&
    fechaRaw !== null &&
    "seconds" in fechaRaw &&
    typeof fechaRaw.seconds === "number"
  ) {
    return new Date(fechaRaw.seconds * 1000);
  }

  if (fechaRaw instanceof Date) {
    return fechaRaw;
  }

  return new Date(fechaRaw as string | number);
}

export const mapDocToTorneo = (
  docId: string,
  data: Record<string, unknown>
): Torneo => {
  return {
    id: docId,
    nombre: typeof data.nombre === "string" ? data.nombre : "Torneo sin nombre",
    circuitoId: typeof data.circuitoId === "string" ? data.circuitoId : "",
    complejoId: typeof data.complejoId === "string" ? data.complejoId : "",
    descripcion: typeof data.descripcion === "string" ? data.descripcion : undefined,

    fechaInicio: convertirFechaFirestore(
      data.fechaInicio
    ),

    fechaFin: data.fechaFin
      ? convertirFechaFirestore(data.fechaFin)
      : undefined,

    montoInscripcionPorPareja: typeof data.montoInscripcionPorPareja === "number"
      ? data.montoInscripcionPorPareja
      : undefined,

    cupoMaximoParejas: typeof data.cupoMaximoParejas === "number"
      ? data.cupoMaximoParejas
      : undefined,

    modalidad: "presencial",

    premios: typeof data.premios === "string" ? data.premios : undefined,

    reglamento: typeof data.reglamento === "string" ? data.reglamento : undefined,

    organizadorIds: Array.isArray(data.organizadorIds)
      ? data.organizadorIds.filter((id): id is string => typeof id === "string")
      : [],

    contactoOrganizador: typeof data.contactoOrganizador === "string"
      ? data.contactoOrganizador
      : "",

    imagenUrl: typeof data.imagenUrl === "string" ? data.imagenUrl : undefined,

    estado: convertirEstado(data.estado),

    puntajeRanking: typeof data.puntajeRanking === "number"
      ? data.puntajeRanking
      : undefined,

    fechaCreacion:
      convertirFechaFirestore(
        data.fechaCreacion
      ),
  };
};
