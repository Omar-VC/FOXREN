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
  ciudad: string;
  sexo: "masculino" | "femenino";

  nivelInicial: "iniciado" | "intermedio" | "avanzado";
  ladoJuego: "drive" | "reves";

  estado: EstadoSolicitudRegistro;

  fechaSolicitud: Date;
  fechaResolucion?: Date;
}