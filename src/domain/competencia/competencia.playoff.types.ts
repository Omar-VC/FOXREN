import type { Partido } from "../partido/partido.types";

export type FaseEliminacion =
  | "final"
  | "semifinal"
  | "cuartos_final"
  | "octavos_final"
  | "dieciseisavos_final"
  | `ronda_de_${number}`
  | "tercer_puesto";

/**
 * Partido de llave. Es un `Partido` (la única entidad persistida) con los
 * campos de llave obligatorios. Reemplaza a `PartidoEliminacion`.
 */
export interface PartidoPlayoff extends Partido {
  tipoPartido: "eliminacion_directa";
  ronda: number;
  fase: FaseEliminacion;
  partidoNumero: number;
  esBye: boolean;
}

export interface CuadroPlayoff {
  competenciaId: string;
  cantidadParejas: number;
  /** Potencia de 2 igual o mayor a la cantidad de parejas. */
  tamano: number;
  byes: number;
  totalRondas: number;
  partidos: PartidoPlayoff[];
}

/** Pareja que clasificó de una zona, con los datos para ordenar la siembra. */
export interface ClasificadoZona {
  parejaId: string;
  zonaId: string;
  /** 1 = primera de su zona. */
  posicion: number;
  victorias?: number;
  diferenciaSets?: number;
  diferenciaGames?: number;
}
