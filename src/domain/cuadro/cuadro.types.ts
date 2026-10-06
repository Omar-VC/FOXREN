import type { Partido } from "../partido/partido.types";

export type RondaCuadro =
  | "OCTAVOS"
  | "CUARTOS"
  | "SEMIFINAL"
  | "FINAL";

export interface CuadroPartido extends Partido {
  ronda: RondaCuadro;
  partidoSiguienteId?: string;
  posicionEnCuadro: number;
}