import type { Torneo } from "./torneo.types";

export function torneoEstaActivo(torneo: Torneo): boolean {
  return (
    torneo.estado === "abierto" ||
    torneo.estado === "en_curso"
  );
}

export function torneoEstaFinalizado(torneo: Torneo): boolean {
  return torneo.estado === "finalizado";
}