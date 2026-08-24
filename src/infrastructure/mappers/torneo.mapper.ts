import { Timestamp } from "firebase/firestore";
import type { Torneo } from "../../domain/torneo/torneo.types";

// Convierte Torneo → Firestore
export const toFirestoreTorneo = (torneo: Torneo) => {
  return {
    id: torneo.id,
    nombre: torneo.nombre,
    descripcion: torneo.descripcion ?? null,
    circuitoId: torneo.circuitoId,
    organizadorIds: torneo.organizadorIds,
    fechaInicio: Timestamp.fromDate(torneo.fechaInicio),
    fechaFin: Timestamp.fromDate(torneo.fechaFin),
    estado: torneo.estado ?? "borrador",
    llaveId: torneo.llaveId,
  };
};

// Convierte Firestore → Torneo
export const fromFirestoreTorneo = (doc: any): Torneo => {
  return {
    id: doc.id,
    nombre: doc.nombre,
    descripcion: doc.descripcion ?? undefined,
    circuitoId: doc.circuitoId,
    organizadorIds: doc.organizadorIds ?? [],
    fechaInicio: (doc.fechaInicio as Timestamp).toDate(),
    fechaFin: (doc.fechaFin as Timestamp).toDate(),
    estado: doc.estado ?? "borrador",
    llaveId: doc.llaveId,
  };
};
