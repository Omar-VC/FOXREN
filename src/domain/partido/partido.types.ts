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

export interface Partido {
  id: string;

  competenciaId: string;

  zonaId?: string;

  faseId?: string;

  pareja1Id: string;

  pareja2Id: string;

  estado: EstadoPartido;

  sets: SetResultado[];

  ganadorParejaId?: string;

  orden: number;

  fechaHora?: Date;

  cancha?: string;

  notas?: string;
}