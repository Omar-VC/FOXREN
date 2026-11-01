export type EstadoPartido =
  | "pendiente"
  | "en_juego"
  | "finalizado"
  | "walkover"
  | "abandono"
  | "suspendido";

/** Formatos válidos de partido: un set, o mejor de 3 sets. */
export type FormatoPartido = "un_set" | "mejor_de_3";

/**
 * "normal": set de games (6 con diferencia de 2, 7-5, o 7-6 con tie-break a 7).
 * "super_tiebreak": reemplaza al tercer set de un mejor de 3 (a 10 puntos).
 *   Convención: juegosPareja1/2 valen 1-0 o 0-1 (set ganado), y los puntos reales
 *   van en tieBreakPareja1/2. Así el conteo de sets ganados sigue siendo
 *   "juegosPareja1 > juegosPareja2".
 */
export type TipoSet = "normal" | "super_tiebreak";

export interface SetResultado {
  setNumero: number;

  juegosPareja1: number;

  juegosPareja2: number;

  tieBreakPareja1?: number;

  tieBreakPareja2?: number;

  /** Ausente = "normal" (compatibilidad con documentos existentes). */
  tipo?: TipoSet;
}

export type FasePartido = "normal" | "eliminacion_directa";

export type LadoPareja = 1 | 2;

export interface Partido {
  id: string;

  competenciaId: string;

  zonaId?: string;

  faseId?: string;

  /** null = todavía no se sabe quién llega (o bye, ver esBye). */
  pareja1Id: string | null;

  pareja2Id: string | null;

  estado: EstadoPartido;

  sets: SetResultado[];

  ganadorParejaId?: string;

  orden: number;

  fechaHora?: Date;

  cancha?: string;

  notas?: string;

  /** Ronda de la llave (1 = primera ronda). */
  ronda?: string | number;

  /** Fase de la competencia (ej: "semifinal", "final"). */
  fase?: string;

  /** Número de partido dentro de la ronda (empieza en 1). */
  partidoNumero?: number;

  /** Indica si es un partido de eliminación directa o de zona. */
  tipoPartido?: FasePartido;

  /** Partido al que avanza el ganador. Ausente en la final. */
  partidoSiguienteId?: string;

  /** Lado (pareja 1 o 2) que ocupa el ganador en el partido siguiente. */
  ladoSiguiente?: LadoPareja;

  /** Reservado para tercer puesto: partido al que va el perdedor. */
  partidoPerdedorSiguienteId?: string;

  /** Partido sin rival: la pareja avanza directo. No se juega ni se carga resultado. */
  esBye?: boolean;
}
