import type { SetResultado } from "../partido/partido.types";
import type { Resultado } from "./resultado.types";

export function validarSet(set: SetResultado): boolean {
  const {
    setNumero,
    juegosPareja1,
    juegosPareja2,
    tieBreakPareja1,
    tieBreakPareja2,
  } = set;

  if (
    !Number.isInteger(setNumero) ||
    setNumero < 1 ||
    !Number.isInteger(juegosPareja1) ||
    !Number.isInteger(juegosPareja2) ||
    juegosPareja1 < 0 ||
    juegosPareja2 < 0 ||
    juegosPareja1 === juegosPareja2
  ) {
    return false;
  }

  const esTieBreak =
    (juegosPareja1 === 7 && juegosPareja2 === 6) ||
    (juegosPareja1 === 6 && juegosPareja2 === 7);

  if (esTieBreak) {
    if (!validarTieBreak(tieBreakPareja1, tieBreakPareja2)) {
      return false;
    }

    return juegosPareja1 === 7
      ? tieBreakPareja1! > tieBreakPareja2!
      : tieBreakPareja2! > tieBreakPareja1!;
  }

  if (
    tieBreakPareja1 !== undefined ||
    tieBreakPareja2 !== undefined
  ) {
    return false;
  }

  const ganador = Math.max(juegosPareja1, juegosPareja2);
  const perdedor = Math.min(juegosPareja1, juegosPareja2);

  return (
    (ganador === 6 && perdedor <= 4) ||
    (ganador === 7 && perdedor === 5)
  );
}

function validarTieBreak(
  puntosPareja1?: number,
  puntosPareja2?: number,
): boolean {
  if (
    puntosPareja1 === undefined ||
    puntosPareja2 === undefined ||
    !Number.isInteger(puntosPareja1) ||
    !Number.isInteger(puntosPareja2) ||
    puntosPareja1 < 0 ||
    puntosPareja2 < 0 ||
    puntosPareja1 === puntosPareja2
  ) {
    return false;
  }

  return (
    Math.max(puntosPareja1, puntosPareja2) >= 7 &&
    Math.abs(puntosPareja1 - puntosPareja2) >= 2
  );
}

export function validarPartidoEstandar(
  sets: SetResultado[],
): boolean {
  if (sets.length < 1 || sets.length > 3) {
    return false;
  }

  if (!sets.every(validarSet)) {
    return false;
  }

  if (!sets.every((set, indice) => set.setNumero === indice + 1)) {
    return false;
  }

  let setsPareja1 = 0;
  let setsPareja2 = 0;

  for (let i = 0; i < sets.length; i++) {
    if (sets[i].juegosPareja1 > sets[i].juegosPareja2) {
      setsPareja1++;
    } else {
      setsPareja2++;
    }

    // Si es partido a 1 set, cierra al finalizar el único set.
    if (sets.length === 1) {
      return i === sets.length - 1;
    }

    // Si es partido a 2 sets y alguien gana ambos, cierra el partido.
    if (sets.length === 2 && (setsPareja1 === 2 || setsPareja2 === 2)) {
      return i === sets.length - 1;
    }

    // Si es partido a 3 sets (mejor de 3), quien llegue a 2 sets cierra.
    if (sets.length === 3 && (setsPareja1 === 2 || setsPareja2 === 2)) {
      return i === sets.length - 1;
    }
  }

  // Con 2 sets y empate 1-1, el partido queda abierto para un tercer set.
  return false;
}

export function validarTipoResultado(
  resultado: Omit<Resultado, "id">,
): boolean {
  if (resultado.tipo === "normal") {
    if (!validarPartidoEstandar(resultado.sets)) {
      return false;
    }

    // Contar sets ganados por cada pareja.
    const setsPareja1 = resultado.sets.filter(
      (s) => s.juegosPareja1 > s.juegosPareja2,
    ).length;
    const setsPareja2 = resultado.sets.filter(
      (s) => s.juegosPareja2 > s.juegosPareja1,
    ).length;

    // Si hay empate 1-1 en 2 sets, el partido queda abierto para tercer set;
    // no se requiere ganadorParejaId todavía.
    const empateEnDosSets =
      resultado.sets.length === 2 && setsPareja1 === 1 && setsPareja2 === 1;

    if (!empateEnDosSets && !Boolean(resultado.ganadorParejaId)) {
      return false;
    }

    return true;
  }

  if (resultado.tipo === "walkover") {
    return (
      resultado.sets.length === 0 &&
      Boolean(resultado.ganadorParejaId)
    );
  }

  if (resultado.tipo === "abandono") {
    return Boolean(resultado.ganadorParejaId);
  }

  if (resultado.tipo === "suspension") {
    return !resultado.ganadorParejaId;
  }

  return false;
}
