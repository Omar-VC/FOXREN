export type Sexo = "masculino" | "femenino";

export type LadoJuego = "drive" | "reves";

export type EstadoJugador =
  | "pendiente"
  | "activo"
  | "inactivo"
  | "rechazado";

export interface Jugador {
  id: string;

  dni: string;

  nombre: string;

  apellido: string;

  apodo?: string;

  sexo: Sexo;

  ciudad: string;

  provincia: string;

  fechaNacimiento?: Date;

  ladoJuego: LadoJuego;

  categoriaDeclarada: string;

  categoriaId?: string;

  estado: EstadoJugador;

  fechaRegistro: Date;
}