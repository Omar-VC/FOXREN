import type { EstadoJugador, Jugador, Sexo } from "./jugador.types";

/**
 * Datos mínimos de un jugador para inscribirlo en una competencia. Es lo único
 * que ven los administradores de complejo: sin DNI, fecha de nacimiento,
 * teléfono, email ni lado de juego.
 */
export interface PadronJugador {
  /** ID interno del jugador. */
  id: string;
  nombre: string;
  apellido: string;
  categoriaDeclarada: string;
  sexo: Sexo;
  estado: EstadoJugador;
}

/** Lo que usan las reglas de categoría y los listados: no necesita más del jugador. */
export type JugadorBasico = Pick<
  Jugador,
  "id" | "nombre" | "apellido" | "categoriaDeclarada"
>;

/** Documento que se guarda en el padrón (el ID del documento es el del jugador). */
export type DatosPadronJugador = Omit<PadronJugador, "id">;

/** Deja solo los dígitos: "35.123.456" y "35123456" son el mismo DNI. */
export function normalizarDni(dni: string): string {
  return String(dni ?? "").replace(/\D/g, "");
}

/**
 * Código con el que se busca un jugador por DNI sin guardar el DNI en la lista.
 * Es un hash de una vía: sirve para encontrar a quien ya conocés por su DNI,
 * pero no permite ver ni listar los DNI.
 */
export async function calcularCodigoDni(dni: string): Promise<string> {
  const datos = new TextEncoder().encode(`foxren:dni:${normalizarDni(dni)}`);
  const hash = await globalThis.crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Proyección del jugador para el padrón: solo campos no sensibles. */
export function construirPadron(
  jugador: Pick<Jugador, "nombre" | "apellido" | "categoriaDeclarada" | "sexo" | "estado">,
): DatosPadronJugador {
  return {
    nombre: String(jugador.nombre ?? "").trim(),
    apellido: String(jugador.apellido ?? "").trim(),
    categoriaDeclarada: String(jugador.categoriaDeclarada ?? "").trim(),
    sexo: jugador.sexo,
    estado: jugador.estado,
  };
}
