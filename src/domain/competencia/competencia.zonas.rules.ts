import type { ConfiguracionZonas } from "./competencia.zonas.types";
import type { Zona } from "./competencia.zonas.types";

export interface ValidacionZonasResultado {
  esValida: boolean;
  errores: string[];
}

export function validarConfiguracionZonas(
  configuracion: ConfiguracionZonas,
  cantidadParejas: number,
): ValidacionZonasResultado {
  const errores: string[] = [];

  if (cantidadParejas < 2) {
    errores.push(
      "Se necesitan al menos 2 parejas para organizar la competencia.",
    );
  }

  if (configuracion.cantidadZonas < 1) {
    errores.push(
      "Debe existir al menos una zona.",
    );
  }

  if (
    configuracion.parejasPorZona.length !==
    configuracion.cantidadZonas
  ) {
    errores.push(
      "La cantidad de tamaños definidos no coincide con la cantidad de zonas.",
    );
  }

  if (
    configuracion.parejasPorZona.some(
      (cantidad) => !Number.isInteger(cantidad) || cantidad < 2,
    )
  ) {
    errores.push(
      "Cada zona debe tener al menos 2 parejas.",
    );
  }

  const totalParejas =
    configuracion.parejasPorZona.reduce(
      (total, cantidad) => total + cantidad,
      0,
    );

  if (totalParejas !== cantidadParejas) {
    errores.push(
      "La suma de parejas por zona debe coincidir con las parejas inscriptas.",
    );
  }

  if (
    !Number.isInteger(configuracion.parejasClasificanPorZona) ||
    configuracion.parejasClasificanPorZona < 1
  ) {
    errores.push(
      "Debe clasificar al menos una pareja por zona.",
    );
  }

  if (
    configuracion.parejasPorZona.some(
      (cantidad) =>
        configuracion.parejasClasificanPorZona >= cantidad,
    )
  ) {
    errores.push(
      "En cada zona debe quedar al menos una pareja sin clasificar.",
    );
  }

  return {
    esValida: errores.length === 0,
    errores,
  };
}

export function validarZonasGeneradas(
  zonas: Zona[],
  parejaIdsEsperados: string[],
  competenciaId: string,
): string[] {
  const errores: string[] = [];
  const asignaciones = zonas.flatMap((zona) => zona.parejaIds);
  const idsEsperados = new Set(parejaIdsEsperados);
  const idsAsignados = new Set(asignaciones);

  if (zonas.some((zona) => zona.competenciaId !== competenciaId)) {
    errores.push(
      "Hay zonas que pertenecen a otra competencia.",
    );
  }

  if (idsAsignados.size !== asignaciones.length) {
    errores.push(
      "Una pareja está asignada a más de una zona.",
    );
  }

  if (
    asignaciones.some((parejaId) => !idsEsperados.has(parejaId))
  ) {
    errores.push(
      "Hay parejas asignadas que no pertenecen a la lista esperada.",
    );
  }

  if (
    parejaIdsEsperados.some((parejaId) => !idsAsignados.has(parejaId))
  ) {
    errores.push(
      "Hay parejas inscriptas que no fueron asignadas a ninguna zona.",
    );
  }

  if (zonas.some((zona) => zona.parejaIds.length < 2)) {
    errores.push(
      "Cada zona debe tener al menos dos parejas.",
    );
  }

  return errores;
}