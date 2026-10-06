import type { Resultado } from "./resultado.types";

export function resultadoEsOficial(
  resultado: Resultado
): boolean {
  return resultado.oficial;
}

export function resultadoEsValido(
  resultado: Resultado
): boolean {
  if (!resultado.partidoId.trim()) {
    return false;
  }

  if (!resultado.sets || resultado.sets.length === 0) {
    return false;
  }

  if (
    resultado.tipo !== "suspension" &&
    (!resultado.ganadorParejaId ||
      resultado.ganadorParejaId.trim() === "")
  ) {
    return false;
  }

  return true;
}