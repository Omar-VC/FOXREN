export type EstadoPartido =
  | "PENDIENTE"
  | "EN_JUEGO"
  | "FINALIZADO"
  | "WALKOVER"
  | "ABANDONO"
  | "SUSPENDIDO";

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
  
  nombrePareja1?: string;
  nombrePareja2?: string;

  estado: EstadoPartido;
  sets: SetResultado[];
  ganadorParejaId?: string;
  
  orden: number;
  fechaHora?: Date;
  cancha?: string;
  notas?: string;
}