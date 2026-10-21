import type { OrigenDecisionPublicacion } from "../jugador/jugador.types";

export type EstadoSolicitudRegistro =
  | "pendiente"
  | "aprobada"
  | "rechazada";

export interface SolicitudRegistro {
  id: string;

  nombre: string;

  apellido: string;

  apodo?: string;

  dni: string;

  sexo: "masculino" | "femenino";

  ciudad: string;

  provincia: string;

  fechaNacimiento?: Date;

  ladoJuego: "drive" | "reves";

  categoriaDeclarada: string;

  estado: EstadoSolicitudRegistro;

  fechaSolicitud: Date;

  fechaResolucion?: Date;

  /** ID del jugador creado al aprobar; permite reconocer reintentos idempotentes. */
  jugadorId?: string;

  /** Opcionales para leer solicitudes antiguas; su ausencia nunca significa autorización. */
  autorizaPublicacionPerfil?: boolean;

  autorizaPublicacionApodo?: boolean;

  fechaDecisionPublicacion?: Date;

  origenDecisionPublicacion?: OrigenDecisionPublicacion;
}
