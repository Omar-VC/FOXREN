import type { FormatoPartido, SetResultado } from "../partido/partido.types";
import { evaluarMarcador } from "./resultado.rules.ts";

/**
 * Marcador tal como se escribe en el formulario (texto). La cantidad de sets
 * NO se elige: sale del propio marcador. Un partido a "2 sets" no es un formato:
 * es un mejor de 3 que terminó 2-0.
 */
export interface MarcadorSetTexto {
  juegosPareja1: string;
  juegosPareja2: string;
  tieBreakPareja1: string;
  tieBreakPareja2: string;
}

export const MARCADOR_SET_VACIO: MarcadorSetTexto = {
  juegosPareja1: "",
  juegosPareja2: "",
  tieBreakPareja1: "",
  tieBreakPareja2: "",
};

/** Con 1-1 en sets, el tercero se define con un set completo o con un súper tie-break a 10. */
export type TipoTercerSet = "set" | "super_tiebreak";

function entero(texto: string): number | null {
  if (texto.trim() === "") return null;
  const numero = Number(texto);
  return Number.isInteger(numero) && numero >= 0 ? numero : null;
}

/** Un set llega a tie-break con 6-6 (se completa con los puntos) o si ya se cargó 7-6 / 6-7. */
export function requiereTieBreak(marcador: MarcadorSetTexto): boolean {
  const juegos1 = entero(marcador.juegosPareja1);
  const juegos2 = entero(marcador.juegosPareja2);
  if (juegos1 === null || juegos2 === null) return false;
  return (
    (juegos1 === 6 && juegos2 === 6) ||
    (juegos1 === 7 && juegos2 === 6) ||
    (juegos1 === 6 && juegos2 === 7)
  );
}

function ganadorDelSet(marcador: MarcadorSetTexto): 1 | 2 | null {
  const juegos1 = entero(marcador.juegosPareja1);
  const juegos2 = entero(marcador.juegosPareja2);
  if (juegos1 === null || juegos2 === null) return null;

  if (requiereTieBreak(marcador)) {
    const puntos1 = entero(marcador.tieBreakPareja1);
    const puntos2 = entero(marcador.tieBreakPareja2);
    if (puntos1 === null || puntos2 === null || puntos1 === puntos2) return null;
    return puntos1 > puntos2 ? 1 : 2;
  }

  if (juegos1 === juegos2) return null;
  return juegos1 > juegos2 ? 1 : 2;
}

/**
 * Cuántos sets hay que mostrar: 1 en "un set"; en mejor de 3, dos, y un tercero
 * solo cuando los dos primeros están completos y cada pareja ganó uno (1-1).
 */
export function cantidadSetsVisibles(
  marcadores: MarcadorSetTexto[],
  formato: FormatoPartido,
): 1 | 2 | 3 {
  if (formato === "un_set") return 1;
  const ganador1 = ganadorDelSet(marcadores[0] ?? MARCADOR_SET_VACIO);
  const ganador2 = ganadorDelSet(marcadores[1] ?? MARCADOR_SET_VACIO);
  return ganador1 !== null && ganador2 !== null && ganador1 !== ganador2 ? 3 : 2;
}

export type ConstruccionMarcador =
  | { ok: true; sets: SetResultado[]; ganador: 1 | 2 }
  | { ok: false; error: string };

function error(mensaje: string): ConstruccionMarcador {
  return { ok: false, error: mensaje };
}

/**
 * Convierte lo escrito en el formulario en sets y valida el marcador completo
 * contra el formato. Los mensajes de error están listos para mostrar.
 */
export function construirMarcador(
  marcadores: MarcadorSetTexto[],
  formato: FormatoPartido,
  tipoTercerSet: TipoTercerSet = "set",
): ConstruccionMarcador {
  const cantidad = cantidadSetsVisibles(marcadores, formato);
  const sets: SetResultado[] = [];

  for (let indice = 0; indice < cantidad; indice++) {
    const marcador = marcadores[indice] ?? MARCADOR_SET_VACIO;
    const numero = indice + 1;

    if (indice === 2 && tipoTercerSet === "super_tiebreak") {
      const puntos1 = entero(marcador.tieBreakPareja1);
      const puntos2 = entero(marcador.tieBreakPareja2);
      if (puntos1 === null || puntos2 === null) {
        return error("Completá los puntos del súper tie-break.");
      }
      if (puntos1 === puntos2) {
        return error("El súper tie-break no puede terminar empatado.");
      }
      sets.push({
        setNumero: 3,
        juegosPareja1: puntos1 > puntos2 ? 1 : 0,
        juegosPareja2: puntos1 > puntos2 ? 0 : 1,
        tieBreakPareja1: puntos1,
        tieBreakPareja2: puntos2,
        tipo: "super_tiebreak",
      });
      continue;
    }

    const juegos1 = entero(marcador.juegosPareja1);
    const juegos2 = entero(marcador.juegosPareja2);
    if (juegos1 === null || juegos2 === null) {
      return error(`Completá los games del set ${numero}.`);
    }

    const set: SetResultado = {
      setNumero: numero,
      juegosPareja1: juegos1,
      juegosPareja2: juegos2,
    };

    if (requiereTieBreak(marcador)) {
      const puntos1 = entero(marcador.tieBreakPareja1);
      const puntos2 = entero(marcador.tieBreakPareja2);
      if (puntos1 === null || puntos2 === null) {
        return error(`Completá los puntos del tie-break del set ${numero}.`);
      }
      if (puntos1 === puntos2) {
        return error(`El tie-break del set ${numero} no puede terminar empatado.`);
      }
      // Con 6-6 el set se completa solo: 7-6 para quien ganó el tie-break.
      if (juegos1 === 6 && juegos2 === 6) {
        set.juegosPareja1 = puntos1 > puntos2 ? 7 : 6;
        set.juegosPareja2 = puntos2 > puntos1 ? 7 : 6;
      }
      set.tieBreakPareja1 = puntos1;
      set.tieBreakPareja2 = puntos2;
    }

    sets.push(set);
  }

  const evaluacion = evaluarMarcador(sets, formato);
  if (!evaluacion.valido || evaluacion.ganador === null) {
    return error(evaluacion.error ?? "El marcador no es válido.");
  }
  return { ok: true, sets, ganador: evaluacion.ganador };
}
