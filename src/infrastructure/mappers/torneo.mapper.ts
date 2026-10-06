// src/infrastructure/mappers/torneo.mapper.ts

import type { Torneo } from "../../domain/torneo/torneo.types";

function convertirFechaFirestore(
  fechaRaw: any
): Date {
  if (!fechaRaw) {
    return new Date();
  }

  if (
    typeof fechaRaw === "object" &&
    typeof fechaRaw.toDate === "function"
  ) {
    return fechaRaw.toDate();
  }

  if (
    typeof fechaRaw === "object" &&
    "seconds" in fechaRaw
  ) {
    return new Date(fechaRaw.seconds * 1000);
  }

  if (fechaRaw instanceof Date) {
    return fechaRaw;
  }

  return new Date(fechaRaw);
}

export const mapDocToTorneo = (
  docId: string,
  data: any
): Torneo => {
  return {
    id: docId,
    nombre: data.nombre ?? "Torneo sin nombre",
    circuitoId: data.circuitoId ?? "",
    complejoId: data.complejoId ?? "",
    descripcion: data.descripcion ?? undefined,

    fechaInicio: convertirFechaFirestore(
      data.fechaInicio
    ),

    fechaFin: data.fechaFin
      ? convertirFechaFirestore(data.fechaFin)
      : undefined,

    montoInscripcionPorPareja:
      data.montoInscripcionPorPareja ?? undefined,

    cupoMaximoParejas:
      data.cupoMaximoParejas ?? undefined,

    modalidad: data.modalidad ?? "presencial",

    premios: data.premios ?? undefined,

    reglamento:
      data.reglamento ?? undefined,

    contactoOrganizador:
      data.contactoOrganizador ??
      data.telefonoOrganizador ??
      data.telefono ??
      data.celular ??
      "",

    imagenUrl:
      data.imagenUrl ?? undefined,

    estado:
      data.estado ?? "pendiente",

    puntajeRanking:
      data.puntajeRanking ?? undefined,

    fechaCreacion:
      convertirFechaFirestore(
        data.fechaCreacion
      ),
  };
};