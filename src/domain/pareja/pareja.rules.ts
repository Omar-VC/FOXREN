import type { Pareja } from "./pareja.types";

export function parejaEsValida(pareja: Pareja): boolean {
  return (
    pareja.jugador1Id !== pareja.jugador2Id &&
    pareja.jugador1Id.trim() !== "" &&
    pareja.jugador2Id.trim() !== ""
  );
}