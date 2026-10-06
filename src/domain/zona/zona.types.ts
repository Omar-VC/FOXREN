export interface TablaPosicionPareja {
  parejaId: string;
  partidosJugados: number;
  partidosGanados: number;
  partidosPerdidos: number;
  setsGanados: number;
  setsPerdidos: number;
  diferenciaSets: number;
  juegosGanados: number;
  juegosPerdidos: number;
  diferenciaJuegos: number;
  puntos: number;
}

export interface Zona {
  id: string;
  competenciaId: string;
  nombre: string;
  parejasIds: string[];
}