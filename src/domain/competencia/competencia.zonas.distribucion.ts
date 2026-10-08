import type { Zona } from "./competencia.zonas.types";
import { validarZonasGeneradas } from "./competencia.zonas.rules";

export function distribuirParejasEnZonas(
  cantidadParejas: number,
  cantidadZonas: number,
): number[] {
  if (
    !Number.isInteger(cantidadParejas) ||
    !Number.isInteger(cantidadZonas) ||
    cantidadParejas < 2 ||
    cantidadZonas < 1 ||
    cantidadZonas > Math.floor(cantidadParejas / 2)
  ) {
    throw new Error(
      "La cantidad de parejas y zonas no permite una distribución válida.",
    );
  }

  const parejasBase = Math.floor(
    cantidadParejas / cantidadZonas,
  );

  const parejasRestantes =
    cantidadParejas % cantidadZonas;

  return Array.from(
    { length: cantidadZonas },
    (_, indice) =>
      parejasBase + (indice < parejasRestantes ? 1 : 0),
  );
}

export function asignarParejasAZonas(
  competenciaId: string,
  parejaIds: string[],
  distribucion: number[],
): Zona[] {
  const totalEsperado = distribucion.reduce(
    (total, cantidad) => total + cantidad,
    0,
  );

  if (totalEsperado !== parejaIds.length) {
    throw new Error(
      "La distribución no coincide con la cantidad de parejas.",
    );
  }

  if (
    distribucion.some(
      (cantidad) => !Number.isInteger(cantidad) || cantidad < 2,
    )
  ) {
    throw new Error(
      "Cada zona debe tener al menos dos parejas.",
    );
  }

  const zonas: Zona[] = [];
  let indicePareja = 0;

  distribucion.forEach((cantidad, indiceZona) => {
    const parejasZona = parejaIds.slice(
      indicePareja,
      indicePareja + cantidad,
    );

    zonas.push({
      id: `zona-${indiceZona + 1}`,
      competenciaId,
      nombre: `Zona ${String.fromCharCode(65 + indiceZona)}`,
      parejaIds: parejasZona,
      orden: indiceZona + 1,
    });

    indicePareja += cantidad;
  });

  return zonas;
}

export function generarZonasAutomaticamente(
  competenciaId: string,
  parejaIds: string[],
  cantidadZonas: number,
): Zona[] {
  const distribucion = distribuirParejasEnZonas(
    parejaIds.length,
    cantidadZonas,
  );

  const zonas = asignarParejasAZonas(
    competenciaId,
    parejaIds,
    distribucion,
  );

  const errores = validarZonasGeneradas(
    zonas,
    parejaIds,
    competenciaId,
  );

  if (errores.length > 0) {
    throw new Error(errores.join(" "));
  }

  return zonas;
}