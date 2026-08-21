export type TipoResultado =
  | "normal"
  | "walkover"
  | "abandono"
  | "suspension";

export interface SetResultado {
  pareja1: number;
  pareja2: number;
}

export interface Resultado {
  id: string;

  partidoId: string;

  tipo: TipoResultado;

  sets: SetResultado[];

  ganadorParejaId: string;

  oficial: boolean;

  fechaRegistro: Date;
}