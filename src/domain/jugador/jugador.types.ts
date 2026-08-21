export type Sexo = "masculino" | "femenino";

export type NivelInicial =
  | "iniciado"
  | "intermedio"
  | "avanzado";

export type LadoJuego = "drive" | "reves";

export type EstadoJugador = "activo" | "inactivo";

export interface Jugador {
  id: string;

  nombre: string;
  apellido: string;
  apodo?: string;

  dni: string;
  ciudad: string;
  sexo: Sexo;

  nivelInicial: NivelInicial;
  ladoJuego: LadoJuego;

  categoriaId: string;

  estado: EstadoJugador;
}