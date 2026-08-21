import type { Llave } from "./llave.types";

export function llaveEstaDisponible(
  llave: Llave
): boolean {
  return llave.estado === "disponible";
}

export function llaveEstaExpirada(
  llave: Llave,
  ahora: Date = new Date()
): boolean {
  return llave.fechaExpiracion < ahora;
}

export function llavePuedeUtilizarse(
  llave: Llave,
  ahora: Date = new Date()
): boolean {
  return (
    llave.estado === "disponible" &&
    !llaveEstaExpirada(llave, ahora)
  );
}