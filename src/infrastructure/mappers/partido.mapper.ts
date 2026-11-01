import type { PartidoPlayoff } from "../../domain/competencia/competencia.playoff.types";
import type {
  EstadoPartido,
  FasePartido,
  LadoPareja,
  Partido,
  SetResultado,
} from "../../domain/partido/partido.types";

function texto(valor: unknown): string | undefined {
  return typeof valor === "string" ? valor : undefined;
}

function numero(valor: unknown): number | undefined {
  return typeof valor === "number" ? valor : undefined;
}

function fecha(valor: unknown): Date | undefined {
  if (valor instanceof Date) return valor;
  if (
    valor !== null &&
    typeof valor === "object" &&
    "toDate" in valor &&
    typeof valor.toDate === "function"
  ) {
    return valor.toDate();
  }
  return undefined;
}

export const partidoMapper = {
  /**
   * Datos de un partido de llave listos para Firestore: sin `id` (es el id del
   * documento) y sin valores `undefined`, que Firestore rechaza. Los lugares
   * todavía sin pareja se guardan como `null` (por definir).
   */
  toFirestore(partido: PartidoPlayoff): Record<string, unknown> {
    const datos: Record<string, unknown> = {
      competenciaId: partido.competenciaId,
      tipoPartido: partido.tipoPartido,
      ronda: partido.ronda,
      fase: partido.fase,
      partidoNumero: partido.partidoNumero,
      orden: partido.orden,
      pareja1Id: partido.pareja1Id,
      pareja2Id: partido.pareja2Id,
      estado: partido.estado,
      sets: partido.sets,
      esBye: partido.esBye,
    };

    if (partido.partidoSiguienteId !== undefined) {
      datos.partidoSiguienteId = partido.partidoSiguienteId;
    }
    if (partido.ladoSiguiente !== undefined) {
      datos.ladoSiguiente = partido.ladoSiguiente;
    }
    if (partido.ganadorParejaId !== undefined) {
      datos.ganadorParejaId = partido.ganadorParejaId;
    }

    return datos;
  },

  /**
   * Lee un documento de Firestore como `Partido`: los `null` de campos opcionales
   * pasan a `undefined`, las fechas a `Date`, y los lugares sin pareja siguen
   * siendo `null`. Documentos viejos sin `esBye` se leen como `false`.
   */
  fromFirestore(id: string, datos: Record<string, unknown>): Partido {
    const lado = datos.ladoSiguiente;
    const tipoPartido = datos.tipoPartido;
    const ronda = datos.ronda;

    return {
      id,
      competenciaId: String(datos.competenciaId ?? ""),
      zonaId: texto(datos.zonaId),
      faseId: texto(datos.faseId),
      pareja1Id: texto(datos.pareja1Id) ?? null,
      pareja2Id: texto(datos.pareja2Id) ?? null,
      estado: datos.estado as EstadoPartido,
      sets: Array.isArray(datos.sets) ? (datos.sets as SetResultado[]) : [],
      ganadorParejaId: texto(datos.ganadorParejaId),
      orden: numero(datos.orden) ?? 0,
      fechaHora: fecha(datos.fechaHora),
      cancha: texto(datos.cancha),
      notas: texto(datos.notas),
      ronda: typeof ronda === "string" || typeof ronda === "number" ? ronda : undefined,
      fase: texto(datos.fase),
      partidoNumero: numero(datos.partidoNumero),
      tipoPartido:
        tipoPartido === "normal" || tipoPartido === "eliminacion_directa"
          ? (tipoPartido as FasePartido)
          : undefined,
      partidoSiguienteId: texto(datos.partidoSiguienteId),
      ladoSiguiente: lado === 1 || lado === 2 ? (lado as LadoPareja) : undefined,
      partidoPerdedorSiguienteId: texto(datos.partidoPerdedorSiguienteId),
      esBye: datos.esBye === true,
    };
  },
};
