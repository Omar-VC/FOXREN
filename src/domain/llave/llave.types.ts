import type { Partido } from "../partido/partido.types";

export type RondaLlave = "CUARTOS" | "SEMIFINAL" | "FINAL";

export interface LlavePartido extends Partido {
  ronda: RondaLlave;
  partidoSiguienteId?: string; // ID del partido de la siguiente ronda al que avanza el ganador
  posicionEnCuadro: number;    // Para ordenar visualmente en la llave (1, 2, 3...)
}