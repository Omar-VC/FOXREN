export type EstadoAutorizacion = 'ACTIVA' | 'USADA' | 'VENCIDAANULADA';

export interface AutorizacionToken {
  id: string;
  organizadorId: string;
  token: string;              // La llave secreta que ingresa en el modal
  estado: EstadoAutorizacion;
  torneoAsignadoId?: string;  // ID del torneo creado con esta llave (si ya fue usada)
  fechaCreacion: string;
  fechaExpiracion?: string;
}