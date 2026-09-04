export type Sexo = "masculino" | "femenino";

export type NivelInicial = "iniciado" | "intermedio" | "avanzado";

export type LadoJuego = "drive" | "reves";

// ahora incluye pendiente y rechazado
export type EstadoJugador = "activo" | "inactivo" | "pendiente" | "rechazado";

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

  categoriaId: string;          // asignada por admin
  categoriaDeclarada: string;   // 👈 nueva: declarada por el jugador

  estado: EstadoJugador;
  fechaRegistro?: Date;         // opcional si lo querés tipar
}
