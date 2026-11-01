import type { LadoPareja } from "../partido/partido.types";
import type {
  ClasificadoZona,
  CuadroPlayoff,
  FaseEliminacion,
  PartidoPlayoff,
} from "./competencia.playoff.types";

/* ------------------------------------------------------------------ */
/* Tamaño del cuadro                                                   */
/* ------------------------------------------------------------------ */

export function esPotenciaDeDos(n: number): boolean {
  return Number.isInteger(n) && n > 0 && (n & (n - 1)) === 0;
}

/** Menor potencia de 2 que alcanza para `n` parejas (6 -> 8, 8 -> 8, 9 -> 16). */
export function calcularTamanoCuadro(n: number): number {
  if (!Number.isInteger(n) || n < 2) {
    throw new Error("Se necesitan al menos 2 parejas para armar un cuadro.");
  }
  let tamano = 2;
  while (tamano < n) tamano *= 2;
  return tamano;
}

/** Cantidad de rondas para `n` parejas (con byes si no es potencia de 2). */
export function calcularTotalRondas(n: number): number {
  return Math.log2(calcularTamanoCuadro(n));
}

export function nombreFasePorRonda(ronda: number, totalRondas: number): FaseEliminacion {
  const restantes = totalRondas - ronda;
  switch (restantes) {
    case 0:
      return "final";
    case 1:
      return "semifinal";
    case 2:
      return "cuartos_final";
    case 3:
      return "octavos_final";
    case 4:
      return "dieciseisavos_final";
    default:
      return `ronda_de_${2 ** (restantes + 1)}`;
  }
}

/* ------------------------------------------------------------------ */
/* Orden estándar de siembra                                           */
/* ------------------------------------------------------------------ */

/**
 * Orden de siembras en la primera ronda para un cuadro de `tamano` lugares.
 * Cada par consecutivo es un partido. tamano 8 -> [1,8,4,5,2,7,3,6]:
 * el 1 y el 2 solo pueden cruzarse en la final, el 1-4 en semifinales.
 */
export function ordenSiembraEstandar(tamano: number): number[] {
  if (!esPotenciaDeDos(tamano) || tamano < 2) {
    throw new Error("El tamaño del cuadro debe ser potencia de 2.");
  }
  let orden = [1, 2];
  while (orden.length < tamano) {
    const suma = orden.length * 2 + 1;
    orden = orden.flatMap((seed) => [seed, suma - seed]);
  }
  return orden;
}

/* ------------------------------------------------------------------ */
/* Generación del cuadro                                               */
/* ------------------------------------------------------------------ */

/** ID determinista: permite enlazar partidos antes de escribir y evita duplicar la llave. */
export function idPartidoPlayoff(
  competenciaId: string,
  ronda: number,
  partidoNumero: number,
): string {
  return `${competenciaId}_po_r${ronda}_n${partidoNumero}`;
}

/**
 * Genera la llave completa (todas las rondas, enlaces y byes).
 * `siembra` viene ordenada: la posición 0 es la cabeza de serie 1.
 * Con un número de parejas que no es potencia de 2, las mejores cabezas de serie
 * reciben bye: avanzan a la ronda 2 ya ubicadas, sin partido que jugar.
 */
export function generarCuadro(competenciaId: string, siembra: string[]): CuadroPlayoff {
  if (!competenciaId) throw new Error("Falta el id de la competencia.");
  if (new Set(siembra).size !== siembra.length) {
    throw new Error("Hay parejas repetidas en la siembra.");
  }

  const cantidad = siembra.length;
  const tamano = calcularTamanoCuadro(cantidad);
  const totalRondas = Math.log2(tamano);
  const posiciones = ordenSiembraEstandar(tamano);
  const parejaDeSeed = (seed: number): string | null =>
    seed <= cantidad ? siembra[seed - 1] : null;

  const partidos: PartidoPlayoff[] = [];
  const porId = new Map<string, PartidoPlayoff>();
  let orden = 1;

  for (let ronda = 1; ronda <= totalRondas; ronda++) {
    const cantidadPartidos = tamano / 2 ** ronda;

    for (let numero = 1; numero <= cantidadPartidos; numero++) {
      const esPrimeraRonda = ronda === 1;
      const pareja1Id = esPrimeraRonda ? parejaDeSeed(posiciones[(numero - 1) * 2]) : null;
      const pareja2Id = esPrimeraRonda ? parejaDeSeed(posiciones[(numero - 1) * 2 + 1]) : null;

      const partido: PartidoPlayoff = {
        id: idPartidoPlayoff(competenciaId, ronda, numero),
        competenciaId,
        tipoPartido: "eliminacion_directa",
        ronda,
        fase: nombreFasePorRonda(ronda, totalRondas),
        partidoNumero: numero,
        orden: orden++,
        pareja1Id,
        pareja2Id,
        estado: "pendiente",
        sets: [],
        esBye: false,
      };

      if (ronda < totalRondas) {
        partido.partidoSiguienteId = idPartidoPlayoff(competenciaId, ronda + 1, Math.ceil(numero / 2));
        partido.ladoSiguiente = numero % 2 === 1 ? 1 : 2;
      }

      partidos.push(partido);
      porId.set(partido.id, partido);
    }
  }

  // Byes: la pareja sin rival avanza ya ubicada en la ronda 2.
  let byes = 0;
  for (const partido of partidos) {
    if (partido.ronda !== 1) continue;
    if (partido.pareja1Id && partido.pareja2Id) continue;

    // Con siembra estándar el rival faltante siempre es la pareja 2.
    const ganadora = partido.pareja1Id ?? partido.pareja2Id;
    if (!ganadora) throw new Error("Cuadro inconsistente: partido sin ninguna pareja.");

    byes++;
    partido.esBye = true;
    partido.estado = "finalizado";
    partido.ganadorParejaId = ganadora;

    const destino = porId.get(partido.partidoSiguienteId!)!;
    if (partido.ladoSiguiente === 1) destino.pareja1Id = ganadora;
    else destino.pareja2Id = ganadora;
  }

  return { competenciaId, cantidadParejas: cantidad, tamano, byes, totalRondas, partidos };
}

