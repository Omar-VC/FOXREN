import type { Inscripcion } from "./inscripcion.types";

export const esInscripcionConfirmada = (inscripcion: Inscripcion): boolean => {
  return inscripcion.estado === "APROBADO" || inscripcion.estado === "confirmada";
};

export const esInscripcionValida = (inscripcion: Inscripcion): boolean => {
  return (
    inscripcion.estado === "PENDIENTE" ||
    inscripcion.estado === "pendiente" ||
    inscripcion.estado === "APROBADO" ||
    inscripcion.estado === "confirmada"
  );
};