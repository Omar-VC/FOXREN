// src/infrastructure/mappers/torneo.mapper.ts

import type { Torneo } from '../../domain/torneo/torneo.types';

export const torneoMapper = {
  toFirestore(torneo: Torneo) {
    return {
      circuitoId: torneo.circuitoId,
      nombre: torneo.nombre,
      sede: torneo.sede,
      fechaInicio: torneo.fechaInicio,
      fechaFin: torneo.fechaFin,
      categoriasValidas: torneo.categoriasValidas,
      estado: torneo.estado,
      descripcion: torneo.descripcion ?? null,
      organizadorIds: torneo.organizadorIds ?? [],
      llaveId: torneo.llaveId ?? torneo.organizadorLlaveId ?? null,
    };
  },

  fromFirestore(id: string, doc: any): Torneo {
    return {
      id,
      circuitoId: doc.circuitoId,
      nombre: doc.nombre,
      sede: doc.sede,
      fechaInicio: doc.fechaInicio?.toDate ? doc.fechaInicio.toDate() : new Date(doc.fechaInicio),
      fechaFin: doc.fechaFin?.toDate ? doc.fechaFin.toDate() : new Date(doc.fechaFin),
      categoriasValidas: doc.categoriasValidas || [],
      estado: doc.estado || 'INSCRIPCION_ABIERTA',
      descripcion: doc.descripcion ?? undefined,
      organizadorIds: doc.organizadorIds || [],
      llaveId: doc.llaveId || undefined,
    };
  }
};