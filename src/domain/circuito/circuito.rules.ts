import type { Circuito } from "./circuito.types";

export function circuitoEstaActivo(circuito: Circuito): boolean {
  return circuito.estado === "activo";
}