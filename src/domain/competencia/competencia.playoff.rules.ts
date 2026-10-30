import type { FaseEliminacion, PartidoEliminacion } from "./competencia.playoff.types";

/**
 * Determina si un número es potencia de 2.
 */
export function esPotenciaDeDos(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

/**
 * Calcula la cantidad total de rondas para una eliminación directa con N parejas.
 * Ej: 4 parejas -> 2 rondas (semifinal + final), 8 parejas -> 3 rondas (cuartos + semifinal + final)
 */
export function calcularTotalRondas(cantidadParejas: number): number {
  if (!esPotenciaDeDos(cantidadParejas) || cantidadParejas < 2) {
    throw new Error(
      "La cantidad de parejas debe ser una potencia de 2 (2, 4, 8, 16, ...).",
    );
  }

  let rondas = 0;
  let resto = cantidadParejas;
  while (resto > 1) {
    resto = resto / 2;
    rondas++;
  }
  return rondas;
}

/**
 * Mapea el número de ronda (empezando en 1) a su nombre de fase.
 * La ronda 1 es la primera fase de eliminación (la que tiene más partidos).
 * La última ronda es siempre "final".
 */
export function nombreFasePorRonda(
  ronda: number,
  totalRondas: number,
): FaseEliminacion {
  if (ronda === totalRondas) {
    return "final";
  }

  const rondasRestantes = totalRondas - ronda;

  switch (rondasRestantes) {
    case 1:
      return "semifinal";
    case 2:
      return "cuartos_final";
    case 3:
      return "octavos_final";
    default:
      // Para más de 8 parejas, las rondas intermedias se nombran genéricamente
      // como semifinal/cuartos/octavos según su posición relativa
      if (rondasRestantes <= 3) {
        return ["octavos_final", "cuartos_final", "semifinal"][
          rondasRestantes - 1
        ] as FaseEliminacion;
      }
      return "semifinal";
  }
}

/**
 * Genera los emparejamientos de una ronda de eliminación directa.
 * El emparejamiento estándar es: 1 vs N, 2 vs N-1, 3 vs N-2, etc.
 * Cuando esPlaceholder es true, los partidos se generan sin parejas asignadas
 * (pareja1Id: null, pareja2Id: null) para que se completen después con los ganadores.
 */
export function generarEmparejamientosRonda(
  parejasIds: string[],
  ronda: number,
  totalRondas: number,
  ordenInicial: number,
  esPlaceholder: boolean = false,
): PartidoEliminacion[] {
  const fase = nombreFasePorRonda(ronda, totalRondas);
  const partidos: PartidoEliminacion[] = [];
  // En rondas placeholder (ronda > 1), la cantidad de partidos se reduce a la mitad en cada ronda:
  // ronda 2 -> N/4, ronda 3 -> N/8, etc. Así la final siempre tiene 1 partido.
  const mitad = esPlaceholder
    ? Math.max(1, Math.floor(parejasIds.length / Math.pow(2, ronda)))
    : parejasIds.length / 2;

  for (let i = 0; i < mitad; i++) {
    const pareja1Id = esPlaceholder ? null : parejasIds[i];
    const pareja2Id = esPlaceholder ? null : parejasIds[parejasIds.length - 1 - i];

    partidos.push({
      competenciaId: "", // Se completa en la capa de aplicación
      fase,
      ronda,
      partidoNumero: i + 1,
      pareja1Id,
      pareja2Id,
      estado: "pendiente",
      sets: [],
      ganadorParejaId: undefined,
      orden: ordenInicial + i,
    });
  }

  return partidos;
}

/**
 * Genera el cuadro completo de eliminación directa para una lista de parejas.
 * Las parejas deben venir ordenadas (por ranking, inscripción, etc.).
 * La cantidad debe ser potencia de 2.
 */
export function generarCuadroEliminacion(
  competenciaId: string,
  parejasIds: string[],
): PartidoEliminacion[] {
  if (!esPotenciaDeDos(parejasIds.length) || parejasIds.length < 2) {
    throw new Error(
      "La cantidad de parejas debe ser una potencia de 2 (2, 4, 8, 16, ...).",
    );
  }

  const totalRondas = calcularTotalRondas(parejasIds.length);
  const todosLosPartidos: PartidoEliminacion[] = [];

  // En cada ronda, los ganadores de la ronda anterior avanzan.
  // Para la ronda 1 usamos las parejas originales.
  // Para rondas siguientes, generamos partidos sin parejas asignadas (placeholders)
  // que se completarán automáticamente cuando los partidos anteriores finalicen.
  let ordenGlobal = 1;

  for (let ronda = 1; ronda <= totalRondas; ronda++) {
    const esPlaceholder = ronda > 1;

    const partidosRonda = generarEmparejamientosRonda(
      parejasIds, // Se ignora cuando esPlaceholder es true
      ronda,
      totalRondas,
      ordenGlobal,
      esPlaceholder,
    );

    // Asignar competenciaId a cada partido
    for (const partido of partidosRonda) {
      partido.competenciaId = competenciaId;
    }

    todosLosPartidos.push(...partidosRonda);
    ordenGlobal += partidosRonda.length;
  }

  return todosLosPartidos;
}
