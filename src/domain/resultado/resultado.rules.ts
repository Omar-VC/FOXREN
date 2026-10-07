import type { SetResultado } from "../partido/partido.types";
import type { Resultado } from "./resultado.types";

export function validarSet(set: SetResultado): boolean {
  const { juegosPareja1, juegosPareja2, tieBreakPareja1, tieBreakPareja2 } =
    set;

  if (juegosPareja1 < 0 || juegosPareja2 < 0) {
    return false;
  }

  if (juegosPareja1 === juegosPareja2) {
    return false;
  }

  const diferencia = Math.abs(juegosPareja1 - juegosPareja2);

  const ganador = Math.max(juegosPareja1, juegosPareja2);

  // Set decidido por tie-break: 7-6
  if (
    (juegosPareja1 === 7 && juegosPareja2 === 6) ||
    (juegosPareja1 === 6 && juegosPareja2 === 7)
  ) {
    return validarTieBreak(tieBreakPareja1, tieBreakPareja2);
  }

  // Un tie-break solamente puede existir en un 7-6.
  if (tieBreakPareja1 !== undefined || tieBreakPareja2 !== undefined) {
    return false;
  }

  // Set ganado normalmente:
  // mínimo 6 juegos y diferencia de 2.
  if (ganador >= 6 && diferencia >= 2) {
    return true;
  }

  return false;
}

function validarTieBreak(
  puntosPareja1?: number,
  puntosPareja2?: number,
): boolean {
  if (puntosPareja1 === undefined || puntosPareja2 === undefined) {
    return false;
  }

  if (puntosPareja1 < 0 || puntosPareja2 < 0) {
    return false;
  }

  if (puntosPareja1 === puntosPareja2) {
    return false;
  }

  const ganador = Math.max(puntosPareja1, puntosPareja2);

  const diferencia = Math.abs(puntosPareja1 - puntosPareja2);

  return ganador >= 7 && diferencia >= 2;
}

export function validarPartidoEstandar(
  sets: SetResultado[]
): boolean {
  if (sets.length < 2 || sets.length > 3) {
    return false;
  }

  if (!sets.every(validarSet)) {
    return false;
  }

  let setsPareja1 = 0;
  let setsPareja2 = 0;

  for (const set of sets) {
    if (set.juegosPareja1 > set.juegosPareja2) {
      setsPareja1++;
    } else {
      setsPareja2++;
    }
  }

  // Partido 2-0
  if (
    (setsPareja1 === 2 && setsPareja2 === 0) ||
    (setsPareja2 === 2 && setsPareja1 === 0)
  ) {
    return sets.length === 2;
  }

  // Partido 2-1
  if (
    (setsPareja1 === 2 && setsPareja2 === 1) ||
    (setsPareja2 === 2 && setsPareja1 === 1)
  ) {
    return sets.length === 3;
  }

  return false;
}

export function validarTipoResultado(
  resultado: Omit<Resultado, "id">
): boolean {
  if (
    resultado.tipo === "normal" &&
    !validarPartidoEstandar(resultado.sets)
  ) {
    return false;
  }

  if (
    resultado.tipo === "walkover" &&
    resultado.sets.length > 0
  ) {
    return false;
  }

  if (
    resultado.tipo === "normal" ||
    resultado.tipo === "walkover" ||
    resultado.tipo === "abandono"
  ) {
    return Boolean(resultado.ganadorParejaId);
  }

  return true;
}
