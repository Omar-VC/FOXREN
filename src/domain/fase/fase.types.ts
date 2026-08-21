export type TipoFase =
  | "zonas"
  | "eliminatoria";

export type EstadoFase =
  | "pendiente"
  | "en_curso"
  | "finalizada";

export interface Fase {
  id: string;

  competenciaId: string;

  nombre: string;
  tipo: TipoFase;

  orden: number;

  estado: EstadoFase;
}