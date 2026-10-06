export interface RankingJugador {
  jugadorId: string;

  temporada: string;

  sexo: "masculino" | "femenino";

  puntos: number;

  posicion: number;

  actualizadoEn: Date;
}