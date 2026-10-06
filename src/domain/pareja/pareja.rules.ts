import type { Pareja } from "./pareja.types";

export function parejaEsValida(pareja: Pareja): boolean {
  return (
    pareja.jugador1Id.trim() !== "" &&
    pareja.jugador2Id.trim() !== "" &&
    pareja.jugador1Id !== pareja.jugador2Id
  );
}

export function parejaEstaActiva(pareja: Pareja): boolean {
  return pareja.estado === "activa";
}