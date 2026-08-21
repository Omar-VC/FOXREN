export type EstadoPartido =
  | "programado"
  | "en_curso"
  | "finalizado"
  | "suspendido"
  | "cancelado";

export interface Partido {
  id: string;

  faseId: string;
  zonaId?: string;

  pareja1Id: string;
  pareja2Id: string;

  fechaHora: Date;
  cancha?: string;

  estado: EstadoPartido;
}