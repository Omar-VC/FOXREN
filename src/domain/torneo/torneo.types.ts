// src/domain/torneo/torneo.types.ts

export type EstadoTorneo = 'PENDIENTE_APROBACION' | 'BORRADOR' | 'INSCRIPCION_ABIERTA' | 'EN_CURSO' | 'FINALIZADO' | 'RECHAZADO';

export interface Torneo {
  id: string;
  circuitoId: string;
  nombre: string;
  sede: string;
  fechaInicio: Date;
  fechaFin: Date;
  categoriasValidas: string[];
  precioInscripcionBase?: number; // Lo que cobra el organizador por pareja (ej: 20000)
  feeFoxrenPorPareja?: number;    // Tu comisión por pareja (ej: 10000)
  canonAprobacion?: number;       // Canon por habilitar el torneo (opcional)
  estado: EstadoTorneo;
  organizadorDni?: string;        // DNI del organizador responsable
  descripcion?: string | null;
  organizadorIds?: string[];
  llaveId?: string;
  organizadorLlaveId?: string;
  fechaCreacion?: Date;
}