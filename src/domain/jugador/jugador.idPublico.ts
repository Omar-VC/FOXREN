/**
 * Identificador público de un jugador: se usa en las direcciones del perfil
 * (/jugadores/:idPublico). Sale de un hash de una vía del ID interno, así que no
 * revela ni puede usarse para deducir el ID interno, y es siempre el mismo para
 * el mismo jugador sin necesidad de guardarlo.
 */
export async function calcularIdPublico(jugadorId: string): Promise<string> {
  const datos = new TextEncoder().encode(`foxren:jugador:${jugadorId}`);
  const hash = await globalThis.crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(hash))
    .slice(0, 12)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
