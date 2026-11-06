import type { ConsentimientoPublicacion } from "./jugador.types";
import {
  consentimientoPermitePublicar,
  consentimientoPermitePublicarApodo,
} from "./jugador.publicacion.rules.ts";

/** Lo mínimo que hace falta para decidir cómo se muestra un jugador en público. */
export interface JugadorParaNombrePublico {
  nombre: string;
  apellido: string;
  apodo?: string;
  consentimientoPublicacion?: ConsentimientoPublicacion;
}

export const NOMBRE_JUGADOR_RESERVADO = "Jugador reservado";

/**
 * Nombre que se puede mostrar en la web pública.
 * - Sin consentimiento vigente y verificado: "Jugador reservado" (nunca el nombre real).
 * - Con consentimiento: nombre y apellido; el apodo solo si lo autorizó aparte.
 */
export function nombreVisibleJugador(
  jugador: JugadorParaNombrePublico | undefined,
): string {
  if (!jugador) return NOMBRE_JUGADOR_RESERVADO;
  if (!consentimientoPermitePublicar(jugador.consentimientoPublicacion)) {
    return NOMBRE_JUGADOR_RESERVADO;
  }

  const nombre = `${jugador.nombre} ${jugador.apellido}`.trim();
  const apodo = jugador.apodo?.trim();
  if (apodo && consentimientoPermitePublicarApodo(jugador.consentimientoPublicacion)) {
    return `${nombre} "${apodo}"`;
  }
  return nombre || NOMBRE_JUGADOR_RESERVADO;
}
