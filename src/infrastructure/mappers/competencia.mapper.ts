import { Timestamp } from "firebase/firestore";
import type { Competencia } from "../../domain/competencia/competencia.types";

// Convierte Competencia → Firestore
export const toFirestoreCompetencia = (competencia: Competencia) => {
  return {
    id: competencia.id,
    torneoId: competencia.torneoId,
    nombre: competencia.nombre,
    descripcion: competencia.descripcion ?? null,
    categoriaId: competencia.categoriaId,
    estado: competencia.estado ?? "borrador",
    fechaInicio: Timestamp.fromDate(competencia.fechaInicio),
    fechaFin: Timestamp.fromDate(competencia.fechaFin),
  };
};

// Convierte Firestore → Competencia
export const fromFirestoreCompetencia = (doc: any): Competencia => {
  return {
    id: doc.id,
    torneoId: doc.torneoId,
    nombre: doc.nombre,
    descripcion: doc.descripcion ?? undefined,
    categoriaId: doc.categoriaId,
    estado: doc.estado ?? "borrador",
    fechaInicio: (doc.fechaInicio as Timestamp).toDate(),
    fechaFin: (doc.fechaFin as Timestamp).toDate(),
  };
};
