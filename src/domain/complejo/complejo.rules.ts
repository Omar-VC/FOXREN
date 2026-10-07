import type { Complejo } from "./complejo.types";

export function complejoEstaActivo(
  complejo: Complejo
): boolean {
  return complejo.estado === "activo";
}

export function complejoEstaInactivo(
  complejo: Complejo
): boolean {
  return complejo.estado === "inactivo";
}

export function complejoEsValido(
  complejo: Complejo
): boolean {
  return (
    complejo.nombre.trim() !== "" &&
    complejo.circuitoId.trim() !== "" &&
    complejo.ciudad.trim() !== "" &&
    complejo.provincia.trim() !== "" &&
    complejo.cantidadCanchas > 0
  );
}