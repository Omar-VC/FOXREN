import type { Pareja } from "./pareja.types";

/**
 * Valida que los dos integrantes de la pareja sean distintas personas
 * y que sus identificadores estén presentes.
 */
export function parejaEsValida(pareja: Pareja): boolean {
  return (
    pareja.jugador1Id !== pareja.jugador2Id &&
    pareja.jugador1Id.trim() !== "" &&
    pareja.jugador2Id.trim() !== ""
  );
}

/**
 * Genera la representación textual estándar de una pareja para el dominio y la interfaz.
 * Formato: "Apellido1 / Apellido2"
 */
export function formatearNombrePareja(pareja?: Partial<Pareja> | null): string {
  if (!pareja) return "Pareja no definida";

  const ap1 = pareja.jugador1?.apellido?.trim();
  const ap2 = pareja.jugador2?.apellido?.trim();

  if (ap1 && ap2) return `${ap1} / ${ap2}`;
  if (ap1) return `${ap1} / (Sin asignar)`;
  if (ap2) return `(Sin asignar) / ${ap2}`;

  return "Pareja A confirmar";
}