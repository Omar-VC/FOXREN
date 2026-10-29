export type EstadoPartido =
  | "pendiente"
  | "en_juego"
  | "finalizado"
  | "walkover"
  | "abandono"
  | "suspendido";

export interface SetResultado {
  setNumero: number;

  juegosPareja1: number;

  juegosPareja2: number;

  tieBreakPareja1?: number;

  tieBreakPareja2?: number;
}

export type FasePartido = "normal" | "eliminacion_directa";

export interface Partido {
  id: string;

  competenciaId: string;

  zonaId?: string;

  faseId?: string;

  pareja1Id: string | null;

  pareja2Id: string | null;

  estado: EstadoPartido;

  sets: SetResultado[];

  ganadorParejaId?: string;

  orden: number;

  fechaHora?: Date;

  cancha?: string;

  notas?: string;

  /** Campo para competencias de eliminación directa: indica la ronda o fase */
  ronda?: string | number;

  /** Fase de la competencia (ej: "semifinal", "final") */
  fase?: string;

  /** Número de partido dentro de la ronda */
  partidoNumero?: number;

  /** Indica si es un partido de eliminación directa o de zona */
  tipoPartido?: FasePartido;
}