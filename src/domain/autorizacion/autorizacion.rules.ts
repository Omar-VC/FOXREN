import type { AutorizacionToken } from "./autorizacion.types";

/**
 * Valida si un token ingresado por el organizador cumple con el formato básico
 */
export function validarFormatoToken(token: string): boolean {
  return typeof token === 'string' && token.trim().length >= 6;
}

/**
 * Verifica si una autorización está activa y disponible para ser usada en la creación de un torneo
 */
export function esAutorizacionValida(autorizacion: AutorizacionToken | null): boolean {
  if (!autorizacion) return false;
  return autorizacion.estado === 'ACTIVA';
}