
// src/domain/torneo/torneo.types.ts

export type EstadoTorneo = 'BORRADOR' | 'INSCRIPCION_ABIERTA' | 'EN_CURSO' | 'FINALIZADO';

export interface Torneo {
  id: string;
  circuitoId: string;
  nombre: string;
  sede: string;
  fechaInicio: Date;
  fechaFin: Date;
  categoriasValidas: string[];
  estado: EstadoTorneo;
  descripcion?: string | null;
  organizadorIds?: string[];
  llaveId?: string;
  organizadorLlaveId?: string;
  fechaCreacion?: Date;
}