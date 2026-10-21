export type Sexo = "masculino" | "femenino";

export type LadoJuego = "drive" | "reves";

export type EstadoJugador = "activo" | "inactivo";

export type OrigenDecisionPublicacion =
  | "formulario_publico"
  | "sin_decision_explicita";

export type EstadoConsentimientoPublicacion =
  | "pendiente_verificacion"
  | "vigente"
  | "no_autorizado"
  | "sin_decision"
  | "revocado";

/** Declaración privada. No equivale por sí sola a identidad verificada ni publicación. */
export interface ConsentimientoPublicacion {
  autorizaPerfil: boolean;
  autorizaApodo: boolean;
  origen: OrigenDecisionPublicacion;
  estado: EstadoConsentimientoPublicacion;
  fechaDecision?: Date;
  fechaVerificacion?: Date;
  fechaRetiro?: Date;
  metodoVerificacion?: string;
  verificadoPorUid?: string;
  metodoRetiro?: string;
  revocadoPorUid?: string;
}

/** Lista blanca de campos de una futura proyección pública; no contiene IDs internos. */
export interface JugadorPublico {
  idPublico: string;
  nombre: string;
  apellido: string;
  apodo?: string;
  categoria?: string;
}

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

  consentimientoPublicacion?: ConsentimientoPublicacion;
}
