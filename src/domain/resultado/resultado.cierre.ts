import type { EstadoPartido, FormatoPartido, Partido } from "../partido/partido.types";
import type { Competencia } from "../competencia/competencia.types";
import type { Resultado, TipoResultado } from "./resultado.types";
import { calcularGanadorDesdeSets, validarResultado } from "./resultado.rules.ts";
import { calcularDestinoAvance, datosAvance } from "../competencia/competencia.playoff.rules.ts";

export type PartidoParaCierre = Pick<
  Partido,
  | "pareja1Id"
  | "pareja2Id"
  | "tipoPartido"
  | "fase"
  | "partidoSiguienteId"
  | "ladoSiguiente"
  | "esBye"
>;

export type DestinoParaCierre = Pick<Partido, "pareja1Id" | "pareja2Id">;

export type CompetenciaParaCierre = Pick<
  Competencia,
  "estado" | "formatoPartidoZona" | "formatoPartidoPlayoff"
>;

export interface EntradaCierreResultado {
  partido: PartidoParaCierre;
  competencia: CompetenciaParaCierre;
  resultado: Omit<Resultado, "id">;
  /** Partido al que avanza el ganador, ya leído. null si no existe o no hay. */
  destino: DestinoParaCierre | null;
}

export interface PlanCierreResultado {
  estadoPartido: EstadoPartido;
  ganadorParejaId: string | null;
  esLlave: boolean;
  /** Qué escribir en el partido siguiente de la llave. null si no hay avance. */
  avance: {
    partidoId: string;
    datos: { pareja1Id: string } | { pareja2Id: string };
  } | null;
  /** Si el partido es la final: la pareja campeona (la competencia pasa a "finalizada"). */
  campeonParejaId: string | null;
}

export function estadoPartidoDesdeResultado(tipo: TipoResultado): EstadoPartido {
  switch (tipo) {
    case "normal":
      return "finalizado";
    case "walkover":
      return "walkover";
    case "abandono":
      return "abandono";
    default:
      return "suspendido";
  }
}

/** Formato de partido que corresponde al partido: zona o playoff. Por defecto "mejor_de_3". */
export function formatoDelPartido(
  partido: Pick<PartidoParaCierre, "tipoPartido">,
  competencia: Pick<CompetenciaParaCierre, "formatoPartidoZona" | "formatoPartidoPlayoff">,
): FormatoPartido {
  return partido.tipoPartido === "eliminacion_directa"
    ? (competencia.formatoPartidoPlayoff ?? "mejor_de_3")
    : (competencia.formatoPartidoZona ?? "mejor_de_3");
}

/**
 * Devuelve las dos parejas del partido o lanza un error claro. Hay que llamarla
 * antes de armar referencias a documentos de parejas: un partido de ronda futura
 * tiene `null` en alguno de los lados.
 */
export function exigirParejasDefinidas(
  partido: Pick<PartidoParaCierre, "pareja1Id" | "pareja2Id" | "esBye">,
): [string, string] {
  if (partido.esBye) {
    throw new Error("Este partido es un bye (la pareja avanza sin jugar): no lleva resultado.");
  }
  if (!partido.pareja1Id || !partido.pareja2Id) {
    throw new Error("Este partido todavía no tiene las dos parejas definidas.");
  }
  if (partido.pareja1Id === partido.pareja2Id) {
    throw new Error("Las parejas del partido no pueden ser iguales.");
  }
  return [partido.pareja1Id, partido.pareja2Id];
}

/**
 * Única fuente de decisión al cerrar un partido con un resultado. No toca
 * Firestore: valida todo y devuelve qué hay que escribir. Lanza un Error con un
 * mensaje listo para mostrar si algo no corresponde.
 */
export function planificarCierreResultado(entrada: EntradaCierreResultado): PlanCierreResultado {
  const { partido, competencia, resultado } = entrada;
  const [pareja1Id, pareja2Id] = exigirParejasDefinidas(partido);
  const esLlave = partido.tipoPartido === "eliminacion_directa";

  if (esLlave && competencia.estado !== "en_curso") {
    throw new Error("La competencia debe estar en curso para cargar resultados de la llave.");
  }
  if (!esLlave && (competencia.estado === "finalizada" || competencia.estado === "cancelada")) {
    throw new Error(
      `La competencia está ${competencia.estado === "finalizada" ? "finalizada" : "cancelada"}: no se pueden cargar resultados.`,
    );
  }

  const formato = formatoDelPartido(partido, competencia);
  const validacion = validarResultado(resultado, formato);
  if (!validacion.valido) {
    throw new Error(validacion.error ?? "El tipo de resultado o el marcador no es válido.");
  }

  if (resultado.ganadorParejaId &&
      resultado.ganadorParejaId !== pareja1Id &&
      resultado.ganadorParejaId !== pareja2Id) {
    throw new Error("La pareja ganadora no pertenece al partido.");
  }

  if (resultado.tipo === "normal") {
    const esperado = calcularGanadorDesdeSets(resultado.sets, formato, pareja1Id, pareja2Id);
    if (resultado.ganadorParejaId !== esperado) {
      throw new Error("La pareja ganadora no coincide con el marcador.");
    }
  }

  if (esLlave && !resultado.oficial) {
    throw new Error("En la llave el resultado debe ser oficial, porque define quién avanza.");
  }

  const plan: PlanCierreResultado = {
    estadoPartido: estadoPartidoDesdeResultado(resultado.tipo),
    ganadorParejaId: resultado.ganadorParejaId ?? null,
    esLlave,
    avance: null,
    campeonParejaId: null,
  };

  // Una suspensión no tiene ganador: el partido queda abierto hasta resolverla.
  if (!esLlave || resultado.tipo === "suspension") return plan;

  const ganador = resultado.ganadorParejaId!;
  const destinoAvance = calcularDestinoAvance(partido);

  if (destinoAvance) {
    if (!entrada.destino) {
      throw new Error("No se encontró el partido siguiente de la llave.");
    }
    plan.avance = {
      partidoId: destinoAvance.partidoId,
      datos: datosAvance(entrada.destino, destinoAvance.lado, ganador),
    };
    return plan;
  }

  if (partido.fase === "final") {
    plan.campeonParejaId = ganador;
    return plan;
  }

  throw new Error(
    "El partido no tiene partido siguiente y no es la final: la llave se generó sin enlaces. Eliminá los partidos y generala de nuevo.",
  );
}
