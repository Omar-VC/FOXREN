import type { SetResultado } from "../partido/partido.types";

export type TipoResultado =
  | "normal"
  | "walkover"
  | "abandono"
  | "suspension";

export interface Resultado {
  id: string;
  partidoId: string;
  tipo: TipoResultado;
  sets: SetResultado[];
  ganadorParejaId?: string;
  oficial: boolean;
  fechaRegistro: Date;
}