/* ------------------------------------------------------------------ */
/* Avance del ganador                                                  */
/* ------------------------------------------------------------------ */

export interface DestinoAvance {
  partidoId: string;
  lado: LadoPareja;
}

/** A dónde va el ganador de un partido. null = es la final. Sin búsquedas ni adivinanzas. */
export function calcularDestinoAvance(
  partido: Pick<PartidoPlayoff, "partidoSiguienteId" | "ladoSiguiente">,
): DestinoAvance | null {
  if (!partido.partidoSiguienteId) return null;
  if (partido.ladoSiguiente !== 1 && partido.ladoSiguiente !== 2) {
    throw new Error("El partido tiene destino pero no indica el lado.");
  }
  return { partidoId: partido.partidoSiguienteId, lado: partido.ladoSiguiente };
}

/**
 * Campos a escribir en el partido destino. Falla si el lado ya está ocupado por
 * otra pareja, para no pisar datos en silencio.
 */
export function datosAvance(
  destino: { pareja1Id: string | null; pareja2Id: string | null },
  lado: LadoPareja,
  parejaId: string,
): { pareja1Id: string } | { pareja2Id: string } {
  const actual = lado === 1 ? destino.pareja1Id : destino.pareja2Id;
  if (actual !== null && actual !== parejaId) {
    throw new Error("El lugar en el partido siguiente ya está ocupado por otra pareja.");
  }
  return lado === 1 ? { pareja1Id: parejaId } : { pareja2Id: parejaId };
}

/** Un partido se puede jugar y cargar solo si tiene las dos parejas y no es bye. */
export function partidoListoParaJugar(
  partido: Pick<PartidoPlayoff, "pareja1Id" | "pareja2Id" | "esBye">,
): boolean {
  return !partido.esBye && Boolean(partido.pareja1Id) && Boolean(partido.pareja2Id);
}

/* ------------------------------------------------------------------ */
/* Siembra                                                             */
/* ------------------------------------------------------------------ */

function mulberry32(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sorteo reproducible (Fisher-Yates con semilla). Para eliminación directa pura. */
export function sortearSiembra(parejaIds: string[], semilla: number): string[] {
  const resultado = [...parejaIds];
  const azar = mulberry32(semilla);
  for (let i = resultado.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }
  return resultado;
}

function contarCrucesMismaZona(siembra: string[], zonaPorPareja: Map<string, string>): number {
  const tamano = calcularTamanoCuadro(siembra.length);
  const posiciones = ordenSiembraEstandar(tamano);
  let cruces = 0;
  for (let i = 0; i < posiciones.length; i += 2) {
    const a = siembra[posiciones[i] - 1];
    const b = siembra[posiciones[i + 1] - 1];
    if (a && b && zonaPorPareja.get(a) === zonaPorPareja.get(b)) cruces++;
  }
  return cruces;
}

/**
 * Siembra para el playoff a partir de los clasificados de las zonas.
 * Orden: posición en la zona, luego victorias, diferencia de sets y de games.
 * Después intercambia parejas de la misma posición para evitar que dos de la
 * misma zona se crucen en la primera ronda (mejor esfuerzo, determinista).
 */
export function sembrarDesdeZonas(clasificados: ClasificadoZona[]): string[] {
  if (new Set(clasificados.map((c) => c.parejaId)).size !== clasificados.length) {
    throw new Error("Hay parejas repetidas entre los clasificados.");
  }

  const ordenados = [...clasificados].sort(
    (a, b) =>
      a.posicion - b.posicion ||
      (b.victorias ?? 0) - (a.victorias ?? 0) ||
      (b.diferenciaSets ?? 0) - (a.diferenciaSets ?? 0) ||
      (b.diferenciaGames ?? 0) - (a.diferenciaGames ?? 0) ||
      a.zonaId.localeCompare(b.zonaId) ||
      a.parejaId.localeCompare(b.parejaId),
  );

  const siembra = ordenados.map((c) => c.parejaId);
  if (siembra.length < 3) return siembra;

  const zonaPorPareja = new Map(ordenados.map((c) => [c.parejaId, c.zonaId]));
  const posicionPorPareja = new Map(ordenados.map((c) => [c.parejaId, c.posicion]));

  let actual = contarCrucesMismaZona(siembra, zonaPorPareja);
  let mejoro = actual > 0;

  // Se prueban primero los intercambios entre las semillas más bajas, para
  // alterar lo mínimo posible la siembra de las mejores parejas.
  while (mejoro) {
    mejoro = false;
    for (let i = siembra.length - 1; i >= 0 && actual > 0; i--) {
      for (let j = i - 1; j >= 0 && actual > 0; j--) {
        if (posicionPorPareja.get(siembra[i]) !== posicionPorPareja.get(siembra[j])) continue;
        [siembra[i], siembra[j]] = [siembra[j], siembra[i]];
        const nuevo = contarCrucesMismaZona(siembra, zonaPorPareja);
        if (nuevo < actual) {
          actual = nuevo;
          mejoro = true;
        } else {
          [siembra[i], siembra[j]] = [siembra[j], siembra[i]];
        }
      }
    }
  }

  return siembra;
}
