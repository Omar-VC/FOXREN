import type { Resultado } from "../../domain/resultado/resultado.types";
import { cerrarPartidoConResultado } from "./cerrarPartidoConResultado";

/**
 * Reemplaza la suspensión pendiente con una resolución deportiva del
 * administrador. Conserva la suspensión en `versiones` y, si el partido es de una
 * llave, avanza al ganador dentro de la misma transacción.
 */
export async function resolverSuspension(
  resultado: Omit<Resultado, "id">,
): Promise<string> {
  if (resultado.tipo === "suspension") {
    throw new Error("La resolución debe ser un resultado válido distinto de una suspensión.");
  }

  return cerrarPartidoConResultado(resultado, "resolver_suspension");
}
