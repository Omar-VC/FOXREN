import type { Partido } from "../partido/partido.types";

// ANTES: RondaLlave
export type RondaCuadro = "CUARTOS" | "SEMIFINAL" | "FINAL";

// ANTES: LlavePartido
export interface CuadroPartido extends Partido {
  ronda: RondaCuadro;
  partidoSiguienteId?: string; 
  posicionEnCuadro: number;    
}