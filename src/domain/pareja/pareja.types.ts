export interface JugadorResumen {
  id?: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  dni?: string;
}

export interface Pareja {
  id: string;
  jugador1Id: string;
  jugador2Id: string;
  competenciaId: string;
  estadoPago?: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  comprobantePagoUrl?: string;
  jugador1?: JugadorResumen;
  jugador2?: JugadorResumen;
  creadoEn?: any;
}