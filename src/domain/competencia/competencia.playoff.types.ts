export type FaseEliminacion = "octavos_final" | "cuartos_final" | "semifinal" | "final" | "tercer_puesto";

export interface PartidoEliminacion {
  competenciaId: string;
  fase: FaseEliminacion;
  ronda: number;
  partidoNumero: number;
  pareja1Id: string;
  pareja2Id: string;
  estado: "pendiente" | "en_juego" | "finalizado" | "walkover" | "abandono" | "suspendido";
  sets: {
    setNumero: number;
    juegosPareja1: number;
    juegosPareja2: number;
    tieBreakPareja1?: number;
    tieBreakPareja2?: number;
  }[];
  ganadorParejaId?: string;
  orden: number;
  fechaHora?: Date;
  cancha?: string;
  notas?: string;
}

export interface CuadroEliminacion {
  competenciaId: string;
  parejasIds: string[];
  fases: FaseEliminacion[];
  partidos: PartidoEliminacion[];
  totalRondas: number;
}
