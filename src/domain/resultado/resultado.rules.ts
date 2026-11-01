import type { FormatoPartido, SetResultado } from "../partido/partido.types";
import type { Resultado } from "./resultado.types";

/* ------------------------------------------------------------------ */
/* Validación de sets individuales                                    */
/* ------------------------------------------------------------------ */

function validarPuntosTieBreak(
  puntosPareja1: number | undefined,
  puntosPareja2: number | undefined,
  minimo: number,
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
    Math.max(puntosPareja1, puntosPareja2) >= minimo &&
    Math.abs(puntosPareja1 - puntosPareja2) >= 2
  );
}

/** Súper tie-break: a 10 puntos con diferencia de 2. Cuenta como un set ganado (1-0). */
export function validarSuperTieBreak(set: SetResultado): boolean {
  const { tieBreakPareja1: p1, tieBreakPareja2: p2 } = set;

  if (!validarPuntosTieBreak(p1, p2, 10)) return false;

  const gana1 = p1! > p2!;
  return gana1
    ? set.juegosPareja1 === 1 && set.juegosPareja2 === 0
    : set.juegosPareja1 === 0 && set.juegosPareja2 === 1;
}

/** Set de games: 6-0..6-4, 7-5, o 7-6 con tie-break a 7 (diferencia de 2). */
export function validarSet(set: SetResultado): boolean {
  if (set.tipo === "super_tiebreak") return validarSuperTieBreak(set);

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
    if (!validarPuntosTieBreak(tieBreakPareja1, tieBreakPareja2, 7)) {
      return false;
    }
    return juegosPareja1 === 7
      ? tieBreakPareja1! > tieBreakPareja2!
      : tieBreakPareja2! > tieBreakPareja1!;
  }

  if (tieBreakPareja1 !== undefined || tieBreakPareja2 !== undefined) {
    return false;
  }

  const ganador = Math.max(juegosPareja1, juegosPareja2);
  const perdedor = Math.min(juegosPareja1, juegosPareja2);

  return (ganador === 6 && perdedor <= 4) || (ganador === 7 && perdedor === 5);
}

/* ------------------------------------------------------------------ */
/* Evaluación de un marcador completo según el formato                */
/* ------------------------------------------------------------------ */

export interface EvaluacionMarcador {
  valido: boolean;
  ganador: 1 | 2 | null;
  error?: string;
}

function invalido(error: string): EvaluacionMarcador {
  return { valido: false, ganador: null, error };
}

export function evaluarMarcador(
  sets: SetResultado[],
  formato: FormatoPartido,
): EvaluacionMarcador {
  if (sets.length === 0) return invalido("Falta cargar el marcador.");

  for (let i = 0; i < sets.length; i++) {
    const set = sets[i];

    if (set.setNumero !== i + 1) {
      return invalido(`Los sets deben estar numerados en orden (set ${i + 1}).`);
    }
    if (set.tipo === "super_tiebreak" && (formato !== "mejor_de_3" || i !== 2)) {
      return invalido(
        "El súper tie-break solo puede reemplazar al tercer set de un mejor de 3.",
      );
    }
    if (!validarSet(set)) {
      return invalido(
        set.tipo === "super_tiebreak"
          ? "El súper tie-break debe ganarse a 10 puntos con diferencia de 2."
          : `El set ${i + 1} no es válido.`,
      );
    }
  }

  if (formato === "un_set") {
    if (sets.length !== 1) return invalido("Un partido a un set tiene un único set.");
    return { valido: true, ganador: sets[0].juegosPareja1 > sets[0].juegosPareja2 ? 1 : 2 };
  }

  if (sets.length > 3) return invalido("Un mejor de 3 no puede tener más de 3 sets.");

  let ganados1 = 0;
  let ganados2 = 0;

  for (let i = 0; i < sets.length; i++) {
    if (sets[i].juegosPareja1 > sets[i].juegosPareja2) ganados1++;
    else ganados2++;

    if (ganados1 === 2 || ganados2 === 2) {
      if (i !== sets.length - 1) {
        return invalido("El partido ya estaba definido antes del último set cargado.");
      }
      return { valido: true, ganador: ganados1 === 2 ? 1 : 2 };
    }
  }

  return invalido(
    sets.length === 2
      ? "El partido va 1-1: falta el tercer set o el súper tie-break."
      : "El partido no terminó: ninguna pareja ganó 2 sets.",
  );
}

export function calcularGanadorDesdeSets(
  sets: SetResultado[],
  formato: FormatoPartido,
  pareja1Id: string,
  pareja2Id: string,
): string | null {
  const evaluacion = evaluarMarcador(sets, formato);
  if (!evaluacion.valido) return null;
  return evaluacion.ganador === 1 ? pareja1Id : pareja2Id;
}

/* ------------------------------------------------------------------ */
/* Validación por tipo de resultado                                    */
/* ------------------------------------------------------------------ */

export interface ValidacionResultado {
  valido: boolean;
  error?: string;
}

export function validarResultado(
  resultado: Omit<Resultado, "id">,
  formato: FormatoPartido,
): ValidacionResultado {
  switch (resultado.tipo) {
    case "normal": {
      const evaluacion = evaluarMarcador(resultado.sets, formato);
      if (!evaluacion.valido) return { valido: false, error: evaluacion.error };
      if (!resultado.ganadorParejaId) {
        return { valido: false, error: "Falta la pareja ganadora." };
      }
      return { valido: true };
    }
    case "walkover":
      if (resultado.sets.length !== 0) {
        return { valido: false, error: "Un walkover no lleva marcador." };
      }
      return resultado.ganadorParejaId
        ? { valido: true }
        : { valido: false, error: "Seleccioná la pareja ganadora." };
    case "abandono":
      return resultado.ganadorParejaId
        ? { valido: true }
        : { valido: false, error: "Seleccioná la pareja ganadora." };
    case "suspension":
      return resultado.ganadorParejaId
        ? { valido: false, error: "Una suspensión no tiene pareja ganadora." }
        : { valido: true };
    default:
      return { valido: false, error: "Tipo de resultado desconocido." };
  }
}

export function validarTipoResultado(
  resultado: Omit<Resultado, "id">,
  formato: FormatoPartido,
): boolean {
  return validarResultado(resultado, formato).valido;
}

export function validarPartidoEstandar(sets: SetResultado[]): boolean {
  return evaluarMarcador(sets, "mejor_de_3").valido;
}