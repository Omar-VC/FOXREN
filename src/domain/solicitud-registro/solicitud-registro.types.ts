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
}