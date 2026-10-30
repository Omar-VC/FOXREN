import type { Resultado } from "../resultado/resultado.types";
import { validarTipoResultado } from "../resultado/resultado.rules.ts";
import type { Partido } from "../partido/partido.types";
import type { Zona } from "./competencia.zonas.types";
import type { CriterioDesempateZona } from "./competencia.types";
import { CRITERIOS_DESEMPATE_BASE } from "./competencia.reglamento.rules.ts";

export interface FilaTablaZona {
  parejaId: string;
  posicion: number;
  partidosJugados: number;
  victorias: number;
  derrotas: number;
  setsGanados: number;
  setsPerdidos: number;
  diferenciaSets: number;
  gamesGanados: number;
  gamesPerdidos: number;
  diferenciaGames: number;
}

export interface TablaZona {
  filas: FilaTablaZona[];
  partidosPendientes: number;
  completa: boolean;
}

export interface ClasificacionZona {
  clasificados: string[];
  empateEnCorte: string[];
  bloqueadaPorEmpate: boolean;
}

function valorCriterio(fila: FilaTablaZona, criterio: CriterioDesempateZona): number {
  if (criterio === "victorias") return fila.victorias;
  if (criterio === "diferencia_sets") return fila.diferenciaSets;
  return fila.diferenciaGames;
}

function compararRendimiento(
  a: FilaTablaZona,
  b: FilaTablaZona,
  criterios: CriterioDesempateZona[],
): number {
  for (const criterio of criterios) {
    const diferencia = valorCriterio(b, criterio) - valorCriterio(a, criterio);
    if (diferencia !== 0) return diferencia;
  }
  return 0;
}

function criteriosValidos(criterios: CriterioDesempateZona[]): boolean {
  return criterios.length > 0 &&
    criterios.every((criterio) => CRITERIOS_DESEMPATE_BASE.includes(criterio)) &&
    new Set(criterios).size === criterios.length;
}

