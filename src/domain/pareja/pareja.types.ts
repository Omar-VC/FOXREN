export type EstadoPareja =
  | "activa"
  | "inactiva"
  | "descalificada";

export interface Pareja {
  id: string;

  competenciaId: string;

  jugador1Id: string;

  jugador2Id: string;

  estado: EstadoPareja;

  creadoEn: Date;
}