export type ResultadoHistorial =
  | "participacion"
  | "victoria"
  | "derrota"
  | "abandono"
  | "walkover";

export interface RegistroHistorial {
  jugadorId: string;
  torneoId: string;
  competenciaId: string;
  parejaId: string;
  categoriaId: string;
  fecha: Date;
  resultado: ResultadoHistorial;
}