export function calcularTablaZona(
  zona: Zona,
  partidos: Partido[],
  resultados: Resultado[],
  criteriosDesempate: CriterioDesempateZona[] = CRITERIOS_DESEMPATE_BASE,
): TablaZona {
  if (!criteriosValidos(criteriosDesempate)) {
    throw new Error("La configuración de criterios de desempate no es válida.");
  }
  const parejaIds = [...new Set(zona.parejaIds)];
  if (parejaIds.length !== zona.parejaIds.length || parejaIds.length < 2) {
    throw new Error("La zona contiene parejas duplicadas o insuficientes.");
  }

  const filas = new Map<string, FilaTablaZona>(parejaIds.map((parejaId) => [
    parejaId,
    {
      parejaId,
      posicion: 0,
      partidosJugados: 0,
      victorias: 0,
      derrotas: 0,
      setsGanados: 0,
      setsPerdidos: 0,
      diferenciaSets: 0,
      gamesGanados: 0,
      gamesPerdidos: 0,
      diferenciaGames: 0,
    },
  ]));

  const resultadosPorPartido = new Map<string, Resultado>();
  for (const resultado of resultados) {
    if (resultadosPorPartido.has(resultado.partidoId)) {
      throw new Error("Hay más de un resultado asociado al mismo partido.");
    }
    resultadosPorPartido.set(resultado.partidoId, resultado);
  }

  const partidosZona = partidos.filter((partido) => partido.zonaId === zona.id);
  const enfrentamientos = new Set<string>();
  let partidosPendientes = 0;

  for (const partido of partidosZona) {
    // 🛡️ Agregar esta guarda para ignorar partidos de playoff sin parejas definidas
    if (!partido.pareja1Id || !partido.pareja2Id) {
      continue;
    }

    if (!filas.has(partido.pareja1Id!) || !filas.has(partido.pareja2Id!) ||
        partido.pareja1Id === partido.pareja2Id) {
      throw new Error("El partido contiene parejas ajenas o repetidas en la zona.");
    }
    const claveEnfrentamiento = [partido.pareja1Id, partido.pareja2Id].sort().join("|");
    if (enfrentamientos.has(claveEnfrentamiento)) {
      throw new Error("La zona tiene un enfrentamiento duplicado.");
    }
    enfrentamientos.add(claveEnfrentamiento);

    const resultado = resultadosPorPartido.get(partido.id);
    if (!resultado) {
      partidosPendientes++;
      continue;
    }
    if (!validarTipoResultado(resultado)) {
      throw new Error("Un resultado no cumple las reglas deportivas del partido.");
    }
    const estadoEsperado = resultado.tipo === "normal"
      ? "finalizado"
      : resultado.tipo === "walkover"
        ? "walkover"
        : resultado.tipo === "abandono"
          ? "abandono"
          : "suspendido";
    if (partido.estado !== estadoEsperado) {
      throw new Error("El estado del partido no coincide con su resultado registrado.");
    }
    if (!resultado.oficial || resultado.tipo === "suspension" ||
        partido.estado === "suspendido") {
      partidosPendientes++;
      continue;
    }
    if (!resultado.ganadorParejaId ||
        (resultado.ganadorParejaId !== partido.pareja1Id &&
          resultado.ganadorParejaId !== partido.pareja2Id) ||
        partido.ganadorParejaId !== resultado.ganadorParejaId) {
      throw new Error("El resultado oficial no coincide con el partido.");
    }

    const fila1 = filas.get(partido.pareja1Id!)!;
    const fila2 = filas.get(partido.pareja2Id!)!;
    fila1.partidosJugados++;
    fila2.partidosJugados++;
    if (resultado.ganadorParejaId === partido.pareja1Id) {
      fila1.victorias++;
      fila2.derrotas++;
    } else {
      fila2.victorias++;
      fila1.derrotas++;
    }

    for (const set of resultado.sets) {
      const setsPareja1 = set.juegosPareja1 > set.juegosPareja2 ? 1 : 0;
      const setsPareja2 = set.juegosPareja2 > set.juegosPareja1 ? 1 : 0;
      fila1.setsGanados += setsPareja1;
      fila1.setsPerdidos += setsPareja2;
      fila2.setsGanados += setsPareja2;
      fila2.setsPerdidos += setsPareja1;
      fila1.gamesGanados += set.juegosPareja1;
      fila1.gamesPerdidos += set.juegosPareja2;
      fila2.gamesGanados += set.juegosPareja2;
      fila2.gamesPerdidos += set.juegosPareja1;
    }
  }

  const enfrentamientosEsperados = parejaIds.length * (parejaIds.length - 1) / 2;
  partidosPendientes += Math.max(0, enfrentamientosEsperados - enfrentamientos.size);

  const filasOrdenadas = [...filas.values()]
    .map((fila) => ({
      ...fila,
      diferenciaSets: fila.setsGanados - fila.setsPerdidos,
      diferenciaGames: fila.gamesGanados - fila.gamesPerdidos,
    }))
    .sort((a, b) => compararRendimiento(a, b, criteriosDesempate) || a.parejaId.localeCompare(b.parejaId));

  filasOrdenadas.forEach((fila, indice) => {
    fila.posicion = indice > 0 && compararRendimiento(
      fila,
      filasOrdenadas[indice - 1],
      criteriosDesempate,
    ) === 0
      ? filasOrdenadas[indice - 1].posicion
      : indice + 1;
  });

  return {
    filas: filasOrdenadas,
    partidosPendientes,
    completa: partidosPendientes === 0,
  };
}

export function clasificarParejasZona(
  tabla: TablaZona,
  cantidadClasifican: number,
  criteriosDesempate: CriterioDesempateZona[] = CRITERIOS_DESEMPATE_BASE,
): ClasificacionZona {
  if (!criteriosValidos(criteriosDesempate)) {
    throw new Error("La configuración de criterios de desempate no es válida.");
  }
  if (!tabla.completa) {
    throw new Error("No se puede clasificar hasta completar todos los partidos oficiales de la zona.");
  }
  if (!Number.isInteger(cantidadClasifican) || cantidadClasifican < 1 ||
      cantidadClasifican > tabla.filas.length) {
    throw new Error("La cantidad de parejas clasificadas no es válida.");
  }

  const corte = tabla.filas[cantidadClasifican - 1];
  const mejores = tabla.filas.filter((fila) => compararRendimiento(fila, corte, criteriosDesempate) < 0);
  const empatadas = tabla.filas.filter((fila) => compararRendimiento(fila, corte, criteriosDesempate) === 0);
  const bloqueadaPorEmpate = mejores.length + empatadas.length > cantidadClasifican;

  return {
    clasificados: bloqueadaPorEmpate
      ? mejores.map((fila) => fila.parejaId)
      : [...mejores, ...empatadas].map((fila) => fila.parejaId),
    empateEnCorte: bloqueadaPorEmpate ? empatadas.map((fila) => fila.parejaId) : [],
    bloqueadaPorEmpate,
  };
}
