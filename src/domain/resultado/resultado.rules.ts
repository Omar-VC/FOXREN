import type { Resultado } from "./resultado.types";

export function resultadoEsOficial(
  resultado: Resultado
): boolean {
  return resultado.oficial;
}

export function resultadoEsValido(
  resultado: Resultado
): boolean {
  return (
    resultado.partidoId.trim() !== "" &&
    resultado.ganadorParejaId.trim() !== "" &&
    resultado.sets.length > 0
  );
